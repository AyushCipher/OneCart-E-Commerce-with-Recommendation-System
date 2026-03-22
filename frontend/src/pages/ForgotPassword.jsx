import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import Navbar from "../component/Nav";
import Footer from "../component/Footer";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { authDataContext } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [conPassword, setConPassword] = useState("");

  const handleStep1 = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
    setLoading(false);
  };

  const handleStep2 = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleStep3 = async () => {
    setLoading(true);
    if (newPassword !== conPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, password: newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-[#141414] to-[#0c2025] px-4 py-20">
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 max-w-md w-full border border-white/20">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {step === 1 && "Forgot Your Password?"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Your Password"}
          </h2>

          {step === 1 && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-400 rounded-md bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleStep1}
                disabled={loading}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border border-gray-400 rounded-md bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Verify OTP"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-4 py-2 border border-gray-400 rounded-md bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 mt-4 border border-gray-400 rounded-md bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={conPassword}
                onChange={(e) => setConPassword(e.target.value)}
              />

              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Reset Password"}
              </button>
            </>
          )}

          <button
            className="mt-4 text-sm text-blue-400 hover:text-blue-300 text-center w-full"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ForgotPassword;
