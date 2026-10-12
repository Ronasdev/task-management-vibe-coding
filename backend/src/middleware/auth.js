import { verifyAccessToken } from '../utils/tokens.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentification requise', 401));
  }

  try {
    req.userId = verifyAccessToken(token).sub;
    next();
  } catch {
    next(new AppError('Jeton invalide ou expiré', 401));
  }
}
