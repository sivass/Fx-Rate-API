import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware';
import authRouter from './routes/auth.routes';
import fxRouter from './routes/fx.routes';
import prisma from './db/prisma';

config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(helmet());
app.use(limiter); // Apply rate limiting middleware to all requests
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/fx", fxRouter);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", timeStamp: new Date() });
});

// Error Handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});