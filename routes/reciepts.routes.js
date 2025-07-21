const Router = require("express").Router;

const e = require("express");
const { getOrders, getRefunds } = require("../controllers/reciepts.controller.js");
const receiptsRouter = Router();

// Route to get all orders
receiptsRouter.get("/orders", getOrders);
// Route to get all refunds
receiptsRouter.get("/refunds", getRefunds);
module.exports = receiptsRouter;