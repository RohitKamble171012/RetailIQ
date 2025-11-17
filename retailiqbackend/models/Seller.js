// models/Seller.js
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  qrCodeUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Seller", sellerSchema);
