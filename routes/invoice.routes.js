const invoiceRouter = require("express").Router();
const {getAllInvoices,getFilterOptions, getInvoiceByNumber} = require("../controllers/invoice.controller.js");

invoiceRouter.get("/orders", getAllInvoices);
invoiceRouter.get("/orders/filter-options", getFilterOptions);
invoiceRouter.route("/orders/orderno/:number").get(getInvoiceByNumber);

module.exports = invoiceRouter;
