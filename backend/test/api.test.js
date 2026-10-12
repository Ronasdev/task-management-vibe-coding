import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

// Base dédiée aux tests, supprimée à la fin. Ex. : docker run -d -p 27017:27017 mongo:7
const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow-test';

let server;
let base;
let disconnectDB;

before(async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGO_URI: TEST_MONGO_URI,
    JWT_ACCESS_SECRET: 'test-access-secret-0123456789-abcdefghijkl',
    JWT_REFRESH_SECRET: 'test-refresh-secret-0123456789-abcdefghijk',
  });
  const db = await import('../src/config/db.js');
  const { createApp } = await import('../src/app.js');
  disconnectDB = db.disconnectDB;
  await db.connectDB();
  await mongoose.connection.dropDatabase();
  await mongoose.syncIndexes();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server?.close();
  await mongoose.connection.dropDatabase();
  await disconnectDB?.();
});

async function call(method, path, { body, token, cookie } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(cookie && { Cookie: cookie }),
    },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return {
    status: res.status,
    data: text ? JSON.parse(text) : null,
    cookie: res.headers.get('set-cookie')?.split(';')[0],
  };
}

const alice = { name: 'Alice Martin', email: 'alice@example.com', password: 'Secret123' };
const bob = { name: 'Bob Durand', email: 'bob@example.com', password: 'Secret123' };

describe('Authentification', () => {
  test('inscription valide → 201 + token + cookie httpOnly', async () => {
    const res = await call('POST', '/auth/register', { body: alice });
    assert.equal(res.status, 201);
    assert.ok(res.data.accessToken);
    assert.equal(res.data.user.email, alice.email);
    assert.equal(res.data.user.password, undefined);
    assert.match(res.cookie, /^refresh_token=/);
  });

  test('e-mail déjà utilisé → 409', async () => {
    const res = await call('POST', '/auth/register', { body: alice });
    assert.equal(res.status, 409);
  });

  test('mot de passe faible → 400 avec détails', async () => {
    const res = await call('POST', '/auth/register', { body: { ...bob, password: 'faible' } });
    assert.equal(res.status, 400);
    assert.ok(res.data.error.details.some((d) => d.field === 'password'));
  });

  test('mauvais mot de passe → 401', async () => {
    const res = await call('POST', '/auth/login', { body: { email: alice.email, password: 'Wrong1234' } });
    assert.equal(res.status, 401);
  });

  test('connexion, /me, refresh puis logout révoque la session', async () => {
    const login = await call('POST', '/auth/login', { body: { email: alice.email, password: alice.password } });
    assert.equal(login.status, 200);

    const me = await call('GET', '/auth/me', { token: login.data.accessToken });
    assert.equal(me.status, 200);
    assert.equal(me.data.user.name, alice.name);

    const refreshed = await call('POST', '/auth/refresh', { cookie: login.cookie });
    assert.equal(refreshed.status, 200);
    assert.ok(refreshed.data.accessToken);

    const logout = await call('POST', '/auth/logout', { cookie: refreshed.cookie });
    assert.equal(logout.status, 204);

    const reuse = await call('POST', '/auth/refresh', { cookie: refreshed.cookie });
    assert.equal(reuse.status, 401);
  });

  test('routes protégées sans token / token invalide → 401', async () => {
    assert.equal((await call('GET', '/tasks')).status, 401);
    assert.equal((await call('GET', '/tasks', { token: 'abc.def.ghi' })).status, 401);
  });
});

describe('Tâches', () => {
  let token;
  let bobToken;
  let taskId;

  before(async () => {
    token = (await call('POST', '/auth/login', { body: { email: alice.email, password: alice.password } })).data.accessToken;
    bobToken = (await call('POST', '/auth/register', { body: bob })).data.accessToken;
  });

  test('création avec valeurs par défaut', async () => {
    const res = await call('POST', '/tasks', { token, body: { title: 'Écrire le rapport' } });
    assert.equal(res.status, 201);
    assert.equal(res.data.task.status, 'todo');
    assert.equal(res.data.task.priority, 'medium');
    taskId = res.data.task.id;
  });

  test('création invalide → 400', async () => {
    assert.equal((await call('POST', '/tasks', { token, body: { title: '' } })).status, 400);
    assert.equal((await call('POST', '/tasks', { token, body: { title: 'x', status: 'nope' } })).status, 400);
    assert.equal((await call('POST', '/tasks', { token, body: { title: 'x', owner: 'hack' } })).status, 400);
  });

  test('modification + passage à "done" renseigne completedAt', async () => {
    const res = await call('PATCH', `/tasks/${taskId}`, { token, body: { status: 'done', priority: 'high' } });
    assert.equal(res.status, 200);
    assert.equal(res.data.task.status, 'done');
    assert.ok(res.data.task.completedAt);

    const back = await call('PATCH', `/tasks/${taskId}`, { token, body: { status: 'todo' } });
    assert.equal(back.data.task.completedAt, null);
  });

  test('isolation : un autre utilisateur ne voit ni ne modifie la tâche', async () => {
    assert.equal((await call('GET', `/tasks/${taskId}`, { token: bobToken })).status, 404);
    assert.equal((await call('PATCH', `/tasks/${taskId}`, { token: bobToken, body: { title: 'piraté' } })).status, 404);
    assert.equal((await call('DELETE', `/tasks/${taskId}`, { token: bobToken })).status, 404);
    const list = await call('GET', '/tasks', { token: bobToken });
    assert.equal(list.data.pagination.total, 0);
  });

  test('liste : filtres, recherche, tri par priorité, pagination', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    await call('POST', '/tasks', { token, body: { title: 'Appeler le client', priority: 'low' } });
    await call('POST', '/tasks', { token, body: { title: 'Payer la facture', priority: 'high', status: 'in_progress', dueDate: yesterday } });

    const all = await call('GET', '/tasks?sort=priority&order=desc', { token });
    assert.equal(all.data.pagination.total, 3);
    assert.deepEqual(all.data.tasks.map((t) => t.priority), ['high', 'high', 'low']);

    const search = await call('GET', '/tasks?q=FACT', { token });
    assert.equal(search.data.tasks.length, 1);

    const inProgress = await call('GET', '/tasks?status=in_progress', { token });
    assert.equal(inProgress.data.tasks.length, 1);

    const overdue = await call('GET', '/tasks?overdue=true', { token });
    assert.equal(overdue.data.tasks.length, 1);

    const paged = await call('GET', '/tasks?limit=2&page=2', { token });
    assert.equal(paged.data.tasks.length, 1);
    assert.equal(paged.data.pagination.pages, 2);

    const regex = await call('GET', `/tasks?q=${encodeURIComponent('.*(')}`, { token });
    assert.equal(regex.status, 200);
    assert.equal(regex.data.tasks.length, 0);
  });

  test('statistiques du tableau de bord', async () => {
    const res = await call('GET', '/tasks/stats', { token });
    assert.equal(res.status, 200);
    assert.equal(res.data.total, 3);
    assert.equal(res.data.status.in_progress, 1);
    assert.equal(res.data.overdue, 1);
    assert.equal(res.data.recent.length, 3);
  });

  test('suppression puis 404', async () => {
    assert.equal((await call('DELETE', `/tasks/${taskId}`, { token })).status, 204);
    assert.equal((await call('GET', `/tasks/${taskId}`, { token })).status, 404);
    assert.equal((await call('GET', '/tasks/not-an-id', { token })).status, 400);
  });
});
