import express from "express";
import Shop from "../models/shopModel.js";
import Product from "../models/productModel.js"; // only if products are stored separately

const router = express.Router();

// Get shop details + products (public route)
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    // Fetch the shop
    const shop = await Shop.findById(shopId);
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    // Fetch products for this shop (if you store them separately)
    const products = await Product.find({ shopId });

    res.json({ success: true, shop, products });
  } catch (err) {
    console.error("Error fetching shop:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
