
const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Quote = require("../models/Quote");
const QC = require("../models/QC");
const ServiceRequest = require("../models/ServiceRequest");

// WORKSPACE HELPER
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// FIND REQUEST IN WORKSPACE
const getWorkspaceRequest = async (requestId, user) => {
  const businessId = getWorkspaceId(user);

  if (!businessId) return null;

  return ServiceRequest.findOne({
    _id: requestId,
    businessId
  });
};

// CREATE INVOICE
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

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    const request = await getWorkspaceRequest(
      requestId,
      req.user
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    if (request.status !== "Ready for Handover") {
      return res.status(400).json({
        success: false,
        message: "Invoice can only be generated when request is Ready for Handover"
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

    const latestQC = await QC.findOne({
      serviceRequest: request._id
    }).sort({ createdAt: -1 });

    if (!latestQC || latestQC.result !== "Passed") {
      return res.status(400).json({
        success: false,
        message: "Latest QC must be passed before invoice generation"
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
        return total +
          Number(part.quantity) * Number(part.unitPrice);
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

// GET INVOICE BY REQUEST
const getInvoiceByRequest = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this invoice"
      });
    }

    const { requestId } = req.params;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    const request = await getWorkspaceRequest(
      requestId,
      req.user
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const invoice = await Invoice.findOne({
      serviceRequest: request._id
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

// GET ALL INVOICES
const getInvoices = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view invoices"
      });
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a workspace"
      });
    }

    const requests = await ServiceRequest.find({
      businessId
    }).select("_id");

    const requestIds = requests.map(
      (request) => request._id
    );

    const invoices = await Invoice.find({
      serviceRequest: { $in: requestIds }
    })
      .populate("customer")
      .populate("quote")
      .populate("serviceRequest")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update payment status"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID"
      });
    }

    const { paymentStatus, paymentMethod } = req.body;

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

    const invoice = await Invoice.findById(req.params.id)
      .populate("serviceRequest");

    const businessId = getWorkspaceId(req.user);

    if (
      !invoice ||
      !businessId ||
      invoice.serviceRequest?.businessId?.toString() !==
        businessId.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found in your workspace"
      });
    }

    invoice.paymentStatus = paymentStatus;

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    invoice.paidAt =
      paymentStatus === "Paid" ? new Date() : null;

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
  getInvoices,
  updatePaymentStatus
};
