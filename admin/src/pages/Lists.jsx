import React, { useContext, useEffect, useState } from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

function Lists() {
  const [list, setList] = useState([]);
  const { serverUrl } = useContext(authDataContext);

  const fetchList = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/product/list");
      setList(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const removeList = async (id) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/product/remove/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data) {
        fetchList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white">
      <Nav />

      <div className="w-full min-h-screen flex items-start justify-start">
        <Sidebar />

        <div className="w-[82%] lg:ml-[320px] md:ml-[230px] ml-[120px] mt-[70px] flex flex-col gap-[30px] py-[50px] overflow-x-hidden">
          <div className="text-[28px] md:text-[40px] mb-[20px]">
            All Listed Products
          </div>

          {list.length > 0 ? (
            list.map((item, index) => (
              <div
                key={index}
                className="w-[90%] bg-slate-600 rounded-xl flex items-start gap-[10px] md:gap-[30px] p-[12px] md:px-[30px]"
              >
                {/* Product Image */}
                <img
                  src={item.image1}
                  alt={item.name}
                  className="w-[90px] md:w-[120px] h-[90px] md:h-[100px] object-cover rounded-lg"
                />

                {/* Product Details */}
                <div className="flex-1 flex flex-col gap-[4px]">
                  <div className="text-[15px] md:text-[20px] text-[#bef0f3] break-words leading-snug">
                    {item.name}
                  </div>

                  <div className="text-[14px] md:text-[17px] text-[#bef3da]">
                    {item.category}
                  </div>

                  <div className="text-[14px] md:text-[17px] text-[#bef3da]">
                    ₹{item.price}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="flex items-start justify-center">
                  <span
                    onClick={() => removeList(item._id)}
                    className="w-[35px] h-[35px] flex items-center justify-center rounded-md cursor-pointer hover:bg-red-300 hover:text-black transition"
                  >
                    X
                  </span>
                    <span
                      onClick={() => window.location.href = `/edit/${item._id}`}
                      className="w-[55px] h-[35px] flex items-center justify-center rounded-md cursor-pointer hover:bg-blue-300 hover:text-black transition ml-2"
                    >
                      Edit
                    </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-lg">No products available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lists;
