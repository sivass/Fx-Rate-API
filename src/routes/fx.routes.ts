import { Request, Response, Router } from "express";
import { FxService } from "../services/fx.service";
import {
  baseCurrencySchema,
  currencyPairSchema,
  ratesPaginationSchema,
} from "../validations/fx.validations";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";
const fxRouter = Router();

// Get all exchange rates for a base currency
fxRouter.get(
  "/rates",
  validateRequest(z.object({ base: baseCurrencySchema.optional() })),
  async (req, res): Promise<void> => {
    try {
      const validatedData = req.validatedData as { base?: string };
      const baseCurrency = validatedData.base || "USD";
      const rates = await FxService.getExchangeRates(baseCurrency);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  }
);
// Get specific exchange rate between two currencies
fxRouter.get("/rate", validateRequest(currencyPairSchema), async (req, res) => {
  try {
    const { from, to } = req.validatedData as { from: string; to: string };
    const rate = await FxService.getExchangeRate(from, to);
    res.json({ from, to, rate });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchange rate" });
  }
});

// Get paginated exchange rates
fxRouter.get(
  "/rates/paginated",
  validateRequest(ratesPaginationSchema),
  async (req, res) => {
    try {
      const { base, page, limit } = req.validatedData as {
        base: string;
        page: number;
        limit: number;
      };
      const rates = await FxService.getExchangeRatesWithPagination(
        base,
        page,
        limit
      );
      res.json(rates);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch paginated exchange rates" });
    }
  }
);

// Cache exchange rates (admin endpoint)
fxRouter.post("/cache", async (req, res) => {
  try {
    await FxService.cacheExchangeRates();
    res.json({ message: "Exchange rates cached successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cache exchange rates" });
  }
});

export default fxRouter;
