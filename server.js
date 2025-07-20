const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // for /api routes
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(bodyParser.json()); // general parser

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Middleware for verifying Shopify webhook
function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
  const rawBody = req.rawBody;
  const secret = process.env.SHOPIFY_SECRET;

  console.log("🔑 Shopify Secret from .env:", process.env.SHOPIFY_SECRET);
  console.log("📦 Raw Body:", rawBody);
  console.log("📬 Shopify Header HMAC:", hmacHeader);

  if (!secret || !rawBody || !hmacHeader) {
    console.warn("❌ Missing secret, rawBody, or header");
    return res.status(400).send("Bad request");
  }
  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");
     
console.log("🔐 Calculated Digest:", digest);

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
  



// ✅ Invoice API route
app.get("/api/invoices", (req, res) => {
  const dataFile = path.join(__dirname, "data", "invoices.json");
  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read invoices" });
    }
    res.json(JSON.parse(jsonData));
  });
});

// ✅ Credit Note API route
app.get("/api/credit-notes", (req, res) => {
  const dataFile = path.join(__dirname, "data", "creditNotes.json");
  fs.readFile(dataFile, "utf8", (err, jsonData) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read credit notes" });
    }
    res.json(JSON.parse(jsonData));
  });
});

// ✅ Order Webhook
app.post(
  "/webhook/order",
  express.json({ type: "*/*" }),
  verifyShopifyWebhook,
  (req, res) => {
    const order = req.body;
    console.log(order);
    console.log("✅ New order received from Shopify:", order.id);
    // 📦 You can trigger invoice generation here

    res.status(200).send("Order webhook received");
  }
);

// ✅ Refund Webhook
app.post(
  "/webhook/refund",
  express.json({ type: "*/*" }),
  verifyShopifyWebhook,
  (req, res) => {
    const refund = req.body;
    console.log("✅ Refund webhook received from Shopify:", refund.id);
    // 💸 You can trigger credit note generation here

    res.status(200).send("Refund webhook received");
  }
);

// ✅ Seed route (optional for testing)
app.get("/api/seed", (req, res) => {
  const invoicesSeed = [
    {
      number: "INV-14629",
      customer: "Pooja Sharma",
      amount: "₹1,599",
      date: "2025-05-12",
      link: "/invoices/invoice14629.pdf",
    },
    {
      number: "INV-14630",
      customer: "Neha Jain",
      amount: "₹1,799",
      date: "2025-05-13",
      link: "/invoices/invoice14630.pdf",
    },
  ];

  const creditNotesSeed = [
    {
      number: "CN-2041",
      customer: "Pooja Sharma",
      amount: "₹400",
      date: "2025-05-18",
      link: "/credit-notes/cn2041.pdf",
    },
    {
      number: "CN-2042",
      customer: "Neha Jain",
      amount: "₹299",
      date: "2025-05-21",
      link: "/credit-notes/cn2042.pdf",
    },
  ];

  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  fs.writeFileSync(
    path.join(dataDir, "invoices.json"),
    JSON.stringify(invoicesSeed)
  );
  fs.writeFileSync(
    path.join(dataDir, "creditNotes.json"),
    JSON.stringify(creditNotesSeed)
  );

  res.send("✅ Seed data inserted into MongoDB.");
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
