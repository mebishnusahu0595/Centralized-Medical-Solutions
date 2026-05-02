import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
};
