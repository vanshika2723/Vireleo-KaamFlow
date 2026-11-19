
const Customer = require("../models/Customer");

// Shared workspace access for Admin and Service Desk
const getCustomerScope = (user) => {
  if (["Admin", "Service Desk"].includes(user.role)) {
    const businessId =
      user.businessId ||
      (user.role === "Admin" ? user._id : null);

    if (businessId) {
      return { businessId };
    }
  }

  // Other roles can access only their own records
  return { createdBy: user._id };
};

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required"
      });
    }

    const businessId =
      req.user.businessId ||
      (req.user.role === "Admin" ? req.user._id : null);

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      city,
      notes,
      createdBy: req.user._id,
      businessId
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      ...getCustomerScope(req.user),
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE CUSTOMER
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      ...getCustomerScope(req.user),
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "notes"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getCustomerScope(req.user),
        isActive: true
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE CUSTOMER (SOFT DELETE)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getCustomerScope(req.user),
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
