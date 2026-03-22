import React, { useContext } from "react";
import { shopDataContext } from "../context/ShopContext";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Loading from "../component/Loading";
import RecommendedProducts from "../component/RecommendedProducts";
import { authDataContext } from "../context/AuthContext";

function Cart() {
  const {
    cartItem,
    products,
    currency,
    getCartAmount,
    updateQuantity,
    removeFromCart,
    loading,
  } = useContext(shopDataContext);

  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const navigate = useNavigate();

  if (loading) return <Loading />;

  const cartEntries = [];

  // Convert cart object → list
  for (let productId in cartItem) {
  const product = products.find((p) => p._id === productId);
  if (!product) continue;

  for (let size in cartItem[productId]) {
    cartEntries.push({
      productId,
      name: product.name,
      price: product.price,
      image: product.image1,
      size,
      quantity: cartItem[productId][size],
    });
  }
}


  const totalAmount = getCartAmount();

  return (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white p-6 ">
      <h2 className="text-3xl font-bold text-center mt-16 mb-10">Your Cart</h2>

      {cartEntries.length === 0 ? (
        <div className="text-center text-gray-300 mt-20">
          <p className="text-2xl mb-4">Your cart is empty 😢</p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 font-semibold"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto flex flex-col gap-6 overflow-y-auto">
          {cartEntries.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex bg-white/10 p-4 rounded-xl shadow border border-white/20 backdrop-blur-md"
            >
              <img
                src={
                  item.image?.startsWith("http")
                    ? item.image
                    : `${serverUrl}/${item.image}`
                }
                alt={item.name}
                className="w-28 h-28 object-cover rounded-lg"
              />

              <div className="flex flex-col justify-between ml-4 flex-grow">
                <div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400">Size: {item.size}</p>
                </div>

                <p className="text-lg">
                  {currency} {item.price} × {item.quantity}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.size, item.quantity - 1)
                    }
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md"
                  >
                    -
                  </button>

                  <span className="text-lg">{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.size, item.quantity + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md"
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.size)
                    }
                    className="ml-auto"
                  >
                    <FaTrash className="text-red-500 hover:text-red-400 text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Order Summary */}
          <div className="mt-6 bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md mb-19">
            <h3 className="text-2xl font-bold mb-4">Order Summary</h3>

            <div className="flex justify-between text-lg">
              <span>Total Items</span>
              <span>{cartEntries.length}</span>
            </div>

            <div className="flex justify-between text-xl font-semibold mt-3">
              <span>Total Amount</span>
              <span>
                {currency} {totalAmount}
              </span>
            </div>

            <button
              onClick={() => navigate("/placeorder")}
              className="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* RECOMMENDED PRODUCTS FOR USER */}
      {userData?._id && <RecommendedProducts userId={userData._id} strategy="hybrid" limit={8} />}
    </div>
  );
}

export default Cart;
