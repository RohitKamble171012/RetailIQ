// routes/userRoutes.js
import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { createUser, getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createUser);
router.get("/me", verifyFirebaseToken, getUserProfile);

export default router; //  must export the router
