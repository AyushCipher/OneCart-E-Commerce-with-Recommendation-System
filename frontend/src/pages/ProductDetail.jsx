import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { shopDataContext } from "../context/ShopContext";
import { reviewDataContext } from "../context/ReviewContext";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import RelatedProduct from "../component/RelatedProduct";
import RecommendedProducts from "../component/RecommendedProducts";
import Loading from "../component/Loading";
import { useTrackProductView } from "../hooks/useRecommendations";
import { useMLTracking, useSimilarProducts } from "../hooks/useMLTracking";

function ProductDetail() {
  const { productId } = useParams();
  const { products, currency, addtoCart, loading } = useContext(shopDataContext);
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const { productReviews, getProductReviews, addReview } =
    useContext(reviewDataContext);

  const [hasPurchased, setHasPurchased] = useState(false);

  const [productData, setProductData] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  // Track product view for recommendations (legacy)
  useTrackProductView(productId, userData?._id);

  // ML Tracking - enhanced tracking with time-on-page
  const { trackProductView, trackAddToCart, trackTimeOnPage } = useMLTracking(userData?._id);
  const viewStartTime = useRef(Date.now());
  const hasTrackedView = useRef(false);

  // Fetch similar products using ML
  const { products: similarProducts } = useSimilarProducts(productId, { limit: 4 });

  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image1);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [products, productId]);

  useEffect(() => {
    if (productId) getProductReviews(productId);
  }, [productId]);

  // Only customers who've bought this product can review it (mirrors the
  // backend guard in reviewController.addReview) — check here too so the
  // form isn't shown only to be rejected on submit.
  useEffect(() => {
    const checkPurchase = async () => {
      if (!userData?._id || !productId) return setHasPurchased(false);

      try {
        const res = await axios.post(
          `${serverUrl}/api/order/userorder`,
          {},
          { withCredentials: true }
        );
        const purchased = res.data.some((order) =>
          order.items.some((item) => item._id === productId)
        );
        setHasPurchased(purchased);
      } catch (err) {
        setHasPurchased(false);
      }
    };

    checkPurchase();
  }, [userData?._id, productId, serverUrl]);

  // ML Tracking: Track view with product metadata
  useEffect(() => {
    if (productId && userData?._id && productData && !hasTrackedView.current) {
      const timer = setTimeout(() => {
        trackProductView(productId, {
          category: productData.category,
          subCategory: productData.subCategory,
          price: productData.price,
          name: productData.name,
        });
        hasTrackedView.current = true;
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [productId, userData?._id, productData, trackProductView]);

  // ML Tracking: Track time spent on product page
  useEffect(() => {
    viewStartTime.current = Date.now();
    hasTrackedView.current = false;

    return () => {
      const timeSpent = (Date.now() - viewStartTime.current) / 1000;
      if (hasTrackedView.current && timeSpent > 3) {
        trackTimeOnPage(productId, timeSpent);
      }
    };
  }, [productId]);

  const avgRating =
    productReviews.length > 0
      ? (
          productReviews.reduce((sum, r) => sum + r.rating, 0) /
          productReviews.length
        ).toFixed(1)
      : 0;

  const handleSubmitReview = async () => {
    if (!rating) return toast.error("Please select a rating!");

    const res = await addReview(productId, rating, comment);

    if (res.success) {
      toast.success("Review added!");
      setRating(0);
      setComment("");
      getProductReviews(productId);
    } else {
      toast.error(res.msg);
    }
  };

  return productData ? (
    <div className="bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen">
      {/* PRODUCT SECTION */}
      <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-16 pt-24">
        {/* LEFT IMAGES */}
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-1/2">
          <div className="flex lg:flex-col gap-3">
            {[productData.image1, productData.image2, productData.image3, productData.image4]
              .filter(Boolean)
              .map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-16 h-16 md:w-24 md:h-24 rounded cursor-pointer border border-gray-700"
                  onClick={() => setImage(img)}
                />
              ))}
          </div>

          <img
            src={image}
            className="w-full h-[350px] object-contain rounded border border-gray-700"
          />
        </div>

        {/* RIGHT PRODUCT INFO */}
        <div className="w-full lg:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold">{productData.name}</h1>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < avgRating ? "text-yellow-400" : "text-gray-700"}
              />
            ))}
            <span className="text-gray-400">({productReviews.length} reviews)</span>
          </div>

          <p className="text-3xl font-semibold">{currency} {productData.price}</p>

          <p className="text-gray-300">{productData.description}</p>

          <h2 className="text-lg font-semibold mt-4 mb-1">Select Size</h2>
          <div className="flex gap-2">
            {productData.sizes.map((s, i) => (
              <button
                key={i}
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded border ${
                  s === size ? "bg-white text-black" : "bg-gray-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded shadow"
            onClick={() => {
              addtoCart(productData._id, size);
              trackAddToCart(productData._id, {
                price: productData.price,
                size: size,
                category: productData.category,
              });
            }}
          >
            {loading ? <Loading /> : "Add to Cart"}
          </button>

          <hr className="border-gray-700 my-4" />

          <ul className="text-sm text-gray-400 space-y-1">
            <li>✔ 100% Original Product</li>
            <li>✔ Cash on Delivery Available</li>
            <li>✔ Easy return & exchange in 7 days</li>
          </ul>
        </div>
      </div>

      {/* DESCRIPTION & REVIEWS */}
      <div className="mt-16 px-6 lg:px-16">

        {/* TAB SWITCHER */}
        <div className="flex gap-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 ${
              activeTab === "description"
                ? "border-b-2 border-white font-semibold"
                : "text-gray-400"
            }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 ${
              activeTab === "reviews"
                ? "border-b-2 border-white font-semibold"
                : "text-gray-400"
            }`}
          >
            Reviews ({productReviews.length})
          </button>
        </div>

        {/* DESCRIPTION CONTENT — full width */}
        {activeTab === "description" && (
          <div className="mt-4 text-gray-300 text-lg w-full">
            {productData.description}
          </div>
        )}

        {/* REVIEWS SECTION */}
        {activeTab === "reviews" && (
          <div className="mt-6 space-y-6">
            {/* WRITE REVIEW */}
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-xl mb-2 font-semibold">Write a Review</h2>

              {hasPurchased ? (
                <>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => setRating(star)}
                        className={`cursor-pointer text-2xl ${
                          star <= rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  <textarea
                    className="mt-3 w-full bg-gray-800 border border-gray-700 p-3 rounded"
                    rows={3}
                    placeholder="Write your feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <button
                    className="mt-3 px-5 py-2 bg-blue-600 rounded hover:bg-blue-500"
                    onClick={handleSubmitReview}
                  >
                    Submit Review
                  </button>
                </>
              ) : (
                <p className="text-gray-400">
                  Only customers who've purchased this product can write a review.
                </p>
              )}
            </div>

            {/* REVIEWS LIST */}
            <div>
              {productReviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first!</p>
              ) : (
                productReviews.map((rev, i) => (
                  <div key={i} className="border-b border-gray-700 pb-4 mb-4">

                    {/* User + Avatar */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                        {rev?.user?.name?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{rev?.user?.name}</p>
                      </div>
                    </div>

                    {/* STAR RATING */}
                    <div className="flex gap-1">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <FaStar key={idx} className="text-yellow-400" />
                      ))}
                    </div>

                    {/* COMMENT */}
                    <p className="mt-1 text-gray-200">{rev.comment}</p>

                    <p className="text-gray-500 text-xs mt-1">
                      Reviewed on {new Date(rev.createdAt).toDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* RELATED PRODUCTS */}
      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
        currentProductId={productData._id}
      />

      {/* RECOMMENDED PRODUCTS FOR USER */}
      {userData?._id && (
        <RecommendedProducts
          userId={userData._id}
          strategy="hybrid"
          limit={8}
          excludeIds={[productData._id]}
          currentCategory={productData.category}
        />
      )}
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
}

export default ProductDetail;