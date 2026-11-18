
const Invoice = require("../models/Invoice");
const Quote = require("../models/Quote");
const QC = require("../models/QC");
const ServiceRequest = require("../models/ServiceRequest");

const createInvoice = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can generate invoices"
      });
    }

    const { requestId } = req.params;
    const { notes } = req.body;

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const approvedQuote = await Quote.findOne({
      serviceRequest: request._id,
      status: "Approved"
    }).sort({ version: -1 });

    if (!approvedQuote) {
      return res.status(400).json({
        success: false,
        message: "An approved quote is required"
      });
    }

    const qc = await QC.findOne({
      serviceRequest: request._id,
      result: "Passed"
    });

    if (!qc) {
      return res.status(400).json({
        success: false,
        message: "QC must be passed before invoice generation"
      });
    }

    const existingInvoice = await Invoice.findOne({
      serviceRequest: request._id
    });

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: "Invoice already exists for this request",
        invoice: existingInvoice
      });
    }

    const partsCost = approvedQuote.parts.reduce(
      (total, part) => {
        return total + part.quantity * part.unitPrice;
      },
      0
    );

    const invoice = await Invoice.create({
      invoiceNumber: `KF-INV-${Date.now()}`,
      serviceRequest: request._id,
      quote: approvedQuote._id,
      customer: request.customer,
      laborCost: approvedQuote.laborCost,
      partsCost,
      additionalCharges: approvedQuote.additionalCharges,
      totalAmount: approvedQuote.totalAmount,
      notes: notes || "",
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getInvoiceByRequest = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      serviceRequest: req.params.requestId
    })
      .populate("customer")
      .populate("quote")
      .populate("serviceRequest");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update payment status"
      });
    }

    const validStatuses = [
      "Unpaid",
      "Partially Paid",
      "Paid"
    ];

    const validMethods = [
      "Cash",
      "UPI",
      "Card",
      "Bank Transfer",
      "Other"
    ];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    if (
      paymentMethod &&
      !validMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    invoice.paymentStatus = paymentStatus;

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    if (paymentStatus === "Paid") {
      invoice.paidAt = new Date();
    } else {
      invoice.paidAt = null;
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      invoice
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createInvoice,
  getInvoiceByRequest,
    updatePaymentStatus
};
