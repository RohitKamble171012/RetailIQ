// routes/productRoutes.js
import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { upload } from "../utils/upload.js";
import { addProduct, getProductsByShop, deleteProduct,updateProductStock } from "../controllers/productController.js";

const router = express.Router();

// POST - Add a new product
router.post("/", verifyFirebaseToken, upload.single("image"), addProduct);
router.get("/", verifyFirebaseToken, getProductsByShop);
router.delete("/:id", verifyFirebaseToken, deleteProduct);
router.put("/:id/stock", verifyFirebaseToken, updateProductStock);
export default router;
