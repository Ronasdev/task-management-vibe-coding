import { AppError } from '../utils/AppError.js';

/**
 * Valide req.params / req.query / req.body avec des schémas zod.
 * Les données nettoyées sont exposées dans req.valid.{params,query,body}.
 */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = {};
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(new AppError('Données invalides', 400, details));
    }
    req.valid[key] = result.data;
  }
  next();
};
