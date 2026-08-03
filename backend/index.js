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
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import mlRecommendationRoutes from './routes/mlRecommendationRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS config
const allowedOrigins = [
  "https://onecart-recommendation-frontend.onrender.com",
  "https://onecart-recommendation-admin.onrender.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies to be sent
  })
);

// Add Cross-Origin-Opener-Policy header to suppress Firebase warnings
// This allows Firebase auth popups to work properly
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupon', couponRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ml', mlRecommendationRoutes); // Advanced ML Recommendations

// 404 for unmatched routes, then the centralized error handler — must be
// registered last so they see errors from every route above.
app.use(notFound);
app.use(errorHandler);

// Start server and connect database
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  connectDb();
});
