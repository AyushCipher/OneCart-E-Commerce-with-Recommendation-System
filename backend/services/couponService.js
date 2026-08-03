import Coupon from "../model/couponModel.js";

// Recomputes the discount from the stored coupon rules rather than trusting
// a client-sent discount value, so checkout can't be tampered with client-side.
export const validateAndComputeDiscount = async ({ code, userId, amount }) => {
  const coupon = await Coupon.findOne({ code: code?.trim().toUpperCase() });

  if (!coupon) throw new Error("Invalid coupon code");
  if (!coupon.isActive) throw new Error("This coupon is no longer active");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("This coupon has expired");
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }
  if (userId && coupon.usedBy.some((id) => id.toString() === userId.toString())) {
    throw new Error("You have already used this coupon");
  }
  if (amount < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`);
  }

  let discount = coupon.discountType === "percentage"
    ? (amount * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscountAmount != null) discount = Math.min(discount, coupon.maxDiscountAmount);
  discount = Math.min(discount, amount);
  discount = Math.round(discount * 100) / 100;

  return { coupon, discount };
};

export const redeemCoupon = async (couponId, userId) => {
  await Coupon.findByIdAndUpdate(couponId, {
    $inc: { usedCount: 1 },
    $addToSet: { usedBy: userId }
  });
};
