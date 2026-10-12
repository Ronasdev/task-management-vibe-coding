import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Adresse e-mail invalide').max(254);

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(80),
  email,
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128)
    .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis').max(128),
});
