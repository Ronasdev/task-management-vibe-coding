import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Nombre de reverse proxies devant l'API (nginx = 1) pour une IP client correcte
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Requêtes same-origin / outils serveur : pas d'en-tête Origin
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (env.NODE_ENV !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 500,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { message: 'Trop de requêtes, réessayez plus tard' } },
    })
  );

  app.get('/api/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', uptime: process.uptime() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
