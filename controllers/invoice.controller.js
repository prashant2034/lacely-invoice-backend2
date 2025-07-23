const orderInvoice = require('../models/orderInvoice.model.js');

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await orderInvoice.find();
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

module.exports = {
  getAllInvoices,
};
