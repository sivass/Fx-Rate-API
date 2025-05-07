import { Request, Response, Router } from "express";
import { FxService } from "../services/fx.service";

const fxRouter = Router();

// Get all exchange rates for a base currency
fxRouter.get("/rates", async (req, res) => {
  try {
    const baseCurrency = (req.query.base as string) || "USD";
    const rates = await FxService.getExchangeRates(baseCurrency);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchange rates" });
  }
});

// Get specific exchange rate between two currencies
fxRouter.get("/rate", async (req: Request, res: Response): Promise<void> => {
  try {
    const fromRow = req.query.from;
    const toRow = req.query.to;

    const isCurrencyCode = (value: any) =>
      typeof value === "string" && /^[A-Z]{3}$/.test(value.toUpperCase());

    if (!isCurrencyCode(fromRow) || !isCurrencyCode(toRow))  {
      res.status(400).json({
        message:
          "Missing or invalid query parameters: from and to must be strings",
      });
    }
    const from: string = typeof fromRow === "string" ? fromRow : "";
    const to: string = typeof toRow === "string" ? toRow : "";

    const rate = await FxService.getExchangeRate(from, to);
    res.json({ from, to, rate });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchange rate" });
  }
});

// Get paginated exchange rates
fxRouter.get("/rates/paginated", async (req, res) => {
  try {
    const baseCurrency = (req.query.base as string) || "USD";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const rates = await FxService.getExchangeRatesWithPagination(
      baseCurrency,
      page,
      limit
    );
    res.json(rates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch paginated exchange rates" });
  }
});

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
