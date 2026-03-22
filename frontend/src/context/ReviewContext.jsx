import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { authDataContext } from "./AuthContext";

export const reviewDataContext = createContext();

function ReviewContext({ children }) {
  const { serverUrl } = useContext(authDataContext);

  const [allReviews, setAllReviews] = useState([]);    // For admin or global use
  const [productReviews, setProductReviews] = useState([]); // For product page only
  const [loading, setLoading] = useState(false);

  // Fetch ALL Reviews (Admin / Global use)
  const getAllReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/review/all`, { withCredentials: true });
      setAllReviews(res.data);
    } catch (err) {
      console.log("Get All Reviews Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reviews For Product Page
  const getProductReviews = async (productId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/review/product/${productId}`);
      setProductReviews(res.data);
    } catch (err) {
      console.log("Get Product Reviews Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add New Review
  const addReview = async (productId, rating, comment) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/review/add`,
        { productId, rating, comment },
        { withCredentials: true }
      );

      // Update Product Reviews without reload
      setProductReviews((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, msg: err?.response?.data?.message };
    }
  };

  const value = {
    allReviews,          // globally stored
    productReviews,      // per-product reviews
    loading,

    getAllReviews,
    getProductReviews,
    addReview,
  };

  return (
    <reviewDataContext.Provider value={value}>
      {children}
    </reviewDataContext.Provider>
  );
}

export default ReviewContext;
