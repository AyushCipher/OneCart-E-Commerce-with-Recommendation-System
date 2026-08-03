import React, { useContext, useEffect, useState } from "react";
import Nav from "../component/Nav";
import Sidebar from "../component/Sidebar";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

function Coupons() {
  const { serverUrl } = useContext(authDataContext);
  const [coupons, setCoupons] = useState([]);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const fetchCoupons = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/coupon/list", {
        withCredentials: true,
      });
      setCoupons(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        serverUrl + "/api/coupon/create",
        {
          code,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          expiresAt: expiresAt || null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
        },
        { withCredentials: true }
      );

      toast.success("Coupon created");
      setCode("");
      setDiscountValue("");
      setMinOrderAmount("");
      setMaxDiscountAmount("");
      setExpiresAt("");
      setUsageLimit("");
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create coupon");
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(
        `${serverUrl}/api/coupon/toggle/${id}`,
        {},
        { withCredentials: true }
      );
      fetchCoupons();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/coupon/${id}`, {
        withCredentials: true,
      });
      fetchCoupons();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white">
      <Nav />

      <div className="w-full min-h-screen flex items-start justify-start">
        <Sidebar />

        <div className="w-[82%] lg:ml-[320px] md:ml-[230px] ml-[120px] mt-[70px] flex flex-col gap-[30px] py-[50px] overflow-x-hidden">
          <div className="text-[28px] md:text-[40px] mb-[20px]">Coupons</div>

          {/* CREATE FORM */}
          <form
            onSubmit={handleCreate}
            className="w-[90%] bg-slate-600 rounded-xl p-[20px] flex flex-col gap-[15px]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
              <input
                type="text"
                placeholder="Code (e.g. SAVE20)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white px-[15px]"
              />

              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="h-[45px] rounded-md bg-slate-700 text-white px-[15px]"
              >
                <option value="percentage">Percentage %</option>
                <option value="flat">Flat Amount</option>
              </select>

              <input
                type="number"
                placeholder="Discount value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                min="0"
                className="h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white px-[15px]"
              />

              <input
                type="number"
                placeholder="Min order amount"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                min="0"
                className="h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white px-[15px]"
              />

              <input
                type="number"
                placeholder="Max discount cap (optional)"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                min="0"
                className="h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white px-[15px]"
              />

              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-[45px] rounded-md bg-slate-700 text-white px-[15px]"
              />

              <input
                type="number"
                placeholder="Usage limit (optional)"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                min="0"
                className="h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white px-[15px]"
              />
            </div>

            <button
              type="submit"
              className="w-fit px-[30px] py-[10px] rounded-md bg-[#3bcee848] border-[1px] border-[#80808049]"
            >
              Create Coupon
            </button>
          </form>

          {/* LIST */}
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="w-[90%] bg-slate-600 rounded-xl flex items-center justify-between gap-[10px] p-[15px] md:px-[30px]"
              >
                <div className="flex flex-col gap-[4px]">
                  <div className="text-[18px] md:text-[20px] text-[#bef0f3] font-semibold">
                    {coupon.code}
                  </div>
                  <div className="text-[14px] md:text-[16px] text-[#bef3da]">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% off`
                      : `₹${coupon.discountValue} off`}
                    {coupon.minOrderAmount > 0 && ` · min ₹${coupon.minOrderAmount}`}
                    {coupon.maxDiscountAmount != null && ` · cap ₹${coupon.maxDiscountAmount}`}
                  </div>
                  <div className="text-[13px] text-gray-300">
                    Used {coupon.usedCount}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                    {coupon.expiresAt && ` · expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center gap-[10px]">
                  <span
                    className={`px-[10px] py-[5px] rounded-md text-[13px] ${
                      coupon.isActive ? "bg-green-700" : "bg-gray-700"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>

                  <button
                    onClick={() => handleToggle(coupon._id)}
                    className="px-[15px] py-[8px] rounded-md hover:bg-blue-300 hover:text-black transition"
                  >
                    {coupon.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="px-[15px] py-[8px] rounded-md hover:bg-red-300 hover:text-black transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-lg">No coupons created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Coupons;
