const invoiceRouter = require("express").Router();
const {getAllInvoices} = require("../controllers/invoice.controller.js");

invoiceRouter.get("/orders", getAllInvoices);


module.exports = invoiceRouter;
