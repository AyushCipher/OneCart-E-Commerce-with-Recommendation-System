import React, { useContext } from "react";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Card from "../component/Card";

function Wishlist() {
  const { wishlist } = useContext(shopDataContext);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white p-6 mt-15 pt-12">
      <h2 className="text-3xl font-bold text-center mt-17 mb-10">Your Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-300 mt-20">
          <p className="text-2xl mb-4">Your wishlist is empty 💔</p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 font-semibold"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-19">
          {wishlist.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image1}
              rating={item.ratings}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
