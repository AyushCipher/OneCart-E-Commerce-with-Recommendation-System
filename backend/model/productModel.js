import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image1:{
        type:String,
        required:true
    },
    image2:{
        type:String,
        required:true
    },
    image3:{
        type:String,
        required:true
    },
    image4:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    sizes:{
        type:Array,
        required:true
    },
    ratings:{
        type:Number,
        default:0
    },
    date:{
        type:Number,
        required:true
    },
    bestseller:{
        type:Boolean
    },
    stock:{
        type:Number,
        required:[true,"Please Enter Product Stock"],
        maxLength:[5,"Price cannot exceed 5 digits"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

},{timestamps:true})

const Product = mongoose.model("Product", productSchema)

export default Product