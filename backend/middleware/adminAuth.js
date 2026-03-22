import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {

        let {token} = req.cookies

        if(!token) {
            return res.status(400).json({message:"Not Authorized! Login Again"})
        }
        
        let verifyToken =  jwt.verify(token,process.env.JWT_SECRET)

        if(!verifyToken){
            return res.status(400).json({message:"Not Authorized! Login Again, Invalid token"})
        }

        req.adminEmail = process.env.ADMIN_EMAIL

        next()
            
    } catch (error) {
        console.log("adminAuth error")
        return res.status(500).json({message:`adminAuth error: ${error}`})
    }
}

export default adminAuth


// import jwt from 'jsonwebtoken';

// const adminAuth = async (req, res, next) => {
//   try {
//     // 1. Token not found
//     let { token } = req.cookies;
//     if (!token) {
//       return res.status(401).json({ message: "Not Authorized. No token found. Please login again." });
//     }

//     // 2. Verify token (this checks invalid/expired/malformed token automatically)
//     let verifyToken;
//     try {
//       verifyToken = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       // Differentiate errors
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ message: "Session expired. Please login again." });
//       }
//       if (err.name === "JsonWebTokenError") {
//         return res.status(401).json({ message: "Invalid token. Please login again." });
//       }
//       if (err.name === "NotBeforeError") {
//         return res.status(401).json({ message: "Token not active yet." });
//       }
//       return res.status(401).json({ message: `Token verification failed: ${err.message}` });
//     }

//     // 3. Wrong secret key (if verification fails silently)
//     if (!verifyToken) {
//       return res.status(401).json({ message: "Not Authorized. Invalid secret or token." });
//     }

//     // 4. Assign decoded data to request (e.g., admin email)
//     req.adminEmail = process.env.ADMIN_EMAIL;

//     next();
//   } catch (error) {
//     // 5. Cookie parsing issue or unexpected server error
//     console.error("adminAuth error:", error);
//     return res.status(500).json({ message: `adminAuth error: ${error.message}` });
//   }
// };

// export default adminAuth;
