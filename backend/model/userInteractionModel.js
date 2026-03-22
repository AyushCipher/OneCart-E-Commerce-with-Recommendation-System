import mongoose from "mongoose";

/**
 * User Interaction Schema - Tracks ALL user behavior events
 * This is the foundation for ML-driven recommendations
 * Similar to Amazon's clickstream data collection
 */
const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Event type classification
  eventType: {
    type: String,
    enum: [
      'view',           // Product page view
      'click',          // Any click on product (from list/grid)
      'search',         // Search query
      'add_to_cart',    // Added to cart
      'remove_from_cart', // Removed from cart
      'wishlist_add',   // Added to wishlist
      'wishlist_remove', // Removed from wishlist
      'purchase',       // Completed purchase
      'review',         // Left a review
      'share',          // Shared product
      'compare',        // Added to comparison
      'quick_view',     // Quick view modal
      'scroll_depth',   // How far user scrolled on product page
      'time_on_page',   // Time spent on product page
      'filter_apply',   // Applied filter in collections
      'sort_apply',     // Applied sorting
      'category_browse', // Browsed a category
      'recommendation_click', // Clicked on a recommendation
      'homepage_view',  // Viewed homepage
      'session_start',  // Session started
      'session_end'     // Session ended
    ],
    required: true,
    index: true
  },
  
  // Product reference (for product-related events)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    index: true
  },
  
  // Search-related data
  searchData: {
    query: String,
    resultsCount: Number,
    clickedProductIndex: Number,  // Which position was clicked
    filters: Object,              // Applied filters
    sortBy: String
  },
  
  // Event metadata
  metadata: {
    // Page context
    pageType: {
      type: String,
      enum: ['home', 'product', 'collection', 'cart', 'checkout', 'search', 'orders', 'other']
    },
    referrer: String,             // Previous page
    referrerType: {
      type: String,
      enum: ['search', 'category', 'recommendation', 'direct', 'external', 'cart', 'other']
    },
    
    // Product context (denormalized for fast queries)
    productCategory: String,
    productSubCategory: String,
    productPrice: Number,
    productBrand: String,
    
    // Recommendation context
    recommendationType: String,   // Which algorithm recommended this
    recommendationPosition: Number, // Position in recommendation list
    recommendationScore: Number,  // ML confidence score
    
    // Engagement metrics
    dwellTime: Number,            // Time spent in milliseconds
    scrollDepth: Number,          // 0-100 percentage
    imagesViewed: Number,         // How many product images viewed
    reviewsViewed: Boolean,       // Did user read reviews
    
    // Cart context
    cartValue: Number,
    cartItemCount: Number,
    
    // Session context
    sessionId: String,
    sessionSequence: Number,      // Event order in session
    
    // Device context
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile']
    },
    browser: String,
    os: String,
    screenSize: String,
    
    // Purchase context
    purchaseAmount: Number,
    quantity: Number,
    size: String,
    color: String,
    discountApplied: Number,
    couponUsed: String
  },
  
  // Implicit signals
  signals: {
    // View signals
    repeated: Boolean,            // Is this a repeat view?
    viewCount: Number,            // Nth view of this product
    daysSinceLastView: Number,
    
    // Interest signals
    addedToCartAfter: Boolean,    // Did user add to cart after this event?
    purchasedAfter: Boolean,      // Did user purchase after this event?
    timeToConversion: Number,     // Milliseconds to add to cart/purchase
    
    // Engagement signals
    bounced: Boolean,             // Did user leave immediately?
    engaged: Boolean,             // Spent meaningful time
    comparedWith: [mongoose.Schema.Types.ObjectId], // Products compared with
    viewedSimilar: [mongoose.Schema.Types.ObjectId] // Similar products viewed in same session
  },
  
  // Timestamp with sub-second precision
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // For TTL - auto-delete old events (optional, comment out to keep all)
  // expireAt: {
  //   type: Date,
  //   default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  // }
}, {
  timestamps: true,
  // Optimize for time-series data
  timeseries: {
    timeField: 'timestamp',
    metaField: 'userId',
    granularity: 'minutes'
  }
});

// Compound indexes for efficient queries
userInteractionSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
userInteractionSchema.index({ productId: 1, eventType: 1, timestamp: -1 });
userInteractionSchema.index({ userId: 1, productId: 1, eventType: 1 });
userInteractionSchema.index({ 'metadata.sessionId': 1, timestamp: 1 });
userInteractionSchema.index({ 'searchData.query': 'text' });
userInteractionSchema.index({ timestamp: -1, eventType: 1 });

// TTL index (uncomment to auto-delete old events)
// userInteractionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const UserInteraction = mongoose.model("UserInteraction", userInteractionSchema);

export default UserInteraction;
