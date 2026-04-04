import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getAdmin, getCurrentUser, getUserProfile, updateUserProfile } from "../controller/userController.js"
import adminAuth from "../middleware/adminAuth.js"

let userRoutes = express.Router()

userRoutes.get("/getcurrentuser",isAuth,getCurrentUser)
userRoutes.get("/getadmin",adminAuth,getAdmin)
userRoutes.get("/profile", isAuth, getUserProfile)
userRoutes.put("/profile", isAuth, updateUserProfile)

export default userRoutes

