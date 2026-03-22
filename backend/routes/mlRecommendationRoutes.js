import express from 'express';
import {
  getMLRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getColdStartRecommendations,
  getRatingBasedRecommendations,
  getReviewBasedRecommendations,
  getAvailableStrategies,
  trackProductView,
  trackSearch,
  trackAddToCart,
  trackPurchase,
  trackRecommendationClick,
  trackTimeOnPage,
  trackSessionStart,
  getUserAnalytics,
  getProductAnalytics,
  getSystemOverview,
  clearCache,
  forceRecompute
} from '../controller/mlRecommendationController.js';
import isAuth from '../middleware/isAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const mlRecommendationRoutes = express.Router();

// ================== RECOMMENDATION ENDPOINTS ==================

/**
 * POST /api/ml/recommendations
 * Get personalized recommendations for authenticated user
 * Query params: strategy (hybrid|content|collaborative|trending|category|rating|review-cf), limit
 */
mlRecommendationRoutes.post('/recommendations', getMLRecommendations);

/**
 * GET /api/ml/similar/:productId
 * Get products similar to a specific product
 * Query params: limit
 */
mlRecommendationRoutes.get('/similar/:productId', getSimilarProducts);

/**
 * GET /api/ml/trending
 * Get trending products (no auth required)
 * Query params: limit
 */
mlRecommendationRoutes.get('/trending', getTrendingProducts);

/**
 * POST /api/ml/cold-start
 * Get recommendations for new users without history
 * Body: { preferredCategories, priceRange, limit }
 */
mlRecommendationRoutes.post('/cold-start', getColdStartRecommendations);

/**
 * POST /api/ml/rating-based
 * Get recommendations based on product ratings
 * Query params: limit
 */
mlRecommendationRoutes.post('/rating-based', getRatingBasedRecommendations);

/**
 * POST /api/ml/review-based
 * Get recommendations based on review-based collaborative filtering
 * Query params: limit
 */
mlRecommendationRoutes.post('/review-based', getReviewBasedRecommendations);

/**
 * GET /api/ml/strategies
 * Get available recommendation strategies
 */
mlRecommendationRoutes.get('/strategies', getAvailableStrategies);

// ================== TRACKING ENDPOINTS ==================

/**
 * POST /api/ml/track/view
 * Track product view event
 * Body: { userId, productId, referrer, referrerType, sessionId, deviceInfo }
 */
mlRecommendationRoutes.post('/track/view', trackProductView);

/**
 * POST /api/ml/track/search
 * Track search query
 * Body: { userId, query, filters, sortBy, resultsCount, sessionId }
 */
mlRecommendationRoutes.post('/track/search', trackSearch);

/**
 * POST /api/ml/track/add-to-cart
 * Track add to cart event
 * Body: { userId, productId, quantity, size, referrer, referrerType, sessionId }
 */
mlRecommendationRoutes.post('/track/add-to-cart', trackAddToCart);

/**
 * POST /api/ml/track/purchase
 * Track purchase event
 * Body: { userId, products, totalAmount, paymentMethod, couponUsed, sessionId }
 */
mlRecommendationRoutes.post('/track/purchase', trackPurchase);

/**
 * POST /api/ml/track/recommendation-click
 * Track recommendation click
 * Body: { userId, productId, recommendationType, recommendationPosition, recommendationScore, sessionId }
 */
mlRecommendationRoutes.post('/track/recommendation-click', trackRecommendationClick);

/**
 * POST /api/ml/track/time-on-page
 * Track time spent on product page
 * Body: { userId, productId, dwellTime, scrollDepth, imagesViewed, reviewsViewed, sessionId }
 */
mlRecommendationRoutes.post('/track/time-on-page', trackTimeOnPage);

/**
 * POST /api/ml/track/session-start
 * Track session start
 * Body: { userId, deviceInfo, referrer }
 */
mlRecommendationRoutes.post('/track/session-start', trackSessionStart);

// ================== ANALYTICS ENDPOINTS ==================

/**
 * GET /api/ml/analytics/user/:userId
 * Get user analytics and profile
 * Query params: days (default 30)
 */
mlRecommendationRoutes.get('/analytics/user/:userId', getUserAnalytics);

/**
 * GET /api/ml/analytics/product/:productId
 * Get product analytics
 * Query params: days (default 30)
 */
mlRecommendationRoutes.get('/analytics/product/:productId', getProductAnalytics);

/**
 * GET /api/ml/analytics/overview
 * Get recommendation system overview stats (admin only)
 */
mlRecommendationRoutes.get('/analytics/overview', getSystemOverview);

// ================== ADMIN ENDPOINTS ==================

/**
 * POST /api/ml/cache/clear
 * Clear recommendation cache (admin only)
 * Body: { userId, strategy, all }
 */
mlRecommendationRoutes.post('/cache/clear', clearCache);

/**
 * POST /api/ml/recompute
 * Force recompute recommendations for a user
 * Body: { userId, strategy }
 */
mlRecommendationRoutes.post('/recompute', forceRecompute);

export default mlRecommendationRoutes;
