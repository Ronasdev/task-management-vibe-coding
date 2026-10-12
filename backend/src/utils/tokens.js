import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const REFRESH_COOKIE = 'refresh_token';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh', v: user.tokenVersion },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (payload.type !== 'access') throw new jwt.JsonWebTokenError('Type de jeton invalide');
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (payload.type !== 'refresh') throw new jwt.JsonWebTokenError('Type de jeton invalide');
  return payload;
}

// Durée de vie du refresh token en ms, dérivée de JWT_REFRESH_EXPIRES_IN
const refreshMaxAgeMs = (() => {
  const { iat, exp } = jwt.decode(jwt.sign({}, 'x', { expiresIn: env.JWT_REFRESH_EXPIRES_IN }));
  return (exp - iat) * 1000;
})();

const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'strict',
  path: '/api/auth',
};

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions, maxAge: refreshMaxAgeMs });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}
