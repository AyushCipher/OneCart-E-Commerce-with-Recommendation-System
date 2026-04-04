import User from "../model/userModel.js"

export const getCurrentUser = async (req,res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if(!user){
           return res.status(404).json({message:"User is not found"}) 
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`getCurrentUser error: ${error}`})
    }
}

export const getAdmin = async (req,res) => {
    try {
        let adminEmail = req.adminEmail;
        if(!adminEmail){
            return res.status(404).json({message:"Admin is not found"}) 
        }
        return res.status(201).json({
            email:adminEmail,
            role:"admin"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`getAdmin error: ${error}`})
    }
}

// ======================== GET USER PROFILE ========================
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: `Get Profile Error: ${err.message}` });
  }
};

// ======================== UPDATE USER PROFILE ========================
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, gender, dateOfBirth, profession, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile fields
    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (profession) user.profession = profession;
    if (bio) user.bio = bio;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: `Update Profile Error: ${err.message}` });
  }
};