import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
import axios from 'axios';
dotenv.config()

const currency = 'inr'
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

// For User
export const placeOrder = async (req,res) => {
    try {
        const {items, amount, address} = req.body;
        const userId = req.userId;
        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'COD',
            payment:false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        await User.findByIdAndUpdate(userId, {cartData:{}})

        // Track purchase for recommendations
        trackPurchase(userId, items);

        return res.status(201).json({message:'Order Placed'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Order Place error'})
    } 
}


export const placeOrderRazorpay = async (req,res) => {
    
    try { 
         const {items , amount , address} = req.body;
         const userId = req.userId;
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'Razorpay',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         // Track purchase for recommendations
         trackPurchase(userId, items);

         const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
         }

        try {
            const order = await razorpayInstance.orders.create(options);
            return res.status(200).json(order);
        } catch (err) {
            console.error('Razorpay Order Error:', err);
        return res.status(500).json({
            message: err.description || 'Order creation failed',
            error: err
        });
}
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }
}


export const verifyRazorpay = async (req,res) =>{
    try {
        const userId = req.userId
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid'){
            await Order.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await User.findByIdAndUpdate(userId, {cartData:{}})
            res.status(200).json({message:'Payment Successful'
            })
        }
        else{
            res.json({message:'Payment Failed'})
        }
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message})
    }
}

export const userOrders = async (req,res) => {
      try {
        const userId = req.userId;
        const orders = await Order.find({userId})
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"userOrders error"})
    }
    
}


// For Admin    
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"adminAllOrders error"})
    }
}
    

export const updateStatus = async (req,res) => {
    try {
        const {orderId, status} = req.body
        await Order.findByIdAndUpdate(orderId, { status })
        return res.status(201).json({message:'Status Updated'})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}