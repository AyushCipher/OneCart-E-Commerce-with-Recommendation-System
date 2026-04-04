import MLRecommendationEngine from "../services/mlRecommendationEngine.js";
import EventTracker from "../services/eventTracker.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import UserInteraction from "../model/userInteractionModel.js";
import { UserProfile, ProductFeatures, RecommendationCache } from "../model/mlModels.js";

/**
 * Advanced Recommendation Controller
 * Handles all recommendation-related API endpoints
 */

// ================== RECOMMENDATION ENDPOINTS ==================

/**
 * POST /api/ml/recommendations
 * Get personalized recommendations for user
 */
export const getMLRecommendations = async (req, res) => {
  try {
    const { strategy = 'hybrid', limit = 10, userId, excludeIds = [] } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate fresh recommendations (skip cache when excludeIds provided)
    let result;
    try {
      result = await MLRecommendationEngine.getRecommendations(userId, {
        strategy,
        limit: parseInt(limit),
        excludeProductIds: excludeIds
      });
    } catch (engineError) {
      console.error(`ML Engine error for strategy ${strategy}:`, engineError.message);
      // Return graceful fallback
      result = {
        products: [],
        strategy: strategy,
        coldStart: true,
        error: engineError.message
      };
    }

    // Validate result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid recommendation engine response');
    }

    if (!result.products || !Array.isArray(result.products)) {
      result.products = [];
    }

    res.status(200).json({
      success: true,
      strategy: result.strategy || strategy,
      count: result.products.length,
      coldStart: result.coldStart || false,
      strategiesUsed: result.strategiesUsed || [],
      cached: false,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching ML recommendations:", error.message || error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * GET /api/ml/similar/:productId
 * Get products similar to a specific product
 */
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const result = await MLRecommendationEngine.getSimilarProducts(
      productId,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      count: result.products.length,
      cached: result.cached || false,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching similar products",
      error: error.message
    });
  }
};

/**
 * GET /api/ml/trending
 * Get trending products
 */
export const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await MLRecommendationEngine.getTrendingRecommendations(
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      count: result.products.length,
      fallback: result.fallback,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending products",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/cold-start
 * Get recommendations for new users without history
 */
export const getColdStartRecommendations = async (req, res) => {
  try {
    const { preferredCategories, priceRange, limit = 10 } = req.body;

    const result = await MLRecommendationEngine.getColdStartRecommendations(
      { preferredCategories, priceRange },
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      count: result.products.length,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching cold start recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/rating-based
 * Get recommendations based on product ratings and reviews
 */
export const getRatingBasedRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const result = await MLRecommendationEngine.getRatingBasedRecommendations(
      userId,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      strategy: 'rating',
      count: result.products.length,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching rating-based recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/review-based
 * Get recommendations using review-based collaborative filtering
 * Finds users with similar review patterns and recommends what they liked
 */
export const getReviewBasedRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const result = await MLRecommendationEngine.getReviewBasedRecommendations(
      userId,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      strategy: 'review-cf',
      count: result.products.length,
      coldStart: result.coldStart || false,
      similarUsersFound: result.similarUsersFound || 0,
      data: result.products
    });
  } catch (error) {
    console.error("Error fetching review-based recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * GET /api/ml/strategies
 * Get available recommendation strategies
 */
export const getAvailableStrategies = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      strategies: [
        {
          id: 'hybrid',
          name: 'Smart Recommendations',
          description: 'Combines all strategies for best results',
          icon: '🎯'
        },
        {
          id: 'content',
          name: 'Similar to Your Interests',
          description: 'Based on products you\'ve viewed',
          icon: '🔍'
        },
        {
          id: 'collaborative',
          name: 'People Like You',
          description: 'Based on similar users\' preferences',
          icon: '👥'
        },
        {
          id: 'rating',
          name: 'Top Rated',
          description: 'Highly rated products in your categories',
          icon: '⭐'
        },
        {
          id: 'review-cf',
          name: 'Review Based',
          description: 'Based on users with similar review patterns',
          icon: '📝'
        },
        {
          id: 'trending',
          name: 'Trending Now',
          description: 'Popular products this week',
          icon: '🔥'
        },
        {
          id: 'category',
          name: 'Your Categories',
          description: 'Best from your favorite categories',
          icon: '📦'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching strategies",
      error: error.message
    });
  }
};

// ================== TRACKING ENDPOINTS ==================

/**
 * POST /api/ml/track/view
 * Track product view
 */
export const trackProductView = async (req, res) => {
  try {
    const { 
      userId, 
      productId, 
      referrer,
      referrerType,
      sessionId,
      deviceInfo 
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    // Get product details for tracking
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Track the event
    await EventTracker.trackProductView({
      userId,
      productId,
      product: {
        category: product.category,
        subCategory: product.subCategory,
        price: product.price
      },
      referrer,
      referrerType,
      sessionId,
      deviceInfo
    });

    // Also update the legacy user model for backward compatibility
    const user = await User.findById(userId);
    if (user) {
      const existingView = user.viewedProducts.find(
        v => v.productId?.toString() === productId
      );

      if (existingView) {
        existingView.viewCount = (existingView.viewCount || 1) + 1;
        existingView.viewedAt = Date.now();
      } else {
        user.viewedProducts.push({
          productId,
          viewedAt: Date.now(),
          viewCount: 1
        });
      }

      // Update preferences
      if (!user.preferences) {
        user.preferences = { favoriteCategories: [], favoriteSubCategories: [] };
      }
      if (!user.preferences.favoriteCategories.includes(product.category)) {
        user.preferences.favoriteCategories.push(product.category);
      }
      if (!user.preferences.favoriteSubCategories.includes(product.subCategory)) {
        user.preferences.favoriteSubCategories.push(product.subCategory);
      }

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Product view tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking product view:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking product view",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/search
 * Track search query
 */
export const trackSearch = async (req, res) => {
  try {
    const { userId, query, filters, sortBy, resultsCount, sessionId } = req.body;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        message: "User ID and query are required"
      });
    }

    await EventTracker.trackSearch({
      userId,
      query,
      filters,
      sortBy,
      resultsCount,
      sessionId
    });

    res.status(200).json({
      success: true,
      message: "Search tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking search:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking search",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/add-to-cart
 * Track add to cart event
 */
export const trackAddToCart = async (req, res) => {
  try {
    const { 
      userId, 
      productId, 
      quantity, 
      size, 
      referrer, 
      referrerType,
      sessionId 
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await EventTracker.trackAddToCart({
      userId,
      productId,
      product: {
        category: product.category,
        subCategory: product.subCategory,
        price: product.price
      },
      quantity,
      size,
      referrer,
      referrerType,
      sessionId
    });

    res.status(200).json({
      success: true,
      message: "Add to cart tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking add to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking add to cart",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/purchase
 * Track purchase event
 */
export const trackPurchase = async (req, res) => {
  try {
    const { 
      userId, 
      products, 
      totalAmount, 
      paymentMethod, 
      couponUsed,
      sessionId 
    } = req.body;

    if (!userId || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "User ID and products array are required"
      });
    }

    // Enrich products with details
    const enrichedProducts = await Promise.all(
      products.map(async (p) => {
        const product = await Product.findById(p.productId);
        return {
          ...p,
          category: product?.category,
          subCategory: product?.subCategory,
          price: product?.price
        };
      })
    );

    await EventTracker.trackPurchase({
      userId,
      products: enrichedProducts,
      totalAmount,
      paymentMethod,
      couponUsed,
      sessionId
    });

    // Update legacy user model
    const user = await User.findById(userId);
    if (user) {
      for (const p of products) {
        const alreadyPurchased = user.purchasedProducts.find(
          pp => pp.productId?.toString() === p.productId
        );
        if (!alreadyPurchased) {
          user.purchasedProducts.push({
            productId: p.productId,
            purchasedAt: Date.now()
          });
        }
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Purchase tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking purchase:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking purchase",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/recommendation-click
 * Track when user clicks on a recommendation
 */
export const trackRecommendationClick = async (req, res) => {
  try {
    const {
      userId,
      productId,
      recommendationType,
      recommendationPosition,
      recommendationScore,
      sessionId
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    const product = await Product.findById(productId);

    await EventTracker.trackRecommendationClick({
      userId,
      productId,
      product: product ? {
        category: product.category,
        subCategory: product.subCategory,
        price: product.price
      } : null,
      recommendationType,
      recommendationPosition,
      recommendationScore,
      sessionId
    });

    res.status(200).json({
      success: true,
      message: "Recommendation click tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking recommendation click:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking recommendation click",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/time-on-page
 * Track engagement time on product page
 */
export const trackTimeOnPage = async (req, res) => {
  try {
    const {
      userId,
      productId,
      dwellTime,
      scrollDepth,
      imagesViewed,
      reviewsViewed,
      sessionId
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    await EventTracker.trackTimeOnPage({
      userId,
      productId,
      dwellTime,
      scrollDepth,
      imagesViewed,
      reviewsViewed,
      sessionId
    });

    res.status(200).json({
      success: true,
      message: "Time on page tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking time on page:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking time on page",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/track/session-start
 * Track session start
 */
export const trackSessionStart = async (req, res) => {
  try {
    const { userId, deviceInfo, referrer } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const sessionId = await EventTracker.trackSessionStart({
      userId,
      deviceInfo,
      referrer
    });

    res.status(200).json({
      success: true,
      sessionId,
      message: "Session started successfully"
    });
  } catch (error) {
    console.error("Error tracking session start:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking session start",
      error: error.message
    });
  }
};

// ================== ANALYTICS ENDPOINTS ==================

/**
 * GET /api/ml/analytics/user/:userId
 * Get user analytics and profile
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const [profile, interactionSummary, user] = await Promise.all([
      UserProfile.findOne({ userId }),
      EventTracker.getUserInteractionSummary(userId, parseInt(days)),
      User.findById(userId).select('viewedProducts purchasedProducts preferences')
    ]);

    res.status(200).json({
      success: true,
      data: {
        profile: profile || {},
        interactionSummary,
        viewedProductsCount: user?.viewedProducts?.length || 0,
        purchasedProductsCount: user?.purchasedProducts?.length || 0,
        preferences: user?.preferences || {}
      }
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user analytics",
      error: error.message
    });
  }
};

/**
 * GET /api/ml/analytics/product/:productId
 * Get product analytics
 */
export const getProductAnalytics = async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const [features, interactionSummary, coViewed] = await Promise.all([
      ProductFeatures.findOne({ productId }),
      EventTracker.getProductInteractionSummary(productId, parseInt(days)),
      EventTracker.getCoViewedProducts(productId, 10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        features: features || {},
        interactionSummary,
        coViewedProducts: coViewed
      }
    });
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product analytics",
      error: error.message
    });
  }
};

/**
 * GET /api/ml/analytics/overview
 * Get recommendation system overview stats
 */
export const getSystemOverview = async (req, res) => {
  try {
    const [
      totalInteractions,
      recentInteractions,
      cacheStats,
      userProfileCount,
      productFeatureCount
    ] = await Promise.all([
      UserInteraction.countDocuments(),
      UserInteraction.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      RecommendationCache.aggregate([
        {
          $group: {
            _id: null,
            totalCached: { $sum: 1 },
            totalHits: { $sum: '$hitCount' }
          }
        }
      ]),
      UserProfile.countDocuments(),
      ProductFeatures.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        interactions: {
          total: totalInteractions,
          last24Hours: recentInteractions
        },
        cache: cacheStats[0] || { totalCached: 0, totalHits: 0 },
        profiles: {
          userProfiles: userProfileCount,
          productFeatures: productFeatureCount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching system overview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system overview",
      error: error.message
    });
  }
};

// ================== CACHE MANAGEMENT ==================

/**
 * POST /api/ml/cache/clear
 * Clear recommendation cache
 */
export const clearCache = async (req, res) => {
  try {
    const { userId, strategy, all } = req.body;

    let query = {};
    if (all) {
      // Clear all cache
    } else if (userId) {
      query.userId = userId;
    } else if (strategy) {
      query.strategy = strategy;
    }

    const result = await RecommendationCache.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} cache entries`
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache",
      error: error.message
    });
  }
};

/**
 * POST /api/ml/recompute
 * Force recompute recommendations for a user
 */
export const forceRecompute = async (req, res) => {
  try {
    const { userId, strategy = 'hybrid' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Clear user's cache
    await RecommendationCache.deleteMany({ userId });

    // Mark user profile for recompute
    await UserProfile.updateOne({ userId }, { needsRecompute: true });

    // Generate fresh recommendations
    const result = await MLRecommendationEngine.getRecommendations(userId, {
      strategy,
      limit: 10
    });

    res.status(200).json({
      success: true,
      message: "Recommendations recomputed",
      data: result.products
    });
  } catch (error) {
    console.error("Error recomputing recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error recomputing recommendations",
      error: error.message
    });
  }
};

export default {
  getMLRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getColdStartRecommendations,
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
};
