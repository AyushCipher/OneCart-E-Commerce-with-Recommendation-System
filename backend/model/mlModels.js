import mongoose from "mongoose";
import UserInteraction from "./userInteractionModel.js";

/**
 * Product Similarity Matrix Schema
 * Pre-computed similarities for fast content-based recommendations
 * Similar to Amazon's "Customers who viewed this also viewed"
 */
const productSimilaritySchema = new mongoose.Schema({
  // Source product
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  
  // Similar products with scores
  similarProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    
    // Content-based similarity (TF-IDF, cosine similarity)
    contentScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Co-view similarity (viewed together)
    coViewScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Co-purchase similarity (bought together)
    coPurchaseScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Combined weighted score
    combinedScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Breakdown of why similar
    similarity: {
      category: Boolean,
      subCategory: Boolean,
      priceRange: Boolean,
      tags: [String],
      attributes: Object
    }
  }],
  
  // Last computed timestamp
  computedAt: {
    type: Date,
    default: Date.now
  },
  
  // Staleness flag
  needsRecompute: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

productSimilaritySchema.index({ productId: 1 }, { unique: true });
productSimilaritySchema.index({ 'similarProducts.combinedScore': -1 });
productSimilaritySchema.index({ needsRecompute: 1 });

const ProductSimilarity = mongoose.model("ProductSimilarity", productSimilaritySchema);


/**
 * User Similarity Matrix Schema
 * Pre-computed user similarities for collaborative filtering
 */
const userSimilaritySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  similarUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // Jaccard similarity (overlap in purchases)
    purchaseSimilarity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // View behavior similarity
    viewSimilarity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Category preference similarity
    categorySimilarity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Combined score
    combinedScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // Common items
    commonPurchases: Number,
    commonViews: Number
  }],
  
  computedAt: {
    type: Date,
    default: Date.now
  },
  
  needsRecompute: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userSimilaritySchema.index({ userId: 1 }, { unique: true });
userSimilaritySchema.index({ 'similarUsers.combinedScore': -1 });

const UserSimilarity = mongoose.model("UserSimilarity", userSimilaritySchema);


/**
 * User Profile Schema - Aggregated user behavior profile
 * Used for fast recommendation lookups
 */
const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  
  // Category affinities (normalized scores 0-1)
  categoryAffinities: [{
    category: String,
    score: Number,      // Affinity score
    viewCount: Number,
    purchaseCount: Number,
    lastInteraction: Date
  }],
  
  subCategoryAffinities: [{
    subCategory: String,
    score: Number,
    viewCount: Number,
    purchaseCount: Number,
    lastInteraction: Date
  }],
  
  // Price sensitivity
  pricePreference: {
    min: Number,
    max: Number,
    average: Number,
    median: Number,
    variance: Number,
    segment: {
      type: String,
      enum: ['budget', 'mid-range', 'premium', 'luxury', 'unknown']
    }
  },
  
  // Brand affinities (if you add brands later)
  brandAffinities: [{
    brand: String,
    score: Number,
    purchaseCount: Number
  }],
  
  // Shopping behavior patterns
  behavior: {
    // Session patterns
    avgSessionDuration: Number,      // in minutes
    avgProductsViewed: Number,
    avgPagesPerSession: Number,
    preferredBrowsingTime: String,   // morning, afternoon, evening, night
    preferredDays: [String],         // preferred shopping days
    
    // Conversion patterns
    viewToCartRate: Number,          // % of views that get added to cart
    cartToPurchaseRate: Number,      // % of cart additions that convert
    avgTimeToDecision: Number,       // avg time from first view to purchase
    
    // Engagement patterns
    reviewReader: Boolean,           // Tends to read reviews
    compareProducts: Boolean,        // Tends to compare products
    priceWatcher: Boolean,           // Waits for price drops
    impulseBuyer: Boolean,           // Quick decisions
    
    // Search patterns
    topSearchTerms: [String],
    searchToClickRate: Number,
    avgSearchResultsViewed: Number
  },
  
  // Size preferences (for fashion)
  sizePreferences: {
    topwear: String,
    bottomwear: String,
    footwear: String
  },
  
  // Recency-Frequency-Monetary (RFM) metrics
  rfm: {
    recency: Number,                 // Days since last purchase
    frequency: Number,               // Number of purchases
    monetary: Number,                // Total spend
    segment: {
      type: String,
      enum: ['champions', 'loyal', 'potential', 'new', 'at_risk', 'hibernating', 'lost', 'unknown']
    }
  },
  
  // Recent activity (for session-based recommendations)
  recentActivity: {
    lastViewedProducts: [{
      productId: mongoose.Schema.Types.ObjectId,
      timestamp: Date
    }],
    lastSearchQueries: [{
      query: String,
      timestamp: Date
    }],
    currentSessionProducts: [mongoose.Schema.Types.ObjectId],
    abandonedCart: [{
      productId: mongoose.Schema.Types.ObjectId,
      addedAt: Date
    }]
  },
  
  // Computed embeddings (for neural collaborative filtering)
  embeddings: {
    userVector: [Number],            // User embedding vector
    vectorVersion: String,           // Model version that created this
    computedAt: Date
  },
  
  // Profile staleness
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  needsRecompute: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userProfileSchema.index({ userId: 1 }, { unique: true });
userProfileSchema.index({ 'rfm.segment': 1 });
userProfileSchema.index({ needsRecompute: 1 });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);


/**
 * Product Features Schema - Enriched product data for ML
 */
const productFeaturesSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
    index: true
  },
  
  // TF-IDF features from text
  textFeatures: {
    nameTokens: [String],
    descriptionTokens: [String],
    tfidfVector: [Number],
    vectorVersion: String
  },
  
  // Categorical features (one-hot encoded)
  categoricalFeatures: {
    categoryEncoded: [Number],
    subCategoryEncoded: [Number]
  },
  
  // Numerical features (normalized)
  numericalFeatures: {
    priceNormalized: Number,
    ratingNormalized: Number,
    reviewCountNormalized: Number,
    stockNormalized: Number
  },
  
  // Popularity metrics
  popularity: {
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    addToCartCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    
    // Derived metrics
    clickThroughRate: Number,
    conversionRate: Number,
    trendingScore: Number,
    
    // Time-windowed metrics
    viewsLast24h: Number,
    viewsLast7d: Number,
    viewsLast30d: Number,
    purchasesLast24h: Number,
    purchasesLast7d: Number,
    purchasesLast30d: Number
  },
  
  // Co-occurrence statistics
  coOccurrence: {
    frequentlyViewedWith: [{
      productId: mongoose.Schema.Types.ObjectId,
      count: Number
    }],
    frequentlyBoughtWith: [{
      productId: mongoose.Schema.Types.ObjectId,
      count: Number
    }],
    frequentlyCartedWith: [{
      productId: mongoose.Schema.Types.ObjectId,
      count: Number
    }]
  },
  
  // Product embedding (for neural recommendations)
  embedding: {
    vector: [Number],
    vectorVersion: String,
    computedAt: Date
  },
  
  // Cold start handling
  coldStart: {
    isNew: Boolean,
    daysSinceCreation: Number,
    hasEnoughData: Boolean,
    minInteractionsReached: Boolean
  },
  
  computedAt: {
    type: Date,
    default: Date.now
  },
  
  needsRecompute: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

productFeaturesSchema.index({ productId: 1 }, { unique: true });
productFeaturesSchema.index({ 'popularity.trendingScore': -1 });
productFeaturesSchema.index({ needsRecompute: 1 });

const ProductFeatures = mongoose.model("ProductFeatures", productFeaturesSchema);


/**
 * Recommendation Cache Schema - Pre-computed recommendations
 */
const recommendationCacheSchema = new mongoose.Schema({
  // Cache key
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Cache type
  cacheType: {
    type: String,
    enum: ['user', 'product', 'global', 'session'],
    required: true
  },
  
  // For user-specific cache
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  
  // For product-specific cache (similar products)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    index: true
  },
  
  // Strategy used
  strategy: {
    type: String,
    enum: ['hybrid', 'collaborative', 'content', 'popularity', 'trending', 'personalized']
  },
  
  // Cached recommendations
  recommendations: [{
    productId: mongoose.Schema.Types.ObjectId,
    score: Number,
    reason: String,
    strategy: String
  }],
  
  // Cache metadata
  computedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Cache stats
  hitCount: {
    type: Number,
    default: 0
  },
  
  lastAccessed: Date
}, { timestamps: true });

// TTL index for automatic cache expiration
recommendationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RecommendationCache = mongoose.model("RecommendationCache", recommendationCacheSchema);


/**
 * A/B Test Schema - Track recommendation experiment results
 */
const abTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  
  description: String,
  
  // Test configuration
  config: {
    startDate: Date,
    endDate: Date,
    trafficPercentage: Number,      // % of users in test
    
    // Variants
    variants: [{
      name: String,                   // e.g., "control", "variant_a"
      strategyConfig: Object,         // Strategy parameters
      trafficWeight: Number           // Traffic distribution
    }]
  },
  
  // Test results
  results: {
    impressions: { type: Map, of: Number },      // variant -> count
    clicks: { type: Map, of: Number },
    addToCarts: { type: Map, of: Number },
    purchases: { type: Map, of: Number },
    revenue: { type: Map, of: Number }
  },
  
  // Statistical analysis
  analysis: {
    significanceLevel: Number,
    sampleSize: Number,
    winner: String,
    confidenceInterval: Number,
    pValue: Number,
    uplift: Number
  },
  
  status: {
    type: String,
    enum: ['draft', 'running', 'paused', 'completed', 'archived'],
    default: 'draft'
  }
}, { timestamps: true });

const ABTest = mongoose.model("ABTest", abTestSchema);


export {
  UserInteraction,
  ProductSimilarity,
  UserSimilarity,
  UserProfile,
  ProductFeatures,
  RecommendationCache,
  ABTest
};

export default {
  UserInteraction,
  ProductSimilarity,
  UserSimilarity,
  UserProfile,
  ProductFeatures,
  RecommendationCache,
  ABTest
};
