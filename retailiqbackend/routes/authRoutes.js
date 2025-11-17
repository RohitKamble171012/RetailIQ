import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import User from "../models/userModel.js";

const router = express.Router();

// POST /api/auth/verifyToken
router.post("/verifyToken", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    // Check if user already exists in DB
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, name });
      await user.save();
      console.log("🆕 New user added to DB:", email);
    } else {
      console.log("✅ Existing user verified:", email);
    }

    res.status(200).json({
      message: "Token verified successfully",
      user,
    });
  } catch (error) {
    console.error("Error in /api/auth/verifyToken:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
