import { z } from "zod";

// Base currency validation schema
export const baseCurrencySchema = z.string().min(3).max(3);

// Currency pair validation schema
export const currencyPairSchema = z.object({
  from: z.string().min(3).max(3),
  to: z.string().min(3).max(3),
});

// Pagination validation schema
export const ratesPaginationSchema = z.object({
  base: z.string().min(3).max(3),
  page: z
    .string()
    .optional()
    .transform((val) => Number(val ?? "1"))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Page must be a positive integer and greater than 0",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val ?? "10"))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Limit must be a positive integer and greater than 0",
    }),
});

// Cache validation schema
