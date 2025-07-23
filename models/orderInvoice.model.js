const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  name: String,
  address1: String,
  city: String,
  zip: String,
  phone: String,
  state: String,
  state_code: String, // derived from province_code (e.g., "27" for Maharashtra)
  country: String,
  gstin: String, // optional, if available
});

const TaxLineSchema = new mongoose.Schema({
  title: String,      // e.g., "IGST"
  rate: Number,       // e.g., 0.12
  amount: Number,     // tax amount in ₹
});

const LineItemSchema = new mongoose.Schema({
  title: String,
  variant_title: String,
  sku: String,
  quantity: Number,
  price: Number,           // per item
  total_discount: Number,
  tax_lines: [TaxLineSchema],
  hsn: String,             // optional, pulled from metafields
});

const OrderInvoiceSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true }, // Shopify Order ID or custom ID
  order_number: String,
  invoice_number: String, // can be same as order_number or custom
  created_at: Date,       // order date
  processed_at: Date,     // invoice date
  date_of_supply: Date,   // optional - same as processed_at
  place_of_supply: String, // derived from shipping state
  place_of_supply_code: String, // GST state code

  payment_mode: String,

  billing_address: AddressSchema,
  shipping_address: AddressSchema,

  line_items: [LineItemSchema],

  subtotal_price: Number,
  total_discounts: Number,
  total_price: Number,
  total_round_off: Number, // from total_cash_rounding_payment_adjustment_set
  total_tax: Number,       // optional, can be calculated dynamically

  currency: { type: String, default: 'INR' },
}, { timestamps: true });

module.exports = mongoose.model('OrderInvoice', OrderInvoiceSchema);
