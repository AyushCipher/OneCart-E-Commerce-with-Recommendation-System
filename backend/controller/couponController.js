import Coupon from "../model/couponModel.js";
import { validateAndComputeDiscount } from "../services/couponService.js";
import AppError from "../utils/AppError.js";

// USER: preview a coupon's discount against the current cart amount (no redemption yet)
export const validateCoupon = async (req, res) => {
  const { code, amount } = req.body;
  if (!code || amount == null) {
    throw new AppError("code and amount are required", 400);
  }

  try {
    const { discount } = await validateAndComputeDiscount({ code, userId: req.userId, amount });

    return res.status(200).json({
      message: "Coupon applied",
      code: code.trim().toUpperCase(),
      discount,
      finalAmount: Math.max(amount - discount, 0)
    });
  } catch (error) {
    // Invalid/expired/already-used coupon is a client-facing 400, not a server error
    throw new AppError(error.message, 400);
  }
};

// ADMIN: create a coupon
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiresAt, usageLimit } = req.body;

  if (!code || !discountType || discountValue == null) {
    throw new AppError("code, discountType and discountValue are required", 400);
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount ?? null,
    expiresAt: expiresAt || null,
    usageLimit: usageLimit ?? null
  });

  return res.status(201).json(coupon);
};

// ADMIN: list all coupons
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  return res.status(200).json(coupons);
};

// ADMIN: toggle a coupon's active state
export const toggleCoupon = async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return res.status(200).json(coupon);
};

// ADMIN: delete a coupon
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);
  return res.status(200).json({ message: "Coupon deleted" });
};
