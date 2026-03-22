import express from "express";
import isAuth from "../middleware/isAuth.js";
import { addReview, getAllReviews, getProductReviews } from "../controller/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", isAuth, addReview);
reviewRouter.get("/product/:productId", getProductReviews);
reviewRouter.get("/all", getAllReviews);

export default reviewRouter;
