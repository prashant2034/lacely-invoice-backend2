const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  number: String,
  customer: String,
  amount: String,
  date: String,
  link: String,
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
