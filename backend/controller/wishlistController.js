import User from "../model/userModel.js";
import AppError from "../utils/AppError.js";

// GET WISHLIST
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.userId).populate("wishlist");
  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json(user.wishlist || []);
};


// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) throw new AppError("itemId is required", 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.wishlist.some((id) => id.toString() === itemId)) {
    return res.status(200).json({ message: "Already in wishlist" });
  }

  user.wishlist.push(itemId);
  await user.save();

  return res.status(201).json({ message: "Added to wishlist" });
};


// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) throw new AppError("itemId is required", 400);

  const user = await User.findById(req.userId);
  if (!user) throw new AppError("User not found", 404);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== itemId);
  await user.save();

  return res.status(200).json({ message: "Removed from wishlist" });
};
