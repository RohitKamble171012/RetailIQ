import express from "express";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";

const router = express.Router();

// Always return JSON responses
router.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

/**
 *  Create a new order (public - no login required)
 * POST /api/shops/:shopId/order
 */
router.post("/:shopId/order", async (req, res) => {
  try {
    const { shopId } = req.params;
    const { items, totalAmount, paymentMethod } = req.body;

    console.log(" New order received for shop:", shopId);

    // Validate
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items missing" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    // ✅ Create new order
    const order = await Order.create({
      shopId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "upi" ? "paid" : "pending",
    });

    // ✅ Reduce product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity },
      });
    }

    console.log(` Order created for ${shop.name}: ${order._id}`);
    return res.json({
      success: true,
      message:
        paymentMethod === "cash"
          ? "Order placed successfully (Cash Payment Pending)"
          : "Order placed successfully (Paid via UPI)",
      order,
    });
  } catch (err) {
    console.error(" Error creating order:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error creating order" });
  }
});

/**
 * ✅ Get all orders for a specific shop (for seller dashboard)
 * GET /api/shops/:shopId/orders
 */
router.get("/:shopId/orders", async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await Order.find({ shopId }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching orders" });
  }
});

/**
 * ✅ Mark a cash order as paid
 * PUT /api/shops/orders/:orderId/mark-paid
 */
router.put("/orders/:orderId/mark-paid", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.paymentMethod !== "cash")
      return res.status(400).json({
        success: false,
        message: "Only cash orders can be marked as paid",
      });

    order.paymentStatus = "paid";
    await order.save();

    console.log(` Order ${orderId} marked as paid`);
    return res.json({ success: true, message: "Order marked as paid", order });
  } catch (err) {
    console.error(" Error marking order paid:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error marking order paid" });
  }
});

export default router;
