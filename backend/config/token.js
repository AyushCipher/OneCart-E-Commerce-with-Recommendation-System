import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (error) {
    console.log("genToken error:", error.message);
  }
};

export const genToken1 = (email) => {
  try {
    return jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (error) {
    console.log("genToken1 error:", error.message);
  }
};
