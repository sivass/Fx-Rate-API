import axios from "axios";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const FX_API_KEY = process.env.FX_API_KEY;
const FX_API_BASE_URL = process.env.FX_API_BASE_URL;

export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const FxService = {
  async getExchangeRates(
    baseCurrency: string = "USD"
  ): Promise<ExchangeRateResponse> {
    try {
      const response = await axios.get(`${FX_API_BASE_URL}/${baseCurrency}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch exchange rates");
    }
  },

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const rates = await this.getExchangeRates(from);
      return rates.rates[to];
    } catch (error) {
      throw new Error("Failed to fetch exchange rate");
    }
  },

  async getExchangeRatesWithPagination(
    baseCurrency: string = "USD",
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<{ currency: string; rate: number }>> {
    try {
      const rates = await this.getExchangeRates(baseCurrency);
      const currencies = Object.entries(rates.rates);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedCurrencies = currencies
        .slice(startIndex, endIndex)
        .map(([currency, rate]) => ({ currency, rate }));

      return {
        data: paginatedCurrencies,
        total: currencies.length,
        page,
        limit,
        totalPages: Math.ceil(currencies.length / limit),
      };
    } catch (error) {
      throw new Error("Failed to fetch paginated exchange rates");
    }
  },

  async cacheExchangeRates(): Promise<void> {
    try {
      const rates = await this.getExchangeRates();
      // Store each currency rate individually
      await Promise.all(
        Object.entries(rates.rates).map(([currency, rate]) =>
          prisma.rate.create({
            data: {
              base: rates.base,
              currency,
              rate,
              timestamp: new Date(rates.timestamp * 1000),
            },
          })
        )
      );
    } catch (error) {
      throw new Error("Failed to cache exchange rates");
    }
  },
};
