import mongoose from 'mongoose';
import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Route introuvable : ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || err.status || 500;
  let message = err.isOperational ? err.message : 'Erreur interne du serveur';
  let details = err.details;

  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Identifiant invalide';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Données invalides';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err?.code === 11000) {
    status = 409;
    message = 'Cette ressource existe déjà';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON invalide';
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    message = 'Requête trop volumineuse';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      message,
      ...(details && { details }),
      ...(!env.isProd && status >= 500 && { stack: err.stack }),
    },
  });
}
