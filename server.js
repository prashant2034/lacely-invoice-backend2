const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Invoice = require("./models/Invoice");
const CreditNote = require("./models/CreditNote");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

// ✅ Invoice route
app.get("/api/invoices", async (req, res) => {
  console.log("GET /api/invoices called");
  const invoices = await Invoice.find({});
  res.json(invoices);
});

// ✅ Credit Note route
app.get("/api/credit-notes", async (req, res) => {
  console.log("GET /api/credit-notes called");
  const creditNotes = await CreditNote.find({});
  res.json(creditNotes);
});

app.get("/api/seed", async (req, res) => {
  try {
    console.log("🌱 Seeding test data route triggered...");

    const inv = await Invoice.create({
      number: "INV-19999",
      customer: "Test User",
      amount: "₹1,234",
      date: "2025-06-11",
      link: "/invoices/test.pdf",
    });

    const cn = await CreditNote.create({
      number: "CN-19999",
      customer: "Test User",
      amount: "₹456",
      date: "2025-06-11",
      reason: "Testing",
      link: "/credit-notes/test.pdf",
    });

    console.log("✅ Invoice inserted:", inv);
    console.log("✅ Credit Note inserted:", cn);

    res.send("✅ Seed data inserted into MongoDB.");
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).send("Error inserting seed data.");
  }
});
// ✅ Seed test data route
app.get("/api/seed", async (req, res) => {
  try {
    console.log("🌱 Seeding test data...");

    const invoice = await Invoice.create({
      number: "INV-19999",
      customer: "Test User",
      amount: "₹1,234",
      date: "2025-06-11",
      link: "/invoices/test.pdf",
    });

    const creditNote = await CreditNote.create({
      number: "CN-19999",
      customer: "Test User",
      amount: "₹456",
      date: "2025-06-11",
      reason: "Testing",
      link: "/credit-notes/test.pdf",
    });

    console.log("✅ Invoice inserted:", invoice);
    console.log("✅ Credit Note inserted:", creditNote);
    res.send("✅ Seed data inserted into MongoDB.");
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).send("Error inserting seed data.");
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
  