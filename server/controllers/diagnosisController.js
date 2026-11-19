
const mongoose = require("mongoose");
const Diagnosis = require("../models/Diagnosis");
const ServiceRequest = require("../models/ServiceRequest");

const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

const canAccessRequest = (request, user) => {
  if (!request || !user) return false;

  if (["Admin", "Service Desk"].includes(user.role)) {
    const businessId = getWorkspaceId(user);

    return Boolean(
      businessId &&
      request.businessId?.toString() === businessId.toString()
    );
  }

  if (user.role === "Technician") {
    return (
      request.businessId?.toString() ===
        user.businessId?.toString() &&
      request.assignedTechnician?.toString() ===
        user._id.toString()
    );
  }

  return false;
};

const canManageDiagnosis = (request, user) => {
  if (!request || !user) return false;

  // Admin and Service Desk can create initial diagnosis
  if (["Admin", "Service Desk"].includes(user.role)) {
    return canAccessRequest(request, user);
  }

  // Technician can manage diagnosis only after assignment
  if (user.role === "Technician") {
    return (
      request.assignedTechnician?.toString() ===
      user._id.toString()
    );
  }

  return false;
};

// CREATE DIAGNOSIS
const createDiagnosis = async (req, res) => {
  try {
    const {
      serviceRequest,
      problemFound,
      rootCause,
      diagnosisNotes,
      recommendedSolution,
      estimatedRepairTime,
      partsRequired
    } = req.body;

    if (
      !serviceRequest ||
      typeof problemFound !== "string" ||
      !problemFound.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service request and problem found are required"
      });
    }

    if (!mongoose.isValidObjectId(serviceRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    const request = await ServiceRequest.findById(serviceRequest);

    if (!request || !canAccessRequest(request, req.user)) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or access denied"
      });
    }

    if (!["Admin", "Service Desk", "Technician"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create diagnosis"
      });
    }

    if (
      req.user.role === "Technician" &&
      !canManageDiagnosis(request, req.user)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned Technician can create diagnosis"
      });
    }

    if (!["Open", "In Diagnosis"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Request must be Open or In Diagnosis"
      });
    }

    const existingDiagnosis = await Diagnosis.findOne({
      serviceRequest: request._id
    });

    if (existingDiagnosis) {
      return res.status(409).json({
        success: false,
        message: "Diagnosis already exists for this request"
      });
    }

    const diagnosis = await Diagnosis.create({
      serviceRequest: request._id,
      technician:
        req.user.role === "Technician"
          ? req.user._id
          : request.assignedTechnician || req.user._id,
      problemFound: problemFound.trim(),
      rootCause,
      diagnosisNotes,
      recommendedSolution,
      estimatedRepairTime,
      partsRequired
    });

    request.status = "In Diagnosis";
    await request.save();

    res.status(201).json({
      success: true,
      message: "Diagnosis saved successfully",
      diagnosis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET DIAGNOSIS BY REQUEST ID
const getDiagnosisByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    const request = await ServiceRequest.findById(requestId);

    if (!canAccessRequest(request, req.user)) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or access denied"
      });
    }

    const diagnosis = await Diagnosis.findOne({
      serviceRequest: request._id
    }).populate("technician", "name email");

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found"
      });
    }

    res.status(200).json({
      success: true,
      diagnosis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE DIAGNOSIS
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid diagnosis ID"
      });
    }

    const diagnosis = await Diagnosis.findById(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found"
      });
    }

    const request = await ServiceRequest.findById(
      diagnosis.serviceRequest
    );

    if (!canAccessRequest(request, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this diagnosis"
      });
    }

    if (!canManageDiagnosis(request, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update diagnosis"
      });
    }

    if (!["Open", "In Diagnosis"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis can no longer be updated"
      });
    }

    const allowedFields = [
      "problemFound",
      "rootCause",
      "diagnosisNotes",
      "recommendedSolution",
      "estimatedRepairTime",
      "partsRequired"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        diagnosis[field] = req.body[field];
      }
    });

    await diagnosis.save();

    res.status(200).json({
      success: true,
      message: "Diagnosis updated successfully",
      diagnosis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPLOAD DIAGNOSIS EVIDENCE
const uploadEvidence = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload"
      });
    }

    const request = await ServiceRequest.findById(requestId);

    if (!canAccessRequest(request, req.user)) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis request not found or access denied"
      });
    }

    if (!canManageDiagnosis(request, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to upload diagnosis evidence"
      });
    }

    if (request.status !== "In Diagnosis") {
      return res.status(400).json({
        success: false,
        message: "Evidence can only be uploaded during diagnosis"
      });
    }

    const diagnosis = await Diagnosis.findOne({
      serviceRequest: request._id
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found"
      });
    }

    const evidence = {
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedAt: new Date()
    };

    diagnosis.evidence.push(evidence);
    await diagnosis.save();

    res.status(200).json({
      success: true,
      message: "Evidence uploaded successfully",
      evidence
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createDiagnosis,
  getDiagnosisByRequest,
  updateDiagnosis,
  uploadEvidence
};
