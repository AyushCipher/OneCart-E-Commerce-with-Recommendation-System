import mongoose from "mongoose";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import UserInteraction from "../model/userInteractionModel.js";
import { 
  ProductSimilarity, 
  UserSimilarity, 
  UserProfile, 
  ProductFeatures,
  RecommendationCache 
} from "../model/mlModels.js";
import { RECOMMENDATION_CONFIG } from "../config/recommendationConfig.js";

/**
 * Advanced ML Recommendation Engine
 * Production-ready implementation with:
 * - Collaborative Filtering (User-User & Item-Item)
 * - Content-Based Filtering (TF-IDF + Cosine Similarity)
 * - Matrix Factorization concepts
 * - Hybrid approaches
 * - Cold-start handling
 * - Real-time personalization
 */
class MLRecommendationEngine {
  
  // ================== CONTENT-BASED FILTERING ==================
  
  /**
   * Calculate TF-IDF vector for product text
   * @param {string} text - Product name + description
   * @param {Map} idf - Inverse document frequency map
   */
  static calculateTFIDF(text, idf) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    // Calculate term frequency
    const tf = {};
    words.forEach(word => {
      tf[word] = (tf[word] || 0) + 1;
    });
    
    // Normalize TF and multiply by IDF
    const totalWords = words.length;
    const tfidf = {};
    Object.keys(tf).forEach(word => {
      const normalizedTf = tf[word] / totalWords;
      const wordIdf = idf.get(word) || 1;
      tfidf[word] = normalizedTf * wordIdf;
    });
    
    return tfidf;
  }

  /**
   * Calculate cosine similarity between two TF-IDF vectors
   */
  static cosineSimilarity(vec1, vec2) {
    const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    allKeys.forEach(key => {
      const v1 = vec1[key] || 0;
      const v2 = vec2[key] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Calculate content similarity between two products
   * Considers: category, subcategory, price range, text similarity
   */
  static calculateContentSimilarity(product1, product2, textSimilarity = 0) {
    const weights = RECOMMENDATION_CONFIG.contentBased.similarity;
    let score = 0;
    let maxScore = 0;

    // Category match (exact)
    if (product1.category === product2.category) {
      score += weights.categoryMatch;
    }
    maxScore += weights.categoryMatch;

    // SubCategory match (exact)
    if (product1.subCategory === product2.subCategory) {
      score += weights.subCategoryMatch;
    }
    maxScore += weights.subCategoryMatch;

    // Price range similarity (within 30%)
    const priceRatio = Math.min(product1.price, product2.price) / 
                       Math.max(product1.price, product2.price);
    if (priceRatio >= 0.7) { // Within 30%
      score += weights.priceRangeSimilarity * priceRatio;
    }
    maxScore += weights.priceRangeSimilarity;

    // Rating similarity (within 1 star)
    if (product1.ratings && product2.ratings) {
      const ratingDiff = Math.abs(product1.ratings - product2.ratings);
      if (ratingDiff <= 1) {
        score += weights.ratingSimilarity * (1 - ratingDiff);
      }
    }
    maxScore += weights.ratingSimilarity;

    // Text similarity (TF-IDF)
    if (textSimilarity > 0) {
      score += textSimilarity * 0.2; // 20% weight for text
      maxScore += 0.2;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Get content-based recommendations
   * Finds products similar to what user has interacted with
   */
  static async getContentBasedRecommendations(userId, limit = 10) {
    try {
      // Get user's interaction history
      const userProfile = await UserProfile.findOne({ userId });
      const user = await User.findById(userId);
      
      if (!user && !userProfile) {
        return { products: [], strategy: 'content', coldStart: true };
      }

      // Get products user has interacted with
      const viewedIds = user?.viewedProducts?.map(v => v.productId) || [];
      const purchasedIds = user?.purchasedProducts?.map(p => p.productId) || [];
      const interactedIds = [...new Set([...viewedIds, ...purchasedIds])];

      if (interactedIds.length === 0) {
        return { products: [], strategy: 'content', coldStart: true };
      }

      // Get interacted products
      const interactedProducts = await Product.find({ 
        _id: { $in: interactedIds } 
      }).lean();

      if (interactedProducts.length === 0) {
        return { products: [], strategy: 'content', coldStart: true };
      }

      // Get all candidate products
      const candidateProducts = await Product.find({
        _id: { $nin: interactedIds }
      }).lean();

      // Calculate IDF for text similarity
      const allProducts = [...interactedProducts, ...candidateProducts];
      const idf = this.calculateIDF(allProducts);

      // Calculate TF-IDF vectors for all products
      const productVectors = new Map();
      allProducts.forEach(product => {
        const text = `${product.name} ${product.description}`;
        productVectors.set(product._id.toString(), this.calculateTFIDF(text, idf));
      });

      // Score each candidate product
      const scores = [];
      
      for (const candidate of candidateProducts) {
        let totalSimilarity = 0;
        let count = 0;

        for (const interacted of interactedProducts) {
          // Calculate text similarity
          const textSim = this.cosineSimilarity(
            productVectors.get(candidate._id.toString()),
            productVectors.get(interacted._id.toString())
          );

          // Calculate overall content similarity
          const similarity = this.calculateContentSimilarity(
            interacted,
            candidate,
            textSim
          );

          // Weight by recency (more recent interactions count more)
          const interactedIndex = viewedIds.findIndex(
            id => id?.toString() === interacted._id.toString()
          );
          const recencyWeight = interactedIndex >= 0 
            ? Math.exp(-interactedIndex * 0.1) 
            : 0.5;

          totalSimilarity += similarity * recencyWeight;
          count++;
        }

        const averageSimilarity = count > 0 ? totalSimilarity / count : 0;
        
        if (averageSimilarity > 0.1) { // Minimum threshold
          scores.push({
            product: candidate,
            score: averageSimilarity,
            reason: 'Similar to products you viewed'
          });
        }
      }

      // Sort by score and return top N
      scores.sort((a, b) => b.score - a.score);
      const recommendations = scores.slice(0, limit);

      return {
        products: recommendations.map(r => ({
          ...r.product,
          recommendationScore: r.score,
          recommendationReason: r.reason
        })),
        strategy: 'content',
        coldStart: false
      };
    } catch (error) {
      console.error('Content-based recommendation error:', error);
      return { products: [], strategy: 'content', error: error.message };
    }
  }

  /**
   * Calculate IDF (Inverse Document Frequency) for all terms
   */
  static calculateIDF(products) {
    const documentCount = products.length;
    const termDocumentCount = new Map();

    // Count documents containing each term
    products.forEach(product => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      const words = new Set(text.replace(/[^\w\s]/g, '').split(/\s+/));
      words.forEach(word => {
        if (word.length > 2) {
          termDocumentCount.set(word, (termDocumentCount.get(word) || 0) + 1);
        }
      });
    });

    // Calculate IDF
    const idf = new Map();
    termDocumentCount.forEach((count, term) => {
      idf.set(term, Math.log(documentCount / count));
    });

    return idf;
  }

  // ================== COLLABORATIVE FILTERING ==================

  /**
   * User-User Collaborative Filtering
   * Finds users with similar behavior and recommends what they liked
   */
  static async getUserUserRecommendations(userId, limit = 10) {
    try {
      const currentUser = await User.findById(userId);
      
      if (!currentUser) {
        return { products: [], strategy: 'user-user', coldStart: true };
      }

      const userPurchasedIds = currentUser.purchasedProducts?.map(
        p => p.productId?.toString()
      ).filter(Boolean) || [];

      const userViewedIds = currentUser.viewedProducts?.map(
        v => v.productId?.toString()
      ).filter(Boolean) || [];

      const userInteractedSet = new Set([...userPurchasedIds, ...userViewedIds]);

      if (userInteractedSet.size === 0) {
        return { products: [], strategy: 'user-user', coldStart: true };
      }

      // Find similar users based on interaction overlap
      const allUsers = await User.find({
        _id: { $ne: userId },
        $or: [
          { 'purchasedProducts.productId': { $in: userPurchasedIds } },
          { 'viewedProducts.productId': { $in: userViewedIds } }
        ]
      }).limit(100);

      // Calculate similarity scores for each user
      const userSimilarities = allUsers.map(otherUser => {
        const otherPurchasedIds = new Set(
          otherUser.purchasedProducts?.map(p => p.productId?.toString()).filter(Boolean) || []
        );
        const otherViewedIds = new Set(
          otherUser.viewedProducts?.map(v => v.productId?.toString()).filter(Boolean) || []
        );
        const otherInteracted = new Set([...otherPurchasedIds, ...otherViewedIds]);

        // Jaccard similarity for purchases (weighted higher)
        const purchaseIntersection = userPurchasedIds.filter(id => otherPurchasedIds.has(id)).length;
        const purchaseUnion = new Set([...userPurchasedIds, ...otherPurchasedIds]).size;
        const purchaseSimilarity = purchaseUnion > 0 ? purchaseIntersection / purchaseUnion : 0;

        // Jaccard similarity for views
        const viewIntersection = userViewedIds.filter(id => otherViewedIds.has(id)).length;
        const viewUnion = new Set([...userViewedIds, ...otherViewedIds]).size;
        const viewSimilarity = viewUnion > 0 ? viewIntersection / viewUnion : 0;

        // Combined similarity (purchases weighted 2x)
        const combinedSimilarity = (purchaseSimilarity * 2 + viewSimilarity) / 3;

        return {
          user: otherUser,
          similarity: combinedSimilarity,
          commonPurchases: purchaseIntersection,
          otherPurchased: otherPurchasedIds,
          otherViewed: otherViewedIds
        };
      });

      // Sort by similarity and take top similar users
      userSimilarities.sort((a, b) => b.similarity - a.similarity);
      const topSimilarUsers = userSimilarities.slice(0, 20);

      if (topSimilarUsers.length === 0) {
        return { products: [], strategy: 'user-user', coldStart: true };
      }

      // Aggregate products from similar users
      const productScores = new Map();

      topSimilarUsers.forEach(({ user, similarity, otherPurchased, otherViewed }) => {
        // Weight purchased products higher
        otherPurchased.forEach(productId => {
          if (!userInteractedSet.has(productId)) {
            const currentScore = productScores.get(productId) || { score: 0, sources: 0 };
            productScores.set(productId, {
              score: currentScore.score + similarity * 2, // 2x weight for purchases
              sources: currentScore.sources + 1,
              reason: 'Users like you purchased this'
            });
          }
        });

        // Add viewed products with lower weight
        otherViewed.forEach(productId => {
          if (!userInteractedSet.has(productId) && !otherPurchased.has(productId)) {
            const currentScore = productScores.get(productId) || { score: 0, sources: 0 };
            productScores.set(productId, {
              score: currentScore.score + similarity,
              sources: currentScore.sources + 1,
              reason: 'Users like you viewed this'
            });
          }
        });
      });

      // Sort by score
      const sortedProducts = Array.from(productScores.entries())
        .filter(([_, data]) => data.sources >= 2) // Minimum 2 similar users
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit);

      // Fetch product details
      const productIds = sortedProducts.map(([id]) => id);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      // Map scores to products
      const recommendations = products.map(product => {
        const scoreData = productScores.get(product._id.toString());
        return {
          ...product,
          recommendationScore: scoreData?.score || 0,
          recommendationReason: scoreData?.reason || 'Recommended for you'
        };
      });

      // Sort by recommendation score
      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return {
        products: recommendations,
        strategy: 'user-user',
        coldStart: false,
        similarUsersFound: topSimilarUsers.length
      };
    } catch (error) {
      console.error('User-user collaborative filtering error:', error);
      return { products: [], strategy: 'user-user', error: error.message };
    }
  }

  /**
   * Item-Item Collaborative Filtering
   * Recommends products frequently bought/viewed together
   */
  static async getItemItemRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { products: [], strategy: 'item-item', coldStart: true };
      }

      const userViewedIds = user.viewedProducts?.map(v => v.productId).filter(Boolean) || [];
      const userPurchasedIds = user.purchasedProducts?.map(p => p.productId).filter(Boolean) || [];
      
      // Prioritize recent views/purchases
      const recentInteractions = [
        ...userViewedIds.slice(0, 5),
        ...userPurchasedIds.slice(0, 3)
      ];

      if (recentInteractions.length === 0) {
        return { products: [], strategy: 'item-item', coldStart: true };
      }

      // Find co-occurrence patterns
      const coOccurrenceScores = new Map();

      for (const productId of recentInteractions) {
        // Find users who interacted with this product
        const usersWhoInteracted = await User.find({
          _id: { $ne: userId },
          $or: [
            { 'viewedProducts.productId': productId },
            { 'purchasedProducts.productId': productId }
          ]
        }).limit(50);

        // Count what else they interacted with
        usersWhoInteracted.forEach(otherUser => {
          const otherPurchased = otherUser.purchasedProducts?.map(
            p => p.productId?.toString()
          ).filter(Boolean) || [];
          
          const otherViewed = otherUser.viewedProducts?.map(
            v => v.productId?.toString()
          ).filter(Boolean) || [];

          // Weight purchases higher
          otherPurchased.forEach(otherId => {
            if (!recentInteractions.some(id => id?.toString() === otherId)) {
              const current = coOccurrenceScores.get(otherId) || { score: 0, coViewCount: 0, coPurchaseCount: 0 };
              coOccurrenceScores.set(otherId, {
                score: current.score + 2,
                coViewCount: current.coViewCount,
                coPurchaseCount: current.coPurchaseCount + 1
              });
            }
          });

          otherViewed.forEach(otherId => {
            if (!recentInteractions.some(id => id?.toString() === otherId)) {
              const current = coOccurrenceScores.get(otherId) || { score: 0, coViewCount: 0, coPurchaseCount: 0 };
              coOccurrenceScores.set(otherId, {
                score: current.score + 1,
                coViewCount: current.coViewCount + 1,
                coPurchaseCount: current.coPurchaseCount
              });
            }
          });
        });
      }

      // Sort and get top products
      const sortedProducts = Array.from(coOccurrenceScores.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit);

      const productIds = sortedProducts.map(([id]) => id);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const recommendations = products.map(product => {
        const scoreData = coOccurrenceScores.get(product._id.toString());
        return {
          ...product,
          recommendationScore: scoreData?.score || 0,
          recommendationReason: scoreData?.coPurchaseCount > scoreData?.coViewCount 
            ? 'Frequently bought together'
            : 'Customers also viewed'
        };
      });

      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return {
        products: recommendations,
        strategy: 'item-item',
        coldStart: false
      };
    } catch (error) {
      console.error('Item-item collaborative filtering error:', error);
      return { products: [], strategy: 'item-item', error: error.message };
    }
  }

  // ================== POPULARITY-BASED ==================

  /**
   * Get trending products based on recent activity
   */
  static async getTrendingRecommendations(limit = 10) {
    try {
      // Get products with recent high activity
      const recentActivity = await UserInteraction.aggregate([
        {
          $match: {
            eventType: { $in: ['view', 'add_to_cart', 'purchase'] },
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        },
        {
          $group: {
            _id: '$productId',
            viewCount: {
              $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] }
            },
            cartCount: {
              $sum: { $cond: [{ $eq: ['$eventType', 'add_to_cart'] }, 1, 0] }
            },
            purchaseCount: {
              $sum: { $cond: [{ $eq: ['$eventType', 'purchase'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                '$viewCount',
                { $multiply: ['$cartCount', 3] },
                { $multiply: ['$purchaseCount', 10] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit * 2 } // Get extra in case some products don't exist
      ]);

      if (recentActivity.length === 0) {
        // Fallback to bestsellers
        const bestsellers = await Product.find({ bestseller: true })
          .sort({ ratings: -1, numOfReviews: -1 })
          .limit(limit)
          .lean();

        return {
          products: bestsellers.map(p => ({
            ...p,
            recommendationScore: p.ratings || 0,
            recommendationReason: 'Bestseller'
          })),
          strategy: 'trending',
          fallback: 'bestsellers'
        };
      }

      const productIds = recentActivity.map(a => a._id).filter(Boolean);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      const recommendations = recentActivity
        .map(activity => {
          const product = productMap.get(activity._id?.toString());
          if (!product) return null;
          return {
            ...product,
            recommendationScore: activity.trendingScore,
            recommendationReason: 'Trending now'
          };
        })
        .filter(Boolean)
        .slice(0, limit);

      return {
        products: recommendations,
        strategy: 'trending',
        coldStart: false
      };
    } catch (error) {
      console.error('Trending recommendations error:', error);
      // Fallback to basic bestsellers
      const bestsellers = await Product.find({ bestseller: true })
        .sort({ ratings: -1 })
        .limit(limit)
        .lean();

      return {
        products: bestsellers.map(p => ({
          ...p,
          recommendationScore: p.ratings || 0,
          recommendationReason: 'Popular product'
        })),
        strategy: 'trending',
        fallback: 'bestsellers'
      };
    }
  }

  // ================== CATEGORY-BASED ==================

  /**
   * Get recommendations based on user's category preferences
   */
  static async getCategoryBasedRecommendations(userId, limit = 10) {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      const user = await User.findById(userId);

      // Get category affinities
      let categoryAffinities = userProfile?.categoryAffinities || [];
      
      // Fallback to user's preferences if no profile
      if (categoryAffinities.length === 0 && user?.preferences?.favoriteCategories) {
        categoryAffinities = user.preferences.favoriteCategories.map(cat => ({
          category: cat,
          score: 1
        }));
      }

      if (categoryAffinities.length === 0) {
        return { products: [], strategy: 'category', coldStart: true };
      }

      // Sort by score and get top categories
      const topCategories = categoryAffinities
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(c => c.category);

      // Get user's already interacted products
      const excludeIds = [
        ...(user?.viewedProducts?.map(v => v.productId) || []),
        ...(user?.purchasedProducts?.map(p => p.productId) || [])
      ].filter(Boolean);

      // Get products from favorite categories
      const products = await Product.find({
        category: { $in: topCategories },
        _id: { $nin: excludeIds }
      })
        .sort({ bestseller: -1, ratings: -1, numOfReviews: -1 })
        .limit(limit)
        .lean();

      const recommendations = products.map((product, index) => {
        const categoryAffinity = categoryAffinities.find(
          c => c.category === product.category
        );
        return {
          ...product,
          recommendationScore: (categoryAffinity?.score || 0.5) * (1 - index * 0.05),
          recommendationReason: `Because you like ${product.category}`
        };
      });

      return {
        products: recommendations,
        strategy: 'category',
        coldStart: false
      };
    } catch (error) {
      console.error('Category-based recommendations error:', error);
      return { products: [], strategy: 'category', error: error.message };
    }
  }

  // ================== RATING-BASED FILTERING ==================

  /**
   * Rating-Based Recommendations
   * Recommends highly rated products in user's preferred categories
   * Also considers review quality and recency
   */
  static async getRatingBasedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      const userProfile = await UserProfile.findOne({ userId });

      // Get user's category preferences
      let preferredCategories = [];
      if (userProfile?.categoryAffinities?.length > 0) {
        preferredCategories = userProfile.categoryAffinities
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(c => c.category);
      } else if (user?.preferences?.favoriteCategories?.length > 0) {
        preferredCategories = user.preferences.favoriteCategories;
      }

      // Get user's already interacted products
      const excludeIds = [
        ...(user?.viewedProducts?.slice(-20).map(v => v.productId) || []),
        ...(user?.purchasedProducts?.map(p => p.productId) || [])
      ].filter(Boolean);

      // Build query for highly rated products
      // Relaxed thresholds for small catalogs
      let query = {
        _id: { $nin: excludeIds },
        ratings: { $gte: 0 } // Include all products, even unrated
      };

      // Prefer user's categories if available
      if (preferredCategories.length > 0) {
        query.category = { $in: preferredCategories };
      }

      // Fetch highly rated products
      let products = await Product.find(query)
        .sort({ ratings: -1, numOfReviews: -1 })
        .limit(limit * 2)
        .lean();

      // If not enough products, expand search to all categories
      if (products.length < limit) {
        const moreProducts = await Product.find({
          _id: { $nin: [...excludeIds, ...products.map(p => p._id)] }
        })
          .sort({ ratings: -1, numOfReviews: -1 })
          .limit(limit - products.length)
          .lean();
        products = [...products, ...moreProducts];
      }

      // Calculate rating-based scores
      const recommendations = products.slice(0, limit).map((product, index) => {
        // Score based on: rating (40%), review count (30%), bestseller (20%), recency (10%)
        const ratingScore = (product.ratings || 0) / 5;
        const reviewScore = Math.min((product.numOfReviews || 0) / 100, 1);
        const bestsellerScore = product.bestseller ? 1 : 0;
        const categoryMatchScore = preferredCategories.includes(product.category) ? 1 : 0.5;

        const totalScore = (ratingScore * 0.40) + 
                          (reviewScore * 0.25) + 
                          (bestsellerScore * 0.15) + 
                          (categoryMatchScore * 0.20);

        return {
          ...product,
          recommendationScore: totalScore,
          recommendationReason: product.ratings >= 4.5 
            ? 'Top rated product' 
            : product.ratings >= 4 
              ? 'Highly rated' 
              : 'Well reviewed'
        };
      });

      // Sort by calculated score
      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return {
        products: recommendations,
        strategy: 'rating',
        coldStart: false
      };
    } catch (error) {
      console.error('Rating-based recommendations error:', error);
      return { products: [], strategy: 'rating', error: error.message };
    }
  }

  // ================== REVIEW-BASED COLLABORATIVE FILTERING ==================

  /**
   * Review-Based Collaborative Filtering
   * Finds users with similar review patterns and recommends what they liked
   * Different from User-User CF as it focuses on rating behavior, not just interactions
   */
  static async getReviewBasedRecommendations(userId, limit = 10) {
    try {
      // Import Review model dynamically to avoid circular dependency
      const Review = (await import('../model/reviewModel.js')).default;

      // Get current user's reviews
      const userReviews = await Review.find({ user: userId }).lean();
      
      if (userReviews.length < 2) {
        // Not enough reviews for collaborative filtering
        return { products: [], strategy: 'review-cf', coldStart: true };
      }

      // Build user's rating vector (product -> rating)
      const userRatings = new Map();
      userReviews.forEach(r => {
        userRatings.set(r.product.toString(), r.rating);
      });

      // Find users who reviewed similar products
      const userProductIds = Array.from(userRatings.keys());
      const usersWithOverlap = await Review.aggregate([
        {
          $match: {
            product: { $in: userProductIds.map(id => new mongoose.Types.ObjectId(id)) },
            user: { $ne: new mongoose.Types.ObjectId(userId) }
          }
        },
        {
          $group: {
            _id: '$user',
            reviewedProducts: { $push: { product: '$product', rating: '$rating' } },
            overlapCount: { $sum: 1 }
          }
        },
        {
          $match: { overlapCount: { $gte: 1 } }
        },
        { $sort: { overlapCount: -1 } },
        { $limit: 50 }
      ]);

      if (usersWithOverlap.length === 0) {
        return { products: [], strategy: 'review-cf', coldStart: true };
      }

      // Calculate Pearson correlation for each similar user
      const userSimilarities = [];

      for (const similarUser of usersWithOverlap) {
        const otherRatings = new Map();
        similarUser.reviewedProducts.forEach(r => {
          otherRatings.set(r.product.toString(), r.rating);
        });

        // Find common products
        const commonProducts = Array.from(userRatings.keys())
          .filter(id => otherRatings.has(id));

        if (commonProducts.length < 1) continue;

        // Calculate Pearson correlation coefficient
        const n = commonProducts.length;
        let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;

        commonProducts.forEach(productId => {
          const x = userRatings.get(productId);
          const y = otherRatings.get(productId);
          sumXY += x * y;
          sumX += x;
          sumY += y;
          sumX2 += x * x;
          sumY2 += y * y;
        });

        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        const pearsonCorrelation = denominator === 0 ? 0 : numerator / denominator;

        if (pearsonCorrelation > 0.3) { // Minimum correlation threshold
          // Get products this user rated highly but current user hasn't seen
          const recommendedProducts = await Review.find({
            user: similarUser._id,
            rating: { $gte: 4 },
            product: { $nin: userProductIds.map(id => new mongoose.Types.ObjectId(id)) }
          }).lean();

          userSimilarities.push({
            userId: similarUser._id,
            correlation: pearsonCorrelation,
            recommendations: recommendedProducts
          });
        }
      }

      // Aggregate product scores from similar users
      const productScores = new Map();

      userSimilarities.forEach(({ correlation, recommendations }) => {
        recommendations.forEach(review => {
          const productId = review.product.toString();
          const current = productScores.get(productId) || { score: 0, count: 0 };
          const weightedRating = review.rating * correlation;
          productScores.set(productId, {
            score: current.score + weightedRating,
            count: current.count + 1
          });
        });
      });

      // Sort by weighted score
      const sortedProducts = Array.from(productScores.entries())
        .map(([id, data]) => ({
          productId: id,
          score: data.score / data.count,
          sources: data.count
        }))
        .filter(p => p.sources >= 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Fetch product details
      const productIds = sortedProducts.map(p => p.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      const recommendations = sortedProducts.map(sp => {
        const product = productMap.get(sp.productId);
        if (!product) return null;
        return {
          ...product,
          recommendationScore: sp.score,
          recommendationReason: 'Users with similar taste loved this'
        };
      }).filter(Boolean);

      return {
        products: recommendations,
        strategy: 'review-cf',
        coldStart: false,
        similarUsersFound: userSimilarities.length
      };
    } catch (error) {
      console.error('Review-based recommendations error:', error);
      return { products: [], strategy: 'review-cf', error: error.message };
    }
  }

  // ================== HYBRID RECOMMENDATION ==================

  /**
   * Hybrid Recommendation System
   * Combines multiple strategies with weighted scoring
   * Now includes rating-based and review-based collaborative filtering
   */
  static async getHybridRecommendations(userId, limit = 10, options = {}) {
    try {
      const {
        weights = {
          content: 0.20,
          userUser: 0.20,
          itemItem: 0.15,
          trending: 0.10,
          category: 0.10,
          rating: 0.15,
          reviewCF: 0.10
        },
        includeColdStart = true
      } = options;

      // Fetch all recommendation types in parallel (including new strategies)
      const [
        contentRecs,
        userUserRecs,
        itemItemRecs,
        trendingRecs,
        categoryRecs,
        ratingRecs,
        reviewCFRecs
      ] = await Promise.all([
        this.getContentBasedRecommendations(userId, limit * 2),
        this.getUserUserRecommendations(userId, limit * 2),
        this.getItemItemRecommendations(userId, limit * 2),
        this.getTrendingRecommendations(limit * 2),
        this.getCategoryBasedRecommendations(userId, limit * 2),
        this.getRatingBasedRecommendations(userId, limit * 2),
        this.getReviewBasedRecommendations(userId, limit * 2)
      ]);

      // Check for cold start
      const isColdStart = contentRecs.coldStart && 
                          userUserRecs.coldStart && 
                          categoryRecs.coldStart;

      if (isColdStart && includeColdStart) {
        // Cold start handling: use rating-based + trending
        const coldStartProducts = [
          ...ratingRecs.products.slice(0, Math.ceil(limit / 2)),
          ...trendingRecs.products.slice(0, Math.floor(limit / 2))
        ];
        
        // Deduplicate
        const seen = new Set();
        const uniqueProducts = coldStartProducts.filter(p => {
          if (seen.has(p._id.toString())) return false;
          seen.add(p._id.toString());
          return true;
        });

        return {
          products: uniqueProducts.slice(0, limit),
          strategy: 'hybrid',
          coldStart: true,
          message: 'New user - showing top rated and popular items'
        };
      }

      // Aggregate scores using weighted combination
      const scoreMap = new Map();

      const processRecs = (recs, weight, strategyName) => {
        recs.products.forEach((product, index) => {
          const productId = product._id.toString();
          const positionScore = 1 - (index / (recs.products.length || 1));
          const score = (product.recommendationScore || positionScore) * weight;

          const existing = scoreMap.get(productId) || {
            product,
            totalScore: 0,
            strategies: [],
            reasons: []
          };

          existing.totalScore += score;
          existing.strategies.push(strategyName);
          if (product.recommendationReason) {
            existing.reasons.push(product.recommendationReason);
          }

          scoreMap.set(productId, existing);
        });
      };

      // Process each recommendation type
      if (!contentRecs.coldStart) {
        processRecs(contentRecs, weights.content, 'content');
      }
      if (!userUserRecs.coldStart) {
        processRecs(userUserRecs, weights.userUser, 'user-user');
      }
      if (!itemItemRecs.coldStart) {
        processRecs(itemItemRecs, weights.itemItem, 'item-item');
      }
      processRecs(trendingRecs, weights.trending, 'trending');
      if (!categoryRecs.coldStart) {
        processRecs(categoryRecs, weights.category, 'category');
      }
      // Process rating-based recommendations
      if (!ratingRecs.coldStart && ratingRecs.products.length > 0) {
        processRecs(ratingRecs, weights.rating, 'rating');
      }
      // Process review-based collaborative filtering
      if (!reviewCFRecs.coldStart && reviewCFRecs.products.length > 0) {
        processRecs(reviewCFRecs, weights.reviewCF, 'review-cf');
      }

      // Sort by combined score
      const sortedRecommendations = Array.from(scoreMap.values())
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);

      // Format output
      const products = sortedRecommendations.map(rec => ({
        ...rec.product,
        recommendationScore: rec.totalScore,
        recommendationStrategies: [...new Set(rec.strategies)],
        recommendationReason: rec.reasons[0] || 'Recommended for you'
      }));

      return {
        products,
        strategy: 'hybrid',
        coldStart: false,
        strategiesUsed: {
          content: !contentRecs.coldStart,
          userUser: !userUserRecs.coldStart,
          itemItem: !itemItemRecs.coldStart,
          trending: true,
          category: !categoryRecs.coldStart,
          rating: !ratingRecs.coldStart && ratingRecs.products.length > 0,
          reviewCF: !reviewCFRecs.coldStart && reviewCFRecs.products.length > 0
        }
      };
    } catch (error) {
      console.error('Hybrid recommendations error:', error);
      
      // Fallback to trending
      const fallback = await this.getTrendingRecommendations(limit);
      return {
        products: fallback.products,
        strategy: 'hybrid',
        error: error.message,
        fallback: true
      };
    }
  }

  // ================== SIMILAR PRODUCTS ==================

  /**
   * Get products similar to a specific product
   * Used for "You may also like" on product pages
   */
  static async getSimilarProducts(productId, limit = 8) {
    try {
      const product = await Product.findById(productId).lean();
      
      if (!product) {
        return { products: [], error: 'Product not found' };
      }

      // Try to get from cache first
      const cached = await ProductSimilarity.findOne({ productId });
      
      if (cached && cached.similarProducts.length > 0 && 
          !cached.needsRecompute &&
          Date.now() - cached.computedAt < 24 * 60 * 60 * 1000) { // Cache valid for 24h
        
        const similarIds = cached.similarProducts
          .sort((a, b) => b.combinedScore - a.combinedScore)
          .slice(0, limit)
          .map(s => s.productId);

        const products = await Product.find({ _id: { $in: similarIds } }).lean();
        
        return {
          products: products.map(p => ({
            ...p,
            recommendationReason: 'Similar to what you\'re viewing'
          })),
          cached: true
        };
      }

      // Calculate similarities on the fly
      const allProducts = await Product.find({
        _id: { $ne: productId }
      }).lean();

      // Calculate IDF
      const idf = this.calculateIDF([product, ...allProducts]);

      // Calculate text vector for target product
      const targetText = `${product.name} ${product.description}`;
      const targetVector = this.calculateTFIDF(targetText, idf);

      // Score all products
      const scores = allProducts.map(candidate => {
        const candidateText = `${candidate.name} ${candidate.description}`;
        const candidateVector = this.calculateTFIDF(candidateText, idf);
        const textSimilarity = this.cosineSimilarity(targetVector, candidateVector);
        const contentSimilarity = this.calculateContentSimilarity(product, candidate, textSimilarity);

        return {
          product: candidate,
          score: contentSimilarity
        };
      });

      // Sort and return top matches
      scores.sort((a, b) => b.score - a.score);
      const topMatches = scores.slice(0, limit);

      // Cache the results
      await ProductSimilarity.findOneAndUpdate(
        { productId },
        {
          productId,
          similarProducts: scores.slice(0, 50).map(s => ({
            productId: s.product._id,
            combinedScore: s.score,
            contentScore: s.score
          })),
          computedAt: new Date(),
          needsRecompute: false
        },
        { upsert: true }
      );

      return {
        products: topMatches.map(m => ({
          ...m.product,
          recommendationScore: m.score,
          recommendationReason: 'Similar to what you\'re viewing'
        })),
        cached: false
      };
    } catch (error) {
      console.error('Similar products error:', error);
      
      // Fallback: same category products
      const product = await Product.findById(productId);
      if (product) {
        const fallback = await Product.find({
          _id: { $ne: productId },
          category: product.category
        })
          .sort({ bestseller: -1, ratings: -1 })
          .limit(limit)
          .lean();

        return {
          products: fallback.map(p => ({
            ...p,
            recommendationReason: `More in ${product.category}`
          })),
          fallback: true
        };
      }

      return { products: [], error: error.message };
    }
  }

  // ================== COLD START HANDLING ==================

  /**
   * Handle cold start for new users
   * Uses popularity + demographics (if available)
   */
  static async getColdStartRecommendations(userData = {}, limit = 10) {
    try {
      const { preferredCategories, priceRange } = userData;

      let query = {};

      // Apply category filter if provided
      if (preferredCategories && preferredCategories.length > 0) {
        query.category = { $in: preferredCategories };
      }

      // Apply price filter if provided
      if (priceRange) {
        query.price = {};
        if (priceRange.min) query.price.$gte = priceRange.min;
        if (priceRange.max) query.price.$lte = priceRange.max;
      }

      // Get popular products matching criteria
      const products = await Product.find(query)
        .sort({ bestseller: -1, ratings: -1, numOfReviews: -1 })
        .limit(limit)
        .lean();

      return {
        products: products.map(p => ({
          ...p,
          recommendationReason: 'Popular choice'
        })),
        strategy: 'cold-start'
      };
    } catch (error) {
      console.error('Cold start recommendations error:', error);
      return { products: [], error: error.message };
    }
  }

  // ================== MAIN ENTRY POINT ==================

  /**
   * Get personalized recommendations for a user
   * Main API entry point
   * Supports strategies: hybrid, content, collaborative, user-user, item-item,
   *                     trending, popularity, category, rating, review-cf
   */
  static async getRecommendations(userId, options = {}) {
    const {
      strategy = 'hybrid',
      limit = 10,
      excludeProductIds = []
    } = options;

    let result;

    switch (strategy) {
      case 'content':
        result = await this.getContentBasedRecommendations(userId, limit);
        break;
      case 'collaborative':
      case 'user-user':
        result = await this.getUserUserRecommendations(userId, limit);
        break;
      case 'item-item':
        result = await this.getItemItemRecommendations(userId, limit);
        break;
      case 'trending':
      case 'popularity':
        result = await this.getTrendingRecommendations(limit);
        break;
      case 'category':
        result = await this.getCategoryBasedRecommendations(userId, limit);
        break;
      case 'rating':
        result = await this.getRatingBasedRecommendations(userId, limit);
        break;
      case 'review-cf':
      case 'review':
        result = await this.getReviewBasedRecommendations(userId, limit);
        break;
      case 'hybrid':
      default:
        result = await this.getHybridRecommendations(userId, limit);
    }

    // Filter out excluded products
    if (excludeProductIds.length > 0) {
      const excludeSet = new Set(excludeProductIds.map(id => id.toString()));
      result.products = result.products.filter(
        p => !excludeSet.has(p._id.toString())
      );
    }

    return result;
  }
}

export default MLRecommendationEngine;
