import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

// Hash factice pour garder un temps de réponse constant quand l'utilisateur n'existe pas
const DUMMY_HASH = bcrypt.hashSync('timing-attack-mitigation', 12);

function sendSession(res, user, status = 200) {
  setRefreshCookie(res, signRefreshToken(user));
  res.status(status).json({ user, accessToken: signAccessToken(user) });
}

export async function register(req, res) {
  const { name, email, password } = req.valid.body;

  if (await User.exists({ email })) {
    throw new AppError('Un compte existe déjà avec cette adresse e-mail', 409);
  }

  const user = await User.create({ name, email, password });
  sendSession(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+password');

  const valid = user
    ? await user.comparePassword(password)
    : (await bcrypt.compare(password, DUMMY_HASH)) && false;

  if (!valid) throw new AppError('E-mail ou mot de passe incorrect', 401);

  sendSession(res, user);
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new AppError('Session expirée', 401);

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    throw new AppError('Session expirée', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.v) {
    clearRefreshCookie(res);
    throw new AppError('Session expirée', 401);
  }

  // Rotation : un nouveau refresh token est émis à chaque rafraîchissement
  sendSession(res, user);
}

export async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      // Invalide toutes les sessions de l'utilisateur
      await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
    } catch {
      /* jeton déjà invalide : rien à révoquer */
    }
  }
  clearRefreshCookie(res);
  res.status(204).end();
}

export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  res.json({ user });
}
