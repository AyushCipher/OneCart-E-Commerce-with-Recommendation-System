import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../controller/wishlistController.js";

const wishlistRoutes = express.Router();

wishlistRoutes.get("/get", isAuth, getWishlist);
wishlistRoutes.post("/add", isAuth, addToWishlist);
wishlistRoutes.delete("/remove", isAuth, removeFromWishlist);

export default wishlistRoutes;
