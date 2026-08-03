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
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }

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
  // FETCH WISHLIST
  // ==============================
  const getUserWishlist = async () => {
    if (!userData) return setWishlist([]); // guest user

    try {
      const result = await axios.get(serverUrl + "/api/wishlist/get", {
        withCredentials: true,
      });

      setWishlist(result.data || []);
    } catch (err) {
      console.log("Wishlist Fetch Error:", err);
      setWishlist([]);
    }
  };

  // ==============================
  // TOGGLE WISHLIST
  // ==============================
  const isInWishlist = (itemId) =>
    wishlist.some((item) => item._id === itemId);

  const toggleWishlist = async (itemId) => {
    if (!userData) return toast.error("Login to use wishlist!");

    const alreadyIn = isInWishlist(itemId);

    try {
      if (alreadyIn) {
        await axios.delete(serverUrl + "/api/wishlist/remove", {
          data: { itemId },
          withCredentials: true,
        });
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          serverUrl + "/api/wishlist/add",
          { itemId },
          { withCredentials: true }
        );
        toast.success("Added to wishlist");
      }

      await getUserWishlist();
    } catch (err) {
      toast.error("Could not update wishlist");
      console.log(err);
    }
  };

  // ==============================
  // COUPON
  // ==============================
  const applyCoupon = async (code) => {
    if (!code?.trim()) return toast.error("Enter a coupon code");

    try {
      const amount = getCartAmount() + delivery_fee;
      const res = await axios.post(
        serverUrl + "/api/coupon/validate",
        { code, amount },
        { withCredentials: true }
      );

      setAppliedCoupon({ code: res.data.code, discount: res.data.discount });
      toast.success(`Coupon applied: -${currency}${res.data.discount}`);
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const getFinalAmount = () => {
    const total = getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee;
    if (!appliedCoupon) return total;
    return Math.max(total - appliedCoupon.discount, 0);
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
    getUserWishlist();
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
    wishlist,
    isInWishlist,
    toggleWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getFinalAmount,
  };

  return (
    <shopDataContext.Provider value={value}>
      {children}
    </shopDataContext.Provider>
  );
}

export default ShopContext;
