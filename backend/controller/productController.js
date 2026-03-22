import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"


export const addProduct = async (req,res) => {
    try {
        let {name,description,price,category,subCategory,sizes,bestseller} = req.body

        let image1 = await uploadOnCloudinary(req.files.image1[0].path)
        let image2 = await uploadOnCloudinary(req.files.image2[0].path)
        let image3 = await uploadOnCloudinary(req.files.image3[0].path)
        let image4 = await uploadOnCloudinary(req.files.image4[0].path)
        
        let productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            date: Date.now(),
            image1,
            image2,
            image3,
            image4
        }

        const product = await Product.create(productData)

        return res.status(201).json(product)
 
    } catch (error) {
        console.log("Add Product error")
        return res.status(500).json({message:`Add Product error: ${error}`})
    }
}


export const listProduct = async (req,res) => {
    try {
        const product = await Product.find({});
        return res.status(200).json(product)

    } catch (error) {
        console.log("ListProduct error")
        return res.status(500).json({message:`List Product error: ${error}`})
    }
}


export const removeProduct = async (req,res) => {
    try {
        let {id} = req.params;
        const product = await Product.findByIdAndDelete(id)
        return res.status(200).json(product)
    } catch (error) {
        console.log("Remove Product error")
        return res.status(500).json({message:`RemoveProduct error: ${error}`})
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.log('Get Product By ID error');
        return res.status(500).json({ message: `Get Product By ID error: ${error}` });
    }
}

export const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };
        if (req.files && req.files.image1) updateData.image1 = await uploadOnCloudinary(req.files.image1[0].path);
        if (req.files && req.files.image2) updateData.image2 = await uploadOnCloudinary(req.files.image2[0].path);
        if (req.files && req.files.image3) updateData.image3 = await uploadOnCloudinary(req.files.image3[0].path);
        if (req.files && req.files.image4) updateData.image4 = await uploadOnCloudinary(req.files.image4[0].path);
        if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes);
        if (typeof updateData.bestseller === 'string') updateData.bestseller = updateData.bestseller === 'true';
        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.log('Edit Product error');
        return res.status(500).json({ message: `Edit Product error: ${error}` });
    }
}