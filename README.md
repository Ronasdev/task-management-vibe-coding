# TaskFlow — Gestion de tâches SaaS

Application web complète de gestion de tâches : inscription / connexion, authentification JWT, CRUD de tâches avec statuts et priorités, tableau de bord, routes protégées, interface responsive avec thème clair / sombre.

## Stack

| Couche | Technologies |
| --- | --- |
| Frontend | React 18, React Router 6, Vite, Tailwind CSS, Axios, lucide-react |
| Backend | Node.js 20+, Express 4, Mongoose 8, Zod, JWT, bcrypt |
| Base de données | MongoDB 7 |
| Production | Docker, Docker Compose, Nginx (SPA + reverse proxy `/api`) |

## Fonctionnalités

- **Comptes** : inscription (validation du mot de passe), connexion, déconnexion, restauration automatique de la session.
- **Authentification JWT** :
  - *access token* court (15 min) gardé **en mémoire** côté client (jamais dans `localStorage`) ;
  - *refresh token* long (7 j) dans un **cookie `httpOnly`, `SameSite=Strict`**, limité au chemin `/api/auth` ;
  - rotation à chaque rafraîchissement, renouvellement transparent sur 401 ;
  - la déconnexion révoque toutes les sessions (`tokenVersion`).
- **Tâches** : création, modification, suppression (avec confirmation), statut *À faire / En cours / Terminée* (changement en un clic), priorité, échéance, description.
- **Liste** : onglets par statut avec compteurs, filtre « en retard », filtre de priorité, recherche, tri, pagination — l'état est conservé dans l'URL.
- **Tableau de bord** : totaux, taux de complétion, répartition par statut et priorité, échéances des 7 prochains jours, activité récente.
- **Routes protégées** côté client (`ProtectedRoute` / `GuestRoute`) et côté API (middleware `requireAuth` + isolation stricte des données par utilisateur).
- **UI** : responsive (mobile → desktop), thème sombre, états de chargement / vide / erreur, notifications, accessibilité clavier.

## Sécurité

Helmet, CORS restreint, rate limiting (global + anti brute-force sur login/inscription), validation stricte de toutes les entrées (Zod, champs inconnus refusés), échappement des recherches regex, bcrypt (coût 12), protection contre l'énumération par timing au login, taille de requête limitée, CSP et en-têtes de sécurité via Nginx, conteneur API exécuté en utilisateur non-root, arrêt gracieux.

## Démarrage en développement

Prérequis : Node.js ≥ 20 et une instance MongoDB (locale ou `docker run -d -p 27017:27017 mongo:7`).

```bash
# 1. API
cd backend
cp .env.example .env        # puis remplacez les secrets JWT
npm install
npm run dev                 # http://localhost:4000

# 2. Frontend (autre terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxy /api → :4000)
```

## Tests

```bash
# Avec une MongoDB locale sur le port 27017 (base "taskflow-test", vidée à chaque lancement)
cd backend
npm test

# Ou directement dans le réseau Docker de la stack lancée par docker compose
docker run --rm --network taskflow_default -v "$PWD/backend:/app" -w /app \
  -e TEST_MONGO_URI=mongodb://mongo:27017/taskflow-test node:22-alpine npm test
```

Tests d'intégration : inscription, connexion, refresh, révocation, routes protégées, validation, CRUD, isolation entre utilisateurs, filtres, tri, pagination, statistiques.

## Déploiement en production (Docker)

```bash
cp .env.example .env
# Générez deux secrets différents :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Renseignez JWT_ACCESS_SECRET, JWT_REFRESH_SECRET et PUBLIC_URL dans .env

docker compose up -d --build
```

L'application est servie sur `http://localhost:8080` (configurable via `WEB_PORT`).

Architecture : `web` (Nginx) sert le build React et relaie `/api` vers `api` (Express), qui parle à `mongo`. Seul Nginx est exposé ; le front et l'API partagent la même origine, ce qui permet le cookie `SameSite=Strict`.

**Checklist production**

- Placez l'application derrière **HTTPS** (Caddy, Traefik, load balancer…) : en production le cookie de refresh est `Secure`. Pour un test en HTTP hors `localhost`, définissez `COOKIE_SECURE=false` dans `.env` (déconseillé en production réelle).
- Si un proxy supplémentaire est placé devant Nginx, augmentez `TRUST_PROXY` en conséquence.
- Utilisez une base MongoDB managée ou sécurisée par authentification (`MONGO_URI`) et sauvegardez le volume `mongo-data`.
- Endpoint de supervision : `GET /api/health`.

## API

Toutes les routes `/api/tasks` exigent l'en-tête `Authorization: Bearer <accessToken>`.

| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Inscription `{ name, email, password }` |
| POST | `/api/auth/login` | Connexion `{ email, password }` |
| POST | `/api/auth/refresh` | Nouveau access token (cookie) |
| POST | `/api/auth/logout` | Déconnexion + révocation |
| GET | `/api/auth/me` | Utilisateur courant |
| GET | `/api/tasks` | Liste — `status`, `priority`, `q`, `overdue`, `sort`, `order`, `page`, `limit` |
| GET | `/api/tasks/stats` | Statistiques du tableau de bord |
| POST | `/api/tasks` | Créer `{ title, description?, status?, priority?, dueDate? }` |
| GET | `/api/tasks/:id` | Détail |
| PATCH | `/api/tasks/:id` | Modifier (champs partiels) |
| DELETE | `/api/tasks/:id` | Supprimer |

Les erreurs ont la forme `{ "error": { "message": "...", "details": [{ "field", "message" }] } }`.

## Structure

```
backend/
  src/
    config/        env (validé par Zod), connexion MongoDB
    models/        User, Task
    validators/    schémas Zod
    middleware/    auth JWT, validation, gestion d'erreurs
    controllers/   logique auth et tâches
    routes/
    utils/         jetons, AppError, asyncHandler
    app.js         configuration Express
    server.js      démarrage + arrêt gracieux
  test/            tests d'intégration
frontend/
  src/
    api/           client Axios (intercepteurs, refresh), endpoints
    context/       AuthContext, ThemeContext
    components/    UI, layout, garde de routes, modales, cartes
    hooks/         useDebounce, useTaskMutations
    pages/         Landing, Login, Register, Dashboard, Tasks, 404
    utils/         métadonnées et formatage des tâches
  nginx.conf
docker-compose.yml
```
