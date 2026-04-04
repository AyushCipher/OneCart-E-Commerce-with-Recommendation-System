import RecommendationEngine from "../services/recommendationEngine.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";

/**
 * Get recommendations for authenticated user
 * Supports different strategies: hybrid (default), content, collaborative, popularity, category
 */
export const getRecommendations = async (req, res) => {
  try {
    const { strategy = "hybrid", limit = 8 } = req.query;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const recommendations = await RecommendationEngine.getRecommendations(
      userId,
      strategy,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      strategy,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * Track product view
 * Called when user views a product
 */
export const trackProductView = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Update user viewed products
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if product already in viewed list
    const existingView = user.viewedProducts.find(
      (v) => v.productId.toString() === productId
    );

    if (existingView) {
      // Update view count and timestamp
      existingView.viewCount += 1;
      existingView.viewedAt = Date.now();
    } else {
      // Add new view
      user.viewedProducts.push({
        productId,
        viewedAt: Date.now(),
        viewCount: 1
      });
    }

    // Update user preferences based on category
    if (!user.preferences) {
      user.preferences = {
        favoriteCategories: [],
        favoriteSubCategories: []
      };
    }

    // Track category preferences
    if (!user.preferences.favoriteCategories.includes(product.category)) {
      user.preferences.favoriteCategories.push(product.category);
    }
    if (!user.preferences.favoriteSubCategories.includes(product.subCategory)) {
      user.preferences.favoriteSubCategories.push(product.subCategory);
    }

    // Update price range preferences with null safety
    if (!user.preferences.priceRange) {
      user.preferences.priceRange = {
        min: Number(product.price) || 0,
        max: Number(product.price) || 0
      };
    } else {
      // Ensure we have valid numbers, not NaN
      const currentMin = Number(user.preferences.priceRange.min) || Number(product.price) || 0;
      const currentMax = Number(user.preferences.priceRange.max) || Number(product.price) || 0;
      const price = Number(product.price) || 0;
      
      user.preferences.priceRange.min = Math.min(currentMin, price);
      user.preferences.priceRange.max = Math.max(currentMax, price);
    }

    await user.save();

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
 * Track product purchase
 * Called when user completes an order
 */
export const trackProductPurchase = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    if (!userId || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product IDs array are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add products to purchased list
    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (product) {
        const existingPurchase = user.purchasedProducts.find(
          (p) => p.productId.toString() === productId
        );

        if (!existingPurchase) {
          user.purchasedProducts.push({
            productId,
            purchasedAt: Date.now()
          });
        }

        // Update user preferences
        if (!user.preferences) {
          user.preferences = {
            favoriteCategories: [],
            favoriteSubCategories: []
          };
        }

        if (!user.preferences.favoriteCategories.includes(product.category)) {
          user.preferences.favoriteCategories.push(product.category);
        }
        if (!user.preferences.favoriteSubCategories.includes(product.subCategory)) {
          user.preferences.favoriteSubCategories.push(product.subCategory);
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product purchases tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking product purchase:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking product purchase",
      error: error.message
    });
  }
};

/**
 * Get recommendations by strategy type
 */
export const getRecommendationsByStrategy = async (req, res) => {
  try {
    const { strategy = "hybrid" } = req.params;
    const { limit = 8 } = req.query;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const validStrategies = [
      "hybrid",
      "content",
      "collaborative",
      "popularity",
      "category"
    ];
    if (!validStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid strategy. Valid strategies: ${validStrategies.join(", ")}`
      });
    }

    const recommendations = await RecommendationEngine.getRecommendations(
      userId,
      strategy,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      strategy,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const user = await User.findById(userId).select("preferences viewedProducts purchasedProducts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      preferences: user.preferences,
      viewedProductsCount: user.viewedProducts.length,
      purchasedProductsCount: user.purchasedProducts.length
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user preferences",
      error: error.message
    });
  }
};
