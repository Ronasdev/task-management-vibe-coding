import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

const router = Router();

// Limite les tentatives de connexion / inscription (anti brute-force)
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Trop de tentatives, réessayez dans quelques minutes' } },
});

router.post('/register', credentialsLimiter, validate({ body: registerSchema }), asyncHandler(auth.register));
router.post('/login', credentialsLimiter, validate({ body: loginSchema }), asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', asyncHandler(auth.logout));
router.get('/me', requireAuth, asyncHandler(auth.me));

export default router;
