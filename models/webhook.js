const mongoose = require("mongoose");
//temporary schema to view webhooks schema
const webhookSchema = new mongoose.Schema({
  event: { type: String, required: true },
  payload: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const WebhookModel = mongoose.model("Webhook", webhookSchema);

module.exports = WebhookModel;
