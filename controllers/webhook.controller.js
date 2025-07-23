const WebhookModel = require("../models/webhook.js");


const OrderInvoice = require('../models/orderInvoice.model.js'); // Adjust the path as necessary

// Assuming `order` is your full Shopify order object
async function saveOrderToDB(order) {
  try {
    const getGSTStateCode = (provinceCode) => {
      const gstCodes = {
        'AP': '37', 'AR': '12', 'AS': '18', 'BR': '10', 'CG': '22', 'GA': '30',
        'GJ': '24', 'HR': '06', 'HP': '02', 'JH': '20', 'KA': '29', 'KL': '32',
        'MP': '23', 'MH': '27', 'MN': '14', 'ML': '17', 'MZ': '15', 'NL': '13',
        'OD': '21', 'PB': '03', 'RJ': '08', 'SK': '11', 'TN': '33', 'TS': '36',
        'TR': '16', 'UK': '05', 'UP': '09', 'WB': '19', 'AN': '35', 'CH': '04',
        'DN': '26', 'DD': '25', 'DL': '07', 'JK': '01', 'LA': '38', 'LD': '31',
        'PY': '34'
      };
      return gstCodes[provinceCode] || '00';
    };

    const billing = order.billing_address || {};
    const shipping = order.shipping_address || {};

    const transformAddress = (addr) => ({
      name: addr.first_name,
      address1: addr.address1,
      city: addr.city,
      zip: addr.zip,
      phone: addr.phone,
      state: addr.province,
      state_code: getGSTStateCode(addr.province_code),
      country: addr.country_code,
      gstin: addr.gstin || null,
    });

    const lineItems = order.line_items.map(item => ({
      title: item.title,
      variant_title: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      price: parseFloat(item.price),
      total_discount: parseFloat(item.total_discount),
      tax_lines: item.tax_lines.map(tax => ({
        title: tax.title,
        rate: tax.rate,
        amount: parseFloat(tax.price)
      })),
      hsn: item.hsn || null, // add this if you're enriching product data elsewhere
    }));

    const invoiceData = {
      order_id: String(order.id),
      order_number: order.order_number,
      invoice_number: order.order_number, // Or custom generated invoice no
      created_at: order.created_at,
      processed_at: order.processed_at,
      date_of_supply: order.processed_at, // or a delivery date if available
      place_of_supply: shipping.province,
      place_of_supply_code: getGSTStateCode(shipping.province_code),
      payment_mode: order.payment_gateway_names?.[0] || 'Unknown',

      billing_address: transformAddress(billing),
      shipping_address: transformAddress(shipping),

      line_items: lineItems,

      subtotal_price: parseFloat(order.subtotal_price),
      total_discounts: parseFloat(order.total_discounts),
      total_price: parseFloat(order.total_price),
      total_round_off: parseFloat(order.total_cash_rounding_payment_adjustment_set?.shop_money?.amount || '0.00'),
      total_tax: parseFloat(order.current_total_tax || '0.00'),

      currency: order.currency || 'INR',
    };

    const saved = await OrderInvoice.create(invoiceData);
    console.log('✅ Order saved successfully:', saved.invoice_number);
  } catch (err) {
    console.error('❌ Error saving order to DB:', err.message);
  }
}

const createOrder = async (req, res) => {
    // Handle order creation logic here
    const order = req.body;
    console.log("New order received:", order);
    // Save the order to the database
    await saveOrderToDB(order);
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
