import Review from "../model/reviewModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import Order from "../model/orderModel.js";

export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const hasPurchased = await Order.findOne({ userId, "items._id": productId });
    if (!hasPurchased) {
      return res.status(403).json({ message: "You can only review products you have purchased" });
    }

    const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment
    });

    // Link review to User
    await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });

    // Update Product ratings
    product.reviews.push(review._id);
    product.numOfReviews = product.reviews.length;

    const allReviews = await Review.find({ product: productId });
    product.ratings =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await product.save();
    return res.status(201).json(review);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort({ reviewedAt: -1 });

    res.status(200).json(reviews);

  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews" });
  }
};


export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name email")
      .populate("product", "name image1 price")
      .sort({ reviewedAt: -1 });

    res.status(200).json(reviews);

  } catch (error) {
    console.error("All Reviews Error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};