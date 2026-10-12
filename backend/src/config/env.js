import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1, 'MONGO_URI est requis'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET doit faire au moins 32 caractères'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  // Par défaut : cookies "Secure" en production (HTTPS requis)
  COOKIE_SECURE: z.enum(['true', 'false']).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides :");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET) {
  console.error('❌ JWT_ACCESS_SECRET et JWT_REFRESH_SECRET doivent être différents');
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  cookieSecure: parsed.data.COOKIE_SECURE
    ? parsed.data.COOKIE_SECURE === 'true'
    : parsed.data.NODE_ENV === 'production',
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
};
