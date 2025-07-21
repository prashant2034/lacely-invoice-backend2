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
// app.use(express.json()); // for /api routes
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


// ✅ Routes
const webhooksRouter = require("./routes/webhooks.route.js");
const receiptsRouter = require("./routes/reciepts.routes.js");
app.use("/webhook", webhooksRouter);
app.use("/api/receipts", receiptsRouter);



// // ✅ Invoice API route
// app.get("/api/invoices", (req, res) => {
//   const dataFile = path.join(__dirname, "data", "invoices.json");
//   fs.readFile(dataFile, "utf8", (err, jsonData) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read invoices" });
//     }
//     res.json(JSON.parse(jsonData));
//   });
// });

// // ✅ Credit Note API route
// app.get("/api/credit-notes", (req, res) => {
//   const dataFile = path.join(__dirname, "data", "creditNotes.json");
//   fs.readFile(dataFile, "utf8", (err, jsonData) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read credit notes" });
//     }
//     res.json(JSON.parse(jsonData));
//   });
// });



// // ✅ Seed route (optional for testing)
// app.get("/api/seed", (req, res) => {
//   const invoicesSeed = [
//     {
//       number: "INV-14629",
//       customer: "Pooja Sharma",
//       amount: "₹1,599",
//       date: "2025-05-12",
//       link: "/invoices/invoice14629.pdf",
//     },
//     {
//       number: "INV-14630",
//       customer: "Neha Jain",
//       amount: "₹1,799",
//       date: "2025-05-13",
//       link: "/invoices/invoice14630.pdf",
//     },
//   ];

//   const creditNotesSeed = [
//     {
//       number: "CN-2041",
//       customer: "Pooja Sharma",
//       amount: "₹400",
//       date: "2025-05-18",
//       link: "/credit-notes/cn2041.pdf",
//     },
//     {
//       number: "CN-2042",
//       customer: "Neha Jain",
//       amount: "₹299",
//       date: "2025-05-21",
//       link: "/credit-notes/cn2042.pdf",
//     },
//   ];

//   const dataDir = path.join(__dirname, "data");
//   if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

//   fs.writeFileSync(
//     path.join(dataDir, "invoices.json"),
//     JSON.stringify(invoicesSeed)
//   );
//   fs.writeFileSync(
//     path.join(dataDir, "creditNotes.json"),
//     JSON.stringify(creditNotesSeed)
//   );

//   res.send("✅ Seed data inserted into MongoDB.");
// });

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
