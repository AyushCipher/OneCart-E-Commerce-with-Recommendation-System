import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { authDataContext } from "./AuthContext";
import { userDataContext } from "./UserContext";
import { toast } from "react-toastify";

export const shopDataContext = createContext();

function ShopContext({ children }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const { userData } = useContext(userDataContext);
  const [showSearch, setShowSearch] = useState(false);
  const { serverUrl } = useContext(authDataContext);
  const [cartItem, setCartItem] = useState({});
  const [loading, setLoading] = useState(false);

  const currency = "₹";
  const delivery_fee = 40;

  // ==============================
  // FETCH PRODUCTS
  // ==============================
  const getProducts = async () => {
    try {
      const res = await axios.get(serverUrl + "/api/product/list");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==============================
  // FETCH USER CART
  // ==============================
  const getUserCart = async () => {
    if (!userData) return setCartItem({}); // guest user

    try {
      const result = await axios.get(serverUrl + "/api/cart/get", {
        withCredentials: true,
      });

      setCartItem(result.data || {});
    } catch (err) {
      console.log("Cart Fetch Error:", err);
      setCartItem({});
    }
  };

  // ==============================
  // ADD TO CART
  // ==============================
  const addtoCart = async (itemId, size) => {
    if (!size) return toast.error("Select size!");

    let cartData = structuredClone(cartItem);

    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    setCartItem(cartData);

    if (!userData) return;

    setLoading(true);
    try {
      await axios.post(
        serverUrl + "/api/cart/add",
        { itemId, size },
        { withCredentials: true }
      );

      toast.success("Added to cart");
      await getUserCart();
    } catch (err) {
      toast.error("Could not add");
      console.log(err);
    }

    setLoading(false);
  };

  // ==============================
  // REMOVE FROM CART
  // ==============================
  const removeFromCart = async (itemId, size) => {
    let cartData = structuredClone(cartItem);

    delete cartData[itemId][size];

    if (Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId];
    }

    setCartItem(cartData);

    if (!userData) return;

    try {
      await axios.delete(serverUrl + "/api/cart/remove", {
        data: { itemId, size },
        withCredentials: true,
      });

      await getUserCart();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Remove failed");
      console.log(err);
    }
  };

  // ==============================
  // UPDATE QUANTITY
  // ==============================
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItem);

    cartData[itemId][size] = quantity;
    setCartItem(cartData);

    if (!userData) return;

    try {
      await axios.put(
        serverUrl + "/api/cart/update",
        { itemId, size, quantity },
        { withCredentials: true }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ==============================
  // COUNT TOTAL ITEMS
  // ==============================
  const getCartCount = () => {
    let total = 0;

    for (let id in cartItem) {
      for (let size in cartItem[id]) {
        total += cartItem[id][size];
      }
    }

    return total;
  };

  // ==============================
  // TOTAL CART AMOUNT
  // ==============================
  const getCartAmount = () => {
    let total = 0;

    for (let id in cartItem) {
      const product = products.find((item) => item._id === id);
      if (!product) continue;

      for (let size in cartItem[id]) {
        total += product.price * cartItem[id][size];
      }
    }

    return total;
  };

  // ==============================
  // AUTO LOAD
  // ==============================
  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    getUserCart();
  }, [userData]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItem,
    addtoCart,
    removeFromCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    loading,
  };

  return (
    <shopDataContext.Provider value={value}>
      {children}
    </shopDataContext.Provider>
  );
}

export default ShopContext;
