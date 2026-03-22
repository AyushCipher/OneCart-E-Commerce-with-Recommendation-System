import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRouter from './routes/reviewRouter.js';
import contactRoutes from './routes/contactRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import mlRecommendationRoutes from './routes/mlRecommendationRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS config
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // frontend URLs
    credentials: true, // allow cookies to be sent
  })
);

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRouter);
app.use("/api/contact", contactRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ml', mlRecommendationRoutes); // Advanced ML Recommendations

// Start server and connect database
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  connectDb();
});
