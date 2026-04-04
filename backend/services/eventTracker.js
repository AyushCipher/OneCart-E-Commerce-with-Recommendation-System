import UserInteraction from "../model/userInteractionModel.js";
import { UserProfile, ProductFeatures } from "../model/mlModels.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Advanced Event Tracker Service
 * Handles all user interaction tracking for ML recommendations
 * Similar to Amazon's clickstream data collection
 */
class EventTracker {
  /**
   * Track any user event
   */
  static async trackEvent(eventData) {
    try {
      const {
        userId,
        eventType,
        productId,
        searchData,
        metadata = {},
        signals = {}
      } = eventData;

      // Create interaction record
      const interaction = new UserInteraction({
        userId,
        eventType,
        productId,
        searchData,
        metadata: {
          ...metadata,
          timestamp: new Date()
        },
        signals,
        timestamp: new Date()
      });

      await interaction.save();

      // Update user profile asynchronously (non-blocking)
      this.updateUserProfileAsync(userId, eventData).catch(err => 
        console.error('Profile update error:', err.message)
      );

      // Update product features asynchronously
      if (productId) {
        this.updateProductFeaturesAsync(productId, eventType).catch(err =>
          console.error('Product features update error:', err.message)
        );
      }

      return interaction;
    } catch (error) {
      console.error('Event tracking error:', error);
      throw error;
    }
  }

  /**
   * Track product view with rich context
   */
  static async trackProductView(data) {
    const {
      userId,
      productId,
      product,
      referrer,
      referrerType,
      sessionId,
      deviceInfo = {}
    } = data;

    // Check for repeat views
    const previousViews = await UserInteraction.countDocuments({
      userId,
      productId,
      eventType: 'view'
    });

    const lastView = await UserInteraction.findOne({
      userId,
      productId,
      eventType: 'view'
    }).sort({ timestamp: -1 });

    const daysSinceLastView = lastView 
      ? Math.floor((Date.now() - lastView.timestamp) / (1000 * 60 * 60 * 24))
      : null;

    return this.trackEvent({
      userId,
      eventType: 'view',
      productId,
      metadata: {
        pageType: 'product',
        referrer,
        referrerType: referrerType || this.inferReferrerType(referrer),
        productCategory: product?.category,
        productSubCategory: product?.subCategory,
        productPrice: product?.price,
        sessionId: sessionId || this.getOrCreateSessionId(userId),
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screenSize: deviceInfo.screenSize
      },
      signals: {
        repeated: previousViews > 0,
        viewCount: previousViews + 1,
        daysSinceLastView
      }
    });
  }

  /**
   * Track search event
   */
  static async trackSearch(data) {
    const {
      userId,
      query,
      filters,
      sortBy,
      resultsCount,
      sessionId
    } = data;

    return this.trackEvent({
      userId,
      eventType: 'search',
      searchData: {
        query,
        resultsCount,
        filters,
        sortBy
      },
      metadata: {
        pageType: 'search',
        sessionId: sessionId || this.getOrCreateSessionId(userId)
      }
    });
  }

  /**
   * Track search result click
   */
  static async trackSearchClick(data) {
    const {
      userId,
      productId,
      product,
      searchQuery,
      clickedPosition,
      sessionId
    } = data;

    return this.trackEvent({
      userId,
      eventType: 'click',
      productId,
      searchData: {
        query: searchQuery,
        clickedProductIndex: clickedPosition
      },
      metadata: {
        pageType: 'search',
        referrerType: 'search',
        productCategory: product?.category,
        productSubCategory: product?.subCategory,
        productPrice: product?.price,
        sessionId
      }
    });
  }

  /**
   * Track add to cart
   */
  static async trackAddToCart(data) {
    const {
      userId,
      productId,
      product,
      quantity = 1,
      size,
      referrer,
      referrerType,
      sessionId
    } = data;

    // Update previous view signals
    await this.updateViewSignals(userId, productId, { addedToCartAfter: true });

    return this.trackEvent({
      userId,
      eventType: 'add_to_cart',
      productId,
      metadata: {
        pageType: 'product',
        referrer,
        referrerType,
        productCategory: product?.category,
        productSubCategory: product?.subCategory,
        productPrice: product?.price,
        quantity,
        size,
        sessionId
      }
    });
  }

  /**
   * Track remove from cart
   */
  static async trackRemoveFromCart(data) {
    const { userId, productId, product, sessionId } = data;

    return this.trackEvent({
      userId,
      eventType: 'remove_from_cart',
      productId,
      metadata: {
        pageType: 'cart',
        productCategory: product?.category,
        productSubCategory: product?.subCategory,
        productPrice: product?.price,
        sessionId
      }
    });
  }

  /**
   * Track purchase
   */
  static async trackPurchase(data) {
    const {
      userId,
      products,  // Array of { productId, quantity, price, size }
      totalAmount,
      paymentMethod,
      couponUsed,
      sessionId
    } = data;

    const interactions = [];

    for (const product of products) {
      // Update view signals for purchased product
      await this.updateViewSignals(userId, product.productId, { purchasedAfter: true });

      const interaction = await this.trackEvent({
        userId,
        eventType: 'purchase',
        productId: product.productId,
        metadata: {
          pageType: 'checkout',
          productCategory: product.category,
          productSubCategory: product.subCategory,
          productPrice: product.price,
          purchaseAmount: product.price * product.quantity,
          quantity: product.quantity,
          size: product.size,
          discountApplied: product.discount || 0,
          couponUsed,
          sessionId
        }
      });

      interactions.push(interaction);
    }

    return interactions;
  }

  /**
   * Track recommendation click
   */
  static async trackRecommendationClick(data) {
    const {
      userId,
      productId,
      product,
      recommendationType,
      recommendationPosition,
      recommendationScore,
      sessionId
    } = data;

    return this.trackEvent({
      userId,
      eventType: 'recommendation_click',
      productId,
      metadata: {
        pageType: this.inferPageType(data.pageContext),
        referrerType: 'recommendation',
        productCategory: product?.category,
        productSubCategory: product?.subCategory,
        productPrice: product?.price,
        recommendationType,
        recommendationPosition,
        recommendationScore,
        sessionId
      }
    });
  }

  /**
   * Track time on product page
   */
  static async trackTimeOnPage(data) {
    const {
      userId,
      productId,
      dwellTime,
      scrollDepth,
      imagesViewed,
      reviewsViewed,
      sessionId
    } = data;

    // Determine if user was engaged (spent meaningful time)
    const engaged = dwellTime > 10000 || scrollDepth > 50;
    const bounced = dwellTime < 3000 && scrollDepth < 20;

    return this.trackEvent({
      userId,
      eventType: 'time_on_page',
      productId,
      metadata: {
        pageType: 'product',
        dwellTime,
        scrollDepth,
        imagesViewed,
        reviewsViewed,
        sessionId
      },
      signals: {
        engaged,
        bounced
      }
    });
  }

  /**
   * Track category browse
   */
  static async trackCategoryBrowse(data) {
    const { userId, category, subCategory, filters, sessionId } = data;

    return this.trackEvent({
      userId,
      eventType: 'category_browse',
      metadata: {
        pageType: 'collection',
        productCategory: category,
        productSubCategory: subCategory,
        sessionId
      },
      searchData: {
        filters
      }
    });
  }

  /**
   * Track filter/sort application
   */
  static async trackFilterApply(data) {
    const { userId, filters, sortBy, category, sessionId } = data;

    return this.trackEvent({
      userId,
      eventType: 'filter_apply',
      metadata: {
        pageType: 'collection',
        productCategory: category,
        sessionId
      },
      searchData: {
        filters,
        sortBy
      }
    });
  }

  /**
   * Track session start
   */
  static async trackSessionStart(data) {
    const { userId, deviceInfo = {}, referrer } = data;
    
    const sessionId = uuidv4();

    await this.trackEvent({
      userId,
      eventType: 'session_start',
      metadata: {
        pageType: 'home',
        referrer,
        sessionId,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screenSize: deviceInfo.screenSize
      }
    });

    return sessionId;
  }

  /**
   * Track session end
   */
  static async trackSessionEnd(data) {
    const { userId, sessionId, sessionDuration, pagesViewed, productsViewed } = data;

    return this.trackEvent({
      userId,
      eventType: 'session_end',
      metadata: {
        pageType: 'other',
        sessionId,
        dwellTime: sessionDuration
      },
      signals: {
        engaged: sessionDuration > 60000 || pagesViewed > 3
      }
    });
  }

  // ============ Helper Methods ============

  /**
   * Update signals on previous view events
   */
  static async updateViewSignals(userId, productId, signalUpdates) {
    try {
      const latestView = await UserInteraction.findOne({
        userId,
        productId,
        eventType: 'view'
      }).sort({ timestamp: -1 });

      if (latestView) {
        Object.assign(latestView.signals, signalUpdates);
        
        // Calculate time to conversion
        if (signalUpdates.addedToCartAfter || signalUpdates.purchasedAfter) {
          latestView.signals.timeToConversion = Date.now() - latestView.timestamp;
        }
        
        await latestView.save();
      }
    } catch (error) {
      console.error('Error updating view signals:', error);
    }
  }

  /**
   * Update user profile asynchronously
   */
  static async updateUserProfileAsync(userId, eventData) {
    try {
      let profile = await UserProfile.findOne({ userId });
      
      if (!profile) {
        profile = new UserProfile({ userId });
      }

      // Update category affinities
      if (eventData.metadata?.productCategory) {
        const category = eventData.metadata.productCategory;
        const existingAffinity = profile.categoryAffinities.find(a => a.category === category);
        
        if (existingAffinity) {
          existingAffinity.score = Math.min(1, existingAffinity.score + 0.1);
          if (eventData.eventType === 'view') existingAffinity.viewCount++;
          if (eventData.eventType === 'purchase') existingAffinity.purchaseCount++;
          existingAffinity.lastInteraction = new Date();
        } else {
          profile.categoryAffinities.push({
            category,
            score: 0.1,
            viewCount: eventData.eventType === 'view' ? 1 : 0,
            purchaseCount: eventData.eventType === 'purchase' ? 1 : 0,
            lastInteraction: new Date()
          });
        }
      }

      // Update sub-category affinities
      if (eventData.metadata?.productSubCategory) {
        const subCategory = eventData.metadata.productSubCategory;
        const existingAffinity = profile.subCategoryAffinities.find(a => a.subCategory === subCategory);
        
        if (existingAffinity) {
          existingAffinity.score = Math.min(1, existingAffinity.score + 0.1);
          if (eventData.eventType === 'view') existingAffinity.viewCount++;
          if (eventData.eventType === 'purchase') existingAffinity.purchaseCount++;
          existingAffinity.lastInteraction = new Date();
        } else {
          profile.subCategoryAffinities.push({
            subCategory,
            score: 0.1,
            viewCount: eventData.eventType === 'view' ? 1 : 0,
            purchaseCount: eventData.eventType === 'purchase' ? 1 : 0,
            lastInteraction: new Date()
          });
        }
      }

      // Update price preferences
      if (eventData.metadata?.productPrice) {
        const price = Number(eventData.metadata.productPrice) || 0;
        if (!profile.pricePreference) {
          profile.pricePreference = {
            min: price,
            max: price,
            average: price,
            median: price,
            variance: 0,
            segment: 'unknown'
          };
        } else {
          // Ensure values are numbers, not NaN
          profile.pricePreference.min = Math.min(profile.pricePreference.min || price, price);
          profile.pricePreference.max = Math.max(profile.pricePreference.max || price, price);
          // Simple moving average
          const avgPrice = profile.pricePreference.average || 0;
          profile.pricePreference.average = (avgPrice + price) / 2;
          profile.pricePreference.median = (profile.pricePreference.median || 0);
          profile.pricePreference.variance = (profile.pricePreference.variance || 0);
        }
        
        // Determine price segment
        if (profile.pricePreference.average < 500) {
          profile.pricePreference.segment = 'budget';
        } else if (profile.pricePreference.average < 1500) {
          profile.pricePreference.segment = 'mid-range';
        } else if (profile.pricePreference.average < 5000) {
          profile.pricePreference.segment = 'premium';
        } else {
          profile.pricePreference.segment = 'luxury';
        }
      }

      // Update recent activity
      if (!profile.recentActivity) {
        profile.recentActivity = {
          lastViewedProducts: [],
          lastSearchQueries: [],
          currentSessionProducts: []
        };
      }

      if (eventData.eventType === 'view' && eventData.productId) {
        // Keep only last 50 viewed products
        profile.recentActivity.lastViewedProducts = [
          { productId: eventData.productId, timestamp: new Date() },
          ...profile.recentActivity.lastViewedProducts.slice(0, 49)
        ];
      }

      if (eventData.eventType === 'search' && eventData.searchData?.query) {
        // Keep only last 20 searches
        profile.recentActivity.lastSearchQueries = [
          { query: eventData.searchData.query, timestamp: new Date() },
          ...profile.recentActivity.lastSearchQueries.slice(0, 19)
        ];
      }

      profile.lastUpdated = new Date();
      await profile.save();
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  /**
   * Update product features asynchronously
   */
  static async updateProductFeaturesAsync(productId, eventType) {
    try {
      let features = await ProductFeatures.findOne({ productId });
      
      if (!features) {
        features = new ProductFeatures({
          productId,
          popularity: {}
        });
      }

      // Update event counts
      if (!features.popularity) features.popularity = {};
      
      switch (eventType) {
        case 'view':
          features.popularity.viewCount = (features.popularity.viewCount || 0) + 1;
          features.popularity.viewsLast24h = (features.popularity.viewsLast24h || 0) + 1;
          break;
        case 'click':
          features.popularity.clickCount = (features.popularity.clickCount || 0) + 1;
          break;
        case 'add_to_cart':
          features.popularity.addToCartCount = (features.popularity.addToCartCount || 0) + 1;
          break;
        case 'purchase':
          features.popularity.purchaseCount = (features.popularity.purchaseCount || 0) + 1;
          features.popularity.purchasesLast24h = (features.popularity.purchasesLast24h || 0) + 1;
          break;
        case 'wishlist_add':
          features.popularity.wishlistCount = (features.popularity.wishlistCount || 0) + 1;
          break;
        case 'share':
          features.popularity.shareCount = (features.popularity.shareCount || 0) + 1;
          break;
      }

      // Calculate derived metrics
      if (features.popularity.viewCount > 0) {
        features.popularity.clickThroughRate = 
          (features.popularity.clickCount || 0) / features.popularity.viewCount;
        features.popularity.conversionRate = 
          (features.popularity.purchaseCount || 0) / features.popularity.viewCount;
      }

      // Calculate trending score (simple version)
      const viewWeight = 1;
      const cartWeight = 3;
      const purchaseWeight = 10;
      
      features.popularity.trendingScore = 
        (features.popularity.viewCount || 0) * viewWeight +
        (features.popularity.addToCartCount || 0) * cartWeight +
        (features.popularity.purchaseCount || 0) * purchaseWeight;

      features.computedAt = new Date();
      await features.save();
    } catch (error) {
      console.error('Error updating product features:', error);
    }
  }

  /**
   * Infer referrer type from URL
   */
  static inferReferrerType(referrer) {
    if (!referrer) return 'direct';
    if (referrer.includes('search')) return 'search';
    if (referrer.includes('collection') || referrer.includes('category')) return 'category';
    if (referrer.includes('cart')) return 'cart';
    if (referrer.includes('recommendation')) return 'recommendation';
    if (!referrer.includes(process.env.FRONTEND_URL || 'localhost')) return 'external';
    return 'other';
  }

  /**
   * Infer page type from context
   */
  static inferPageType(context) {
    if (!context) return 'other';
    if (context.includes('product')) return 'product';
    if (context.includes('home')) return 'home';
    if (context.includes('collection')) return 'collection';
    if (context.includes('cart')) return 'cart';
    if (context.includes('search')) return 'search';
    return 'other';
  }

  /**
   * Get or create session ID
   */
  static getOrCreateSessionId(userId) {
    // In a real implementation, this would be stored in user's session
    // For now, generate a new one
    return `${userId}-${Date.now()}`;
  }

  // ============ Analytics Queries ============

  /**
   * Get user's interaction summary
   */
  static async getUserInteractionSummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await UserInteraction.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastOccurred: { $max: '$timestamp' }
        }
      }
    ]);

    return summary;
  }

  /**
   * Get product's interaction summary
   */
  static async getProductInteractionSummary(productId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await UserInteraction.aggregate([
      {
        $match: {
          productId: productId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    return summary;
  }

  /**
   * Get co-viewed products (products viewed in same session)
   */
  static async getCoViewedProducts(productId, limit = 10) {
    const coViewed = await UserInteraction.aggregate([
      // Find all sessions that viewed this product
      {
        $match: {
          productId: productId,
          eventType: 'view'
        }
      },
      {
        $group: {
          _id: '$metadata.sessionId',
          timestamp: { $first: '$timestamp' }
        }
      },
      // Find other products viewed in those sessions
      {
        $lookup: {
          from: 'userinteractions',
          let: { sessionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$metadata.sessionId', '$$sessionId'] },
                    { $eq: ['$eventType', 'view'] },
                    { $ne: ['$productId', productId] }
                  ]
                }
              }
            }
          ],
          as: 'otherViews'
        }
      },
      { $unwind: '$otherViews' },
      {
        $group: {
          _id: '$otherViews.productId',
          coViewCount: { $sum: 1 }
        }
      },
      { $sort: { coViewCount: -1 } },
      { $limit: limit }
    ]);

    return coViewed;
  }
}

export default EventTracker;
