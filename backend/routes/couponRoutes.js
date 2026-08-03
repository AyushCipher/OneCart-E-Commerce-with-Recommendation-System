import express from "express";
import isAuth from "../middleware/isAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  toggleCoupon,
  deleteCoupon
} from "../controller/couponController.js";

const couponRoutes = express.Router();

// USER
couponRoutes.post("/validate", isAuth, validateCoupon);

// ADMIN
couponRoutes.post("/create", adminAuth, createCoupon);
couponRoutes.get("/list", adminAuth, getAllCoupons);
couponRoutes.put("/toggle/:id", adminAuth, toggleCoupon);
couponRoutes.delete("/:id", adminAuth, deleteCoupon);

export default couponRoutes;
