import express from 'express'
import { addProduct, listProduct, removeProduct, getProductById, editProduct } from '../controller/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from "../middleware/adminAuth.js"

let productRoutes = express.Router()

productRoutes.post("/addproduct", upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }
]), adminAuth, addProduct)

// FIX: /list must be before /:id — otherwise "list" gets treated as an id param
productRoutes.get("/list", listProduct)

productRoutes.get("/:id", getProductById)

productRoutes.post("/edit/:id", adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }
]), editProduct)

productRoutes.post("/remove/:id", adminAuth, removeProduct)

export default productRoutes