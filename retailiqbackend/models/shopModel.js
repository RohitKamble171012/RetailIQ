// models/shopModel.js
import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  ownerId: {
  type: String, //  Firebase UID is a string
  required: true,
},

  name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, required: true }, // e.g. grocery, fashion, etc.
  mobile: { type: String, required: true },
  upiId: { type: String, required: true },
  logo: { type: String },
  gstNumber: { type: String }, // optional, useful later for invoices
  openTime: { type: String },  // optional
  closeTime: { type: String }, // optional
  verified: { type: Boolean, default: false },
});

export default mongoose.model("Shop", shopSchema);
