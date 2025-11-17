// controllers/sellerController.js
import Shop from "../models/shopModel.js";
import path from "path";

export const registerOrUpdateShop = async (req, res) => {
  try {
    const { shopName, ownerName, mobile, address, shopType, gstNumber, upiId, openingHours, description } = req.body;
    const userId = req.user.uid; // fetched from verifyFirebaseToken
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if shop already exists
    let shop = await Shop.findOne({ ownerId: userId });

    if (shop) {
      // Update existing shop
      shop.name = shopName;
      shop.address = address;
      shop.type = shopType;
      shop.mobile = mobile;
      shop.upiId = upiId;
      shop.gstNumber = gstNumber || shop.gstNumber;
      shop.openTime = openingHours?.split("-")[0]?.trim() || shop.openTime;
      shop.closeTime = openingHours?.split("-")[1]?.trim() || shop.closeTime;
      shop.logo = logoPath || shop.logo;
      await shop.save();
    } else {
      // Create new shop
      shop = new Shop({
        ownerId: userId,
        name: shopName,
        address,
        type: shopType,
        mobile,
        upiId,
        gstNumber,
        openTime: openingHours?.split("-")[0]?.trim(),
        closeTime: openingHours?.split("-")[1]?.trim(),
        logo: logoPath,
      });
      await shop.save();
    }

    return res.status(201).json({
      success: true,
      message: "Shop setup completed successfully",
      shop,
    });
  } catch (err) {
    console.error("Error registering shop:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to register shop" });
  }
};

export const getShopQR = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shopURL = `${process.env.FRONTEND_BASE_URL}/shop/${shopId}`;
    res.status(200).json({
      success: true,
      qrURL: shopURL,
      link: shopURL,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating QR" });
  }
};
