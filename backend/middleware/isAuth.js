import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token)
      return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    req.userId = user._id;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export default isAuth;
