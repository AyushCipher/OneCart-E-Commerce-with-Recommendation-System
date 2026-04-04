/**
 * Recommendation System Configuration
 * Customize recommendation behavior here
 */

export const RECOMMENDATION_CONFIG = {
  // General Settings
  enabled: true,
  maxRecommendations: 8,
  minRecommendationsToShow: 3,
  
  // Strategies
  strategies: {
    hybrid: {
      enabled: true,
      weights: {
        contentBased: 0.20,      // 20% weight
        collaborative: 0.20,     // 20% weight (user-user)
        itemItem: 0.15,          // 15% weight (item-item)
        popularity: 0.10,        // 10% weight
        category: 0.10,          // 10% weight
        rating: 0.15,            // 15% weight (rating-based)
        reviewCF: 0.10           // 10% weight (review-based CF)
      }
    },
    contentBased: {
      enabled: true,
      weights: {
        category: 0.40,
        subCategory: 0.30,
        price: 0.20,
        rating: 0.10
      },
      priceRangePercentage: 0.30  // ±30% price range considered similar
    },
    collaborative: {
      enabled: true,
      maxSimilarUsers: 50,        // Look at top 50 similar users
      minCommonPurchases: 1       // Minimum products in common
    },
    popularity: {
      enabled: true,
      sortBy: ['bestseller', 'ratings', 'numOfReviews']
    },
    category: {
      enabled: true,
      considerSubCategory: true,
      maxCategories: 3
    },
    rating: {
      enabled: true,
      minRating: 3.5,
      minReviews: 3,
      preferUserCategories: true
    },
    reviewCF: {
      enabled: true,
      minCorrelation: 0.3,
      minUserReviews: 2
    }
  },

  // Tracking Settings
  tracking: {
    trackViews: true,
    trackPurchases: true,
    viewTrackingDelay: 1000,      // 1 second delay before tracking
    updateUserPreferences: true,
    maxViewedProducts: 500,       // Keep last 500 viewed products
    maxPurchasedProducts: 500
  },

  // UI/UX Settings
  ui: {
    showOnHomePage: true,
    showOnProductPage: true,
    showOnCartPage: true,
    showOnCollectionsPage: false,
    gridColumns: {
      desktop: 4,
      tablet: 3,
      mobile: 2
    },
    loadingDelay: 0,              // Add artificial delay for loading state
    showStrategy: false            // Show which strategy was used (for testing)
  },

  // Performance Settings
  performance: {
    enableCaching: false,          // Enable recommendation caching (future)
    cacheTimeout: 3600000,         // Cache for 1 hour
    enableBatching: false,         // Batch recommendation requests (future)
    timeoutMs: 5000               // Request timeout
  },

  // Content-Based Settings
  contentBased: {
    similarity: {
      categoryMatch: 0.40,
      subCategoryMatch: 0.30,
      priceRangeSimilarity: 0.20,  // Must be within ±30%
      ratingSimilarity: 0.10       // Must be within ±1 rating
    }
  },

  // Collaborative Filtering Settings
  collaborative: {
    minSimilarUsers: 2,            // Minimum similar users to make recommendations
    similarityThreshold: 0.5,      // Minimum similarity score
    decayFactor: 0.1              // How much older purchases matter
  },

  // Rating-Based Settings
  ratingBased: {
    minRating: 3.5,                // Minimum rating to recommend
    minReviews: 3,                 // Minimum reviews for reliability
    weights: {
      rating: 0.40,
      reviewCount: 0.25,
      bestseller: 0.15,
      categoryMatch: 0.20
    }
  },

  // Review-Based Collaborative Filtering Settings
  reviewCF: {
    minUserReviews: 2,             // Minimum reviews to find similar users
    minCorrelation: 0.3,           // Minimum Pearson correlation
    minRatingToRecommend: 4,       // Minimum rating from similar users
    maxSimilarUsers: 50            // Maximum similar users to consider
  },

  // Logging & Debug
  debug: {
    enableLogging: true,
    logToConsole: true,
    logLevel: 'info',              // 'debug', 'info', 'warn', 'error'
    showRecommendationScores: false // Show individual strategy scores
  },

  // API Settings
  api: {
    baseUrl: process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:8000',
    timeout: 5000,
    retryAttempts: 2,
    retryDelay: 1000
  },

  // Filter Settings
  filters: {
    excludeOutOfStock: false,
    minPrice: null,
    maxPrice: null,
    categories: null,              // null = all categories, or ['Men', 'Women']
    minRating: 0,
    maxResults: 8
  },

  // Personalization Settings
  personalization: {
    trackCategoryPreferences: true,
    trackPricePreferences: true,
    trackSubCategoryPreferences: true,
    updateFrequency: 'realtime'    // 'realtime', 'daily', 'weekly'
  }
};

/**
 * Helper function to get configuration
 */
export const getRecommendationConfig = (path) => {
  const keys = path.split('.');
  let value = RECOMMENDATION_CONFIG;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return null;
  }
  
  return value;
};

/**
 * Override specific config values
 */
export const updateRecommendationConfig = (path, value) => {
  const keys = path.split('.');
  let obj = RECOMMENDATION_CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  
  obj[keys[keys.length - 1]] = value;
};

export default RECOMMENDATION_CONFIG;
