const WebhookModel = require("../models/webhook.js");
const express = require("express");


const createOrder = (req, res) => {
    // Handle order creation logic here
    const order = req.body;
    console.log("New order received:", order);
    // Save the order to the database
    const newOrder = new WebhookModel({
        event: "order_created",
        payload: order
    });

    newOrder.save()
        .then(() => {
            res.status(200).send("Order created successfully");
        })
        .catch((error) => {
            console.error("Error saving order:", error);
            res.status(500).send("Internal Server Error");
        });

};
const createRefund = (req, res) => {
    // Handle refund creation logic here
    const refund = req.body;
    console.log("New refund received:", refund);
    // Save the refund to the database
    const newRefund = new WebhookModel({
        event: "refund_created",
        payload: refund
    });

    newRefund.save()
        .then(() => {
            res.status(200).send("Refund created successfully");
        })
        .catch((error) => {
            console.error("Error saving refund:", error);
            res.status(500).send("Internal Server Error");
        });
};

module.exports = {
    createOrder,
    createRefund
};
