const crypto = require("crypto");
const fs = require("fs");


function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
  const rawBody = req.rawBody;
  const secret = process.env.SHOPIFY_SECRET;

//   console.log("🔑 Shopify Secret from .env:", process.env.SHOPIFY_SECRET);
//   console.log("📦 Raw Body:", rawBody);
//   console.log("📬 Shopify Header HMAC:", hmacHeader);

  if (!secret || !rawBody || !hmacHeader) {
    console.warn("❌ Missing secret, rawBody, or header");
    return res.status(400).send("Bad request");
  }
  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");
     
// console.log("🔐 Calculated Digest:", digest);

    if (digest === hmacHeader) {
      console.log("✅ Shopify webhook verified");
      next();
    } else {
      console.warn("❌ Invalid Shopify webhook signature");
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.error("❌ Error verifying webhook:", err.message);
    res.status(500).send("Internal error");
  }
}

// Export the middleware function
module.exports = verifyShopifyWebhook;