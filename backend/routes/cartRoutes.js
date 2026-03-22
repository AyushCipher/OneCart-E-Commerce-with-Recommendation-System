import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  addToCart,
  getUserCart,
  updateCart,
  deleteCartItem
} from "../controller/cartController.js";

const cartRoutes = express.Router();

cartRoutes.get('/get', isAuth, getUserCart);     // changed to GET
cartRoutes.post('/add', isAuth, addToCart);
cartRoutes.put('/update', isAuth, updateCart);   // changed to PUT
cartRoutes.delete('/remove', isAuth, deleteCartItem); // new delete route

export default cartRoutes;
