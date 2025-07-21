const WebhookModel = require("../models/webhook.js");

const getOrders = (req, res) => {
    // Fetch all orders from the database
    WebhookModel.find({ event: "order_created" })
        .then(orders => {
            res.status(200).json(orders);
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
            res.status(500).send("Internal Server Error");
        });
};

const getRefunds = (req, res) => {
    // Fetch all refunds from the database
    WebhookModel.find({ event: "refund_created" })
        .then(refunds => {
            res.status(200).json(refunds);
        })
        .catch(error => {
            console.error("Error fetching refunds:", error);
            res.status(500).send("Internal Server Error");
        });
};

module.exports = {
    getOrders,
    getRefunds
};