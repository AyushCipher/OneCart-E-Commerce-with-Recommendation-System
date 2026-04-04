import mongoose from "mongoose";
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log("✓ MongoDB connected successfully")
    } catch (error) {
        console.error("✗ Database connection failed:", error.message)
        // Retry connection after 5 seconds in production
        if (process.env.NODE_ENV !== 'development') {
            setTimeout(connectDb, 5000);
        }
    }
}
export default connectDb