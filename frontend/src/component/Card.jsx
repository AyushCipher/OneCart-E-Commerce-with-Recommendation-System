import React, { useContext } from "react";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

function Card({ name, image, id, price, rating }) {
  let { currency } = useContext(shopDataContext);
  let navigate = useNavigate();

  // Ensure rating is always a valid number
  const displayRating = Number(rating) ? Number(rating).toFixed(1) : "0.0";

  return (
    <div
      onClick={() => navigate(`/productdetail/${id}`)}
      className="w-full bg-white/10 backdrop-blur-lg rounded-xl shadow-md hover:shadow-xl hover:scale-[103%] transition-all duration-300 cursor-pointer border border-white/20 overflow-hidden"
    >
      {/* IMAGE */}
      <img
        src={image}
        alt={name}
        className="w-full h-56 object-cover"
      />

      {/* CONTENT */}
      <div className="p-3 sm:p-4 text-white">
        {/* NAME */}
        <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2">
          {name}
        </h3>

        {/* PRICE + RATING */}
        <div className="flex items-center justify-between">
          <p className="text-sm sm:text-base font-medium">
            {currency} {price}
          </p>

          {/* RATING */}
          <div className="flex items-center gap-1 text-yellow-400">
            <FaStar className="text-xs sm:text-sm" />
            <span className="text-xs sm:text-sm text-white/80">{displayRating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
