// backend/controllers/userController.js
import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const { email, name } = req.user;
    const existing = await User.findOne({ email });
    if (existing) return res.status(200).json(existing);

    const newUser = await User.create({
      uid: req.user.uid,
      email,
      name,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
