const mongoose = require("mongoose");

const CreditNoteSchema = new mongoose.Schema({
  number: String,
  customer: String,
  amount: String,
  date: String,
  reason: String,
  link: String,
});

module.exports = mongoose.model("CreditNote", CreditNoteSchema);
