// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));

//  Root route
app.get("/", (req, res) => res.send("RetailIQ backend running "));

//  Authentication (public)
app.use("/api/auth", authRoutes);

//  Protected routes
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/shops", orderRoutes);

//  Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//product routes
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
