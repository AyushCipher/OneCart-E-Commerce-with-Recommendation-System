import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import { RECOMMENDATION_CONFIG } from "../config/recommendationConfig.js";

/**
 * Recommendation Engine using hybrid approach:
 * - Collaborative Filtering: Based on similar users
 * - Content-Based: Based on product attributes (category, subcategory, price)
 * - Popularity: Based on ratings and bestseller status
 */

class RecommendationEngine {
  /**
   * Calculate similarity between two products based on attributes
   */
  static calculateProductSimilarity(product1, product2) {
    const weights = RECOMMENDATION_CONFIG.contentBased.similarity;
    let similarity = 0;
    let factors = 0;

    // Category match
    if (product1.category === product2.category) {
      similarity += weights.categoryMatch;
    }
    factors += weights.categoryMatch;

    // SubCategory match
    if (product1.subCategory === product2.subCategory) {
      similarity += weights.subCategoryMatch;
    }
    factors += weights.subCategoryMatch;

    // Price range similarity
    const priceRange = RECOMMENDATION_CONFIG.contentBased.similarity.priceRangeSimilarity / 0.3; // Percentage
    const priceDiff =
      Math.abs(product1.price - product2.price) /
      Math.max(product1.price, product2.price);
    if (priceDiff <= priceRange) {
      similarity += weights.priceRangeSimilarity;
    }
    factors += weights.priceRangeSimilarity;

    // Rating similarity
    if (
      Math.abs(product1.ratings - product2.ratings) <= 1 &&
      product1.ratings > 0 &&
      product2.ratings > 0
    ) {
      similarity += weights.ratingSimilarity;
    }
    factors += weights.ratingSimilarity;

    return similarity / factors;
  }

  /**
   * Content-Based Recommendations
   * Recommends products similar to ones the user has viewed/purchased
   */
  static async getContentBasedRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId).populate("viewedProducts.productId purchasedProducts.productId");

      if (!user || (!user.viewedProducts.length && !user.purchasedProducts.length)) {
        return [];
      }

      // Get all products
      const allProducts = await Product.find();

      // Combine viewed and purchased products
      const userInteractedProducts = [
        ...user.viewedProducts.map((v) => v.productId),
        ...user.purchasedProducts.map((p) => p.productId)
      ].filter((p) => p !== null);

      const similarityScores = {};

      // Calculate similarity for each product
      allProducts.forEach((product) => {
        // Skip already purchased/viewed products
        if (userInteractedProducts.some((p) => p._id.equals(product._id))) {
          return;
        }

        let totalSimilarity = 0;
        userInteractedProducts.forEach((userProduct) => {
          totalSimilarity += this.calculateProductSimilarity(userProduct, product);
        });

        const avgSimilarity = totalSimilarity / Math.max(userInteractedProducts.length, 1);
        if (avgSimilarity > 0) {
          similarityScores[product._id] = avgSimilarity;
        }
      });

      // Sort by similarity and return top N
      const recommendations = Object.entries(similarityScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([productId]) => productId);

      return await Product.find({ _id: { $in: recommendations } });
    } catch (error) {
      console.error("Content-Based Recommendation Error:", error);
      return [];
    }
  }

  /**
   * Collaborative Filtering Recommendations
   * Recommends products bought by users with similar preferences
   */
  static async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      const currentUser = await User.findById(userId).populate(
        "purchasedProducts.productId"
      );

      if (!currentUser || !currentUser.purchasedProducts.length) {
        return [];
      }

      // Get purchased product IDs
      const userPurchasedIds = currentUser.purchasedProducts.map((p) =>
        p.productId._id.toString()
      );

      const maxSimilarUsers = RECOMMENDATION_CONFIG.collaborative.maxSimilarUsers;

      // Find other users who bought similar products
      const similarUsers = await User.find({
        _id: { $ne: userId },
        "purchasedProducts.productId": { $in: userPurchasedIds }
      })
        .select("purchasedProducts")
        .populate("purchasedProducts.productId")
        .limit(maxSimilarUsers);

      if (!similarUsers.length) {
        return [];
      }

      // Aggregate products from similar users (excluding already purchased)
      const recommendedProducts = {};
      similarUsers.forEach((user) => {
        user.purchasedProducts.forEach((purchase) => {
          const productId = purchase.productId._id.toString();
          if (!userPurchasedIds.includes(productId)) {
            recommendedProducts[productId] =
              (recommendedProducts[productId] || 0) + 1;
          }
        });
      });

      // Sort by frequency and return top N
      const topRecommendations = Object.entries(recommendedProducts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([productId]) => productId);

      return await Product.find({ _id: { $in: topRecommendations } });
    } catch (error) {
      console.error("Collaborative Recommendation Error:", error);
      return [];
    }
  }

  /**
   * Popularity-Based Recommendations
   * Recommends trending/bestseller products
   */
  static async getPopularityRecommendations(limit = 5) {
    try {
      return await Product.find()
        .sort({
          bestseller: -1,
          ratings: -1,
          numOfReviews: -1
        })
        .limit(limit);
    } catch (error) {
      console.error("Popularity Recommendation Error:", error);
      return [];
    }
  }

  /**
   * Category-Based Recommendations
   * Recommends products from favorite categories
   */
  static async getCategoryRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId).populate(
        "viewedProducts.productId purchasedProducts.productId"
      );

      if (!user) {
        return [];
      }

      // Extract favorite categories from viewed/purchased products
      const categories = {};
      const subCategories = {};

      [
        ...user.viewedProducts.map((v) => v.productId),
        ...user.purchasedProducts.map((p) => p.productId)
      ]
        .filter((p) => p !== null)
        .forEach((product) => {
          categories[product.category] = (categories[product.category] || 0) + 1;
          subCategories[product.subCategory] =
            (subCategories[product.subCategory] || 0) + 1;
        });

      if (!Object.keys(categories).length) {
        return [];
      }

      const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0][0];
      const topSubCategory = Object.entries(subCategories).sort(
        ([, a], [, b]) => b - a
      )[0][0];

      // Get products from favorite categories
      const recommendations = await Product.find({
        $or: [
          { category: topCategory, subCategory: topSubCategory },
          { category: topCategory }
        ]
      })
        .limit(limit);

      return recommendations;
    } catch (error) {
      console.error("Category Recommendation Error:", error);
      return [];
    }
  }

  /**
   * Hybrid Recommendation System
   * Combines multiple recommendation strategies with weighted scoring
   */
  static async getHybridRecommendations(userId, limit = 8) {
    try {
      const weights = RECOMMENDATION_CONFIG.strategies.hybrid.weights;

      const [
        contentBased,
        collaborative,
        popularity,
        category
      ] = await Promise.all([
        this.getContentBasedRecommendations(userId, limit * 2),
        this.getCollaborativeRecommendations(userId, limit * 2),
        this.getPopularityRecommendations(limit * 2),
        this.getCategoryRecommendations(userId, limit * 2)
      ]);

      // Scoring system
      const scoreMap = {};

      // Content-based scoring
      contentBased.forEach((product, index) => {
        const score = (1 - index / limit) * weights.contentBased;
        scoreMap[product._id] = (scoreMap[product._id] || 0) + score;
      });

      // Collaborative scoring
      collaborative.forEach((product, index) => {
        const score = (1 - index / limit) * weights.collaborative;
        scoreMap[product._id] = (scoreMap[product._id] || 0) + score;
      });

      // Popularity scoring
      popularity.forEach((product, index) => {
        const score = (1 - index / limit) * weights.popularity;
        scoreMap[product._id] = (scoreMap[product._id] || 0) + score;
      });

      // Category scoring
      category.forEach((product, index) => {
        const score = (1 - index / limit) * weights.category;
        scoreMap[product._id] = (scoreMap[product._id] || 0) + score;
      });

      // Sort by score and get top recommendations
      const topRecommendationIds = Object.entries(scoreMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([productId]) => productId);

      // Get product details in order
      const recommendedProducts = await Product.find({
        _id: { $in: topRecommendationIds }
      });

      // Sort results to match score order
      return topRecommendationIds
        .map(
          (id) =>
            recommendedProducts.find((p) => p._id.toString() === id.toString())
        )
        .filter(Boolean);
    } catch (error) {
      console.error("Hybrid Recommendation Error:", error);
      return [];
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendations(userId, strategy = "hybrid", limit = 8) {
    switch (strategy) {
      case "content":
        return this.getContentBasedRecommendations(userId, limit);
      case "collaborative":
        return this.getCollaborativeRecommendations(userId, limit);
      case "popularity":
        return this.getPopularityRecommendations(limit);
      case "category":
        return this.getCategoryRecommendations(userId, limit);
      case "hybrid":
      default:
        return this.getHybridRecommendations(userId, limit);
    }
  }
}

export default RecommendationEngine;
