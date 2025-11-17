// controllers/productController.js
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";

export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const shop = await Shop.findOne({ ownerId: req.user.uid });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      shopId: shop._id,
      name,
      price,
      description,
      category,
      stock,
      image: imagePath,
    });

    res.status(201).json({ success: true, message: "Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductsByShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.uid });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const products = await Product.find({ shopId: shop._id });
    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update stock quantity for a product
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.stock = stock;
    await product.save();

    res.json({ success: true, message: "Stock updated successfully", product });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
