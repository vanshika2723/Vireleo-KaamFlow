
const Diagnosis = require("../models/Diagnosis");
const ServiceRequest = require("../models/ServiceRequest");

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

    if (!serviceRequest || !problemFound) {
      return res.status(400).json({
        success: false,
        message: "Service request and problem found are required"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: serviceRequest,
      createdBy: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    if (!["Open", "In Diagnosis"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Request must be Open or In Diagnosis"
      });
    }

    const existingDiagnosis = await Diagnosis.findOne({
      serviceRequest
    });

    if (existingDiagnosis) {
      return res.status(409).json({
        success: false,
        message: "Diagnosis already exists for this request"
      });
    }

    const diagnosis = await Diagnosis.create({
      serviceRequest,
      technician: req.user._id,
      problemFound,
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
    const request = await ServiceRequest.findOne({
      _id: req.params.requestId,
      createdBy: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
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
    const allowedFields = [
      "problemFound",
      "rootCause",
      "diagnosisNotes",
      "recommendedSolution",
      "estimatedRepairTime",
      "partsRequired"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const diagnosis = await Diagnosis.findOneAndUpdate(
      {
        _id: req.params.id,
        technician: req.user._id
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found or access denied"
      });
    }

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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      createdBy: req.user._id,
      status: "In Diagnosis"
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis request not found"
      });
    }

    const diagnosis = await Diagnosis.findOne({
      serviceRequest: request._id,
      technician: req.user._id
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found or access denied"
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
