import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include validatedData
declare global {
  namespace Express {
    interface Request {
      validatedData?: unknown;
    }
  }
}
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse({
      ...req.query,
      ...req.params,
      ...req.body,
    });

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    } else {
      // Attach validated data to request object
      req.validatedData = validation.data;
      next();
    }
  };
};
