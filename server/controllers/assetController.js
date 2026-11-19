
const Asset = require("../models/Asset");
const Customer = require("../models/Customer");

// Get user's workspace ID
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// Shared workspace scope
const getAssetScope = (user) => {
  if (["Admin", "Service Desk"].includes(user.role)) {
    const businessId = getWorkspaceId(user);

    if (businessId) {
      return { businessId };
    }
  }

  return { createdBy: user._id };
};

// CREATE ASSET
const createAsset = async (req, res) => {
  try {
    const {
      customer,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      condition,
      description
    } = req.body;

    if (!customer || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "Customer, category and brand are required"
      });
    }

    const customerScope = {
      _id: customer,
      isActive: true
    };

    if (["Admin", "Service Desk"].includes(req.user.role)) {
      const businessId = getWorkspaceId(req.user);

      if (!businessId) {
        return res.status(403).json({
          success: false,
          message: "User is not connected to a business workspace"
        });
      }

      customerScope.businessId = businessId;
    } else {
      customerScope.createdBy = req.user._id;
    }

    const customerExists = await Customer.findOne(customerScope);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your workspace"
      });
    }

    const asset = await Asset.create({
      customer,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate: purchaseDate || null,
      condition,
      description,
      createdBy: req.user._id,
      businessId: customerExists.businessId || null
    });

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      asset
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL ASSETS
const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find(
      getAssetScope(req.user)
    )
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      assets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE ASSET
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      ...getAssetScope(req.user)
    }).populate("customer", "name email phone");

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    res.status(200).json({
      success: true,
      asset
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE ASSET
const updateAsset = async (req, res) => {
  try {
    const allowedFields = [
      "category",
      "brand",
      "model",
      "serialNumber",
      "purchaseDate",
      "condition",
      "description"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const asset = await Asset.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getAssetScope(req.user)
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate("customer", "name email phone");

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      asset
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE ASSET
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({
      _id: req.params.id,
      ...getAssetScope(req.user)
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset
};
