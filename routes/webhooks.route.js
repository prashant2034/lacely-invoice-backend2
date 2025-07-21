const Router = require("express").Router;
const verifyShopifyWebhook = require("../middleware/verifyreq.middleware.js");
const { createOrder, createRefund } = require("../controllers/webhook.controller.js");

const webhooksRouter = Router();

webhooksRouter.use(verifyShopifyWebhook);

webhooksRouter.post("/order", createOrder);
webhooksRouter.post("/refund", createRefund);
module.exports = webhooksRouter;