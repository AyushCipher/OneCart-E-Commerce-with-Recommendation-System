// ======================== ADMIN LOGIN ========================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate a JWT token for admin
      const token = genToken(email); // or use a static id, e.g., "admin"
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: "Admin Login Successful", admin: { email } });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (err) {
    return res.status(500).json({ message: `Admin Login Error: ${err.message}` });
  }
};
import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";
import sendMail from "../config/Mail.js";

// COMMON COOKIE OPTIONS
const cookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ======================== REGISTER ========================
export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email!" });

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must include uppercase, lowercase, number & symbol."
      });
    }

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isOtpVerifed: true,
    });

    const token = genToken(user._id);

    res.cookie("token", token, cookieConfig);

    return res.status(201).json({
      message: "Registration Successful",
      user,
    });

  } catch (err) {
    return res.status(500).json({ message: `Registration Error: ${err.message}` });
  }
};

// ======================== LOGIN ========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect Password" });

    const token = genToken(user._id);

    res.cookie("token", token, cookieConfig);

    return res.status(200).json({
      message: "Login Successful",
      user,
    });

  } catch (err) {
    return res.status(500).json({ message: `Login Error: ${err.message}` });
  }
};


// ======================== SEND OTP ========================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerifed = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({ message: "OTP sent" });

  } catch (err) {
    return res.status(500).json({ message: `Send OTP Error: ${err.message}` });
  }
};

// ======================== VERIFY OTP ========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or Expired OTP" });

    user.isOtpVerifed = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = genToken(user._id);

    res.cookie("token", token, cookieConfig);

    return res.status(200).json({ message: "OTP Verified", user });

  } catch (err) {
    return res.status(500).json({ message: `OTP Error: ${err.message}` });
  }
};

// ======================== RESET PASSWORD ========================
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user || !user.isOtpVerifed)
      return res.status(403).json({ message: "OTP Not Verified" });

    const hashedPass = await bcrypt.hash(password, 10);

    user.password = hashedPass;
    user.isOtpVerifed = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password Reset Successful" });

  } catch (err) {
    return res.status(500).json({ message: `Reset Error: ${err.message}` });
  }
};

// ======================== GOOGLE LOGIN ========================
export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "",
        isOtpVerifed: true,
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, cookieConfig);

    return res.status(200).json({
      message: "Google Login Successful",
      user
    });

  } catch (err) {
    return res.status(500).json({ message: `Google Login Error: ${err.message}` });
  }
};

// ======================== LOGOUT ========================
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/"
    });


    return res.status(200).json({ message: "Logged Out Successfully" });

  } catch (err) {
    return res.status(500).json({ message: `Logout Error: ${err.message}` });
  }
};
