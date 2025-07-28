const orderInvoice = require('../models/orderInvoice.model.js');

const getAllInvoices = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 10,
      search = '',
      paymentMode = '',
      state = '',
      dateFrom = '',
      dateTo = '',
      minAmount = '',
      maxAmount = '',
      hasGSTIN = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build MongoDB filter object
    const filter = {};

    // Search functionality - searches across multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }; // Case-insensitive search
      filter.$or = [
        { invoice_number: searchRegex },
        { order_number: searchRegex },
        { order_id: searchRegex },
        { 'billing_address.name': searchRegex },
        { 'billing_address.city': searchRegex },
        { 'billing_address.phone': searchRegex },
        { 'shipping_address.name': searchRegex },
        { 'shipping_address.city': searchRegex },
        { 'line_items.title': searchRegex },
        { 'line_items.sku': searchRegex },
        { 'line_items.hsn': searchRegex }
      ];
    }

    // Payment mode filter
    if (paymentMode) {
      filter.payment_mode = paymentMode;
    }

    // State/Place of supply filter
    if (state) {
      filter.place_of_supply = state;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.created_at = {};
      if (dateFrom) {
        filter.created_at.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add 23:59:59 to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.created_at.$lte = endDate;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.total_price = {};
      if (minAmount) {
        filter.total_price.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filter.total_price.$lte = parseFloat(maxAmount);
      }
    }

    // GSTIN filter
    if (hasGSTIN === 'yes') {
      filter['billing_address.gstin'] = { $exists: true, $ne: '', $ne: null };
    } else if (hasGSTIN === 'no') {
      filter.$or = [
        { 'billing_address.gstin': { $exists: false } },
        { 'billing_address.gstin': '' },
        { 'billing_address.gstin': null }
      ];
    }

    // Pagination calculations
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel for better performance
    const [invoices, totalCount] = await Promise.all([
      orderInvoice
        .find(filter)
        .sort(sortObject)
        .skip(skip)
        .limit(limitNumber)
        .lean(), // Use lean() for better performance as we don't need Mongoose documents
      orderInvoice.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Response with data and pagination info
    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNumber,
        hasNextPage,
        hasPrevPage,
        startItem: skip + 1,
        endItem: Math.min(skip + limitNumber, totalCount)
      },
      filters: {
        search,
        paymentMode,
        state,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        hasGSTIN,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch invoices",
      message: error.message 
    });
  }
};

// Optional: Get unique filter options for dropdowns
const getFilterOptions = async (req, res) => {
  try {
    const [paymentModes, states] = await Promise.all([
      orderInvoice.distinct('payment_mode'),
      orderInvoice.distinct('place_of_supply')
    ]);

    res.json({
      success: true,
      data: {
        paymentModes: paymentModes.filter(mode => mode), // Remove null/empty values
        states: states.filter(state => state) // Remove null/empty values
      }
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch filter options" 
    });
  }
};

// Optional: Get invoice statistics
const getInvoiceStats = async (req, res) => {
  try {
    const stats = await orderInvoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total_price' },
          totalTax: { $sum: '$total_tax' },
          avgInvoiceAmount: { $avg: '$total_price' }
        }
      },
      {
        $project: {
          _id: 0,
          totalInvoices: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          totalTax: { $round: ['$totalTax', 2] },
          avgInvoiceAmount: { $round: ['$avgInvoiceAmount', 2] }
        }
      }
    ]);

    // Get payment mode distribution
    const paymentModeStats = await orderInvoice.aggregate([
      {
        $group: {
          _id: '$payment_mode',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_price' }
        }
      },
      {
        $project: {
          paymentMode: '$_id',
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalInvoices: 0,
          totalAmount: 0,
          totalTax: 0,
          avgInvoiceAmount: 0
        },
        paymentModeDistribution: paymentModeStats
      }
    });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch invoice statistics" 
    });
  }
};

const getInvoiceByNumber = async (req, res) => {
  const { number } = req.params;
  try {
    const invoice = await orderInvoice.findOne({ invoice_number: number });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found"
      });
    }
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
      message: error.message
    });
  }
};

module.exports = {
  getAllInvoices,
  getFilterOptions,
  getInvoiceStats,
  getInvoiceByNumber
};
