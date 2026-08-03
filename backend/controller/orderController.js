import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import Coupon from "../model/couponModel.js";
import { validateAndComputeDiscount, redeemCoupon } from "../services/couponService.js";
import AppError from "../utils/AppError.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
import axios from 'axios';
dotenv.config()

const currency = 'inr'
const DELIVERY_FEE = 40; // keep in sync with frontend/src/context/ShopContext.jsx delivery_fee

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

/**
 * Helper function to track product purchases for recommendations
 */
const trackPurchase = async (userId, items) => {
    try {
        const productIds = items.map(item => item._id || item.productId);
        await axios.post('http://localhost:8000/api/recommendations/track-purchase', {
            userId,
            productIds
        }).catch(err => console.log('Purchase tracking failed:', err.message));
    } catch (error) {
        console.log('Error tracking purchase:', error.message);
    }
};

// Recomputes the order total from persisted product prices and returns
// price-corrected line items. The client's submitted amount/price is never
// trusted here — it can be edited in devtools before the request is sent,
// so the only source of truth for what a product costs is the DB record.
const buildOrderFromItems = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Order must contain at least one item", 400);
    }

    const productIds = items.map((item) => item._id || item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let amount = 0;
    const sanitizedItems = items.map((item) => {
        const productId = (item._id || item.productId)?.toString();
        const product = productMap.get(productId);
        if (!product) throw new AppError(`Product ${productId} not found`, 404);

        const quantity = Number(item.quantity) || 0;
        if (quantity <= 0) throw new AppError(`Invalid quantity for ${product.name}`, 400);

        amount += product.price * quantity;

        return { ...item, price: product.price, name: product.name };
    });

    amount += DELIVERY_FEE;

    return { amount, sanitizedItems };
};

// For User
export const placeOrder = async (req, res) => {
    const { items, address, couponCode } = req.body;
    const userId = req.userId;

    const { amount, sanitizedItems } = await buildOrderFromItems(items);

    let finalAmount = amount;
    let appliedCoupon = null;
    let discount = 0;

    if (couponCode) {
        const result = await validateAndComputeDiscount({ code: couponCode, userId, amount });
        appliedCoupon = result.coupon;
        discount = result.discount;
        finalAmount = Math.max(amount - discount, 0);
    }

    const orderData = {
        items: sanitizedItems,
        amount: finalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount,
        userId,
        address,
        paymentMethod: 'COD',
        payment: false,
        date: Date.now()
    }

    const newOrder = new Order(orderData)
    await newOrder.save()

    if (appliedCoupon) await redeemCoupon(appliedCoupon._id, userId);

    await User.findByIdAndUpdate(userId, { cartData: {} })

    // Track purchase for recommendations
    trackPurchase(userId, sanitizedItems);

    return res.status(201).json({ message: 'Order Placed', amount: finalAmount, discount })
}


export const placeOrderRazorpay = async (req, res) => {
    const { items, address, couponCode } = req.body;
    const userId = req.userId;

    const { amount, sanitizedItems } = await buildOrderFromItems(items);

    let finalAmount = amount;
    let appliedCoupon = null;
    let discount = 0;

    if (couponCode) {
        const result = await validateAndComputeDiscount({ code: couponCode, userId, amount });
        appliedCoupon = result.coupon;
        discount = result.discount;
        finalAmount = Math.max(amount - discount, 0);
    }

    const orderData = {
        items: sanitizedItems,
        amount: finalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount,
        userId,
        address,
        paymentMethod: 'Razorpay',
        payment: false,
        date: Date.now()
    }

    const newOrder = new Order(orderData)
    await newOrder.save()

    // Track purchase for recommendations
    trackPurchase(userId, sanitizedItems);

    const options = {
        amount: Math.round(finalAmount * 100),
        currency: currency.toUpperCase(),
        receipt: newOrder._id.toString()
    }

    try {
        const order = await razorpayInstance.orders.create(options);
        return res.status(200).json(order);
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        throw new AppError(err.description || 'Order creation failed', 500);
    }
}


export const verifyRazorpay = async (req, res) => {
    const userId = req.userId
    const { razorpay_order_id } = req.body
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

    if (orderInfo.status === 'paid') {
        const paidOrder = await Order.findByIdAndUpdate(orderInfo.receipt, { payment: true });

        if (paidOrder?.couponCode) {
            const coupon = await Coupon.findOne({ code: paidOrder.couponCode });
            if (coupon) await redeemCoupon(coupon._id, userId);
        }

        await User.findByIdAndUpdate(userId, { cartData: {} })
        return res.status(200).json({ message: 'Payment Successful' })
    }

    return res.json({ message: 'Payment Failed' })
}

export const userOrders = async (req, res) => {
    const userId = req.userId;
    const orders = await Order.find({ userId })
    return res.status(200).json(orders)
}


// For Admin
export const allOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(200).json(orders)
}


export const updateStatus = async (req, res) => {
    const { orderId, status } = req.body
    await Order.findByIdAndUpdate(orderId, { status })
    return res.status(201).json({ message: 'Status Updated' })
}
