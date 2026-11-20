
const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const Asset = require("../models/Asset");
const Diagnosis = require("../models/Diagnosis");
const RepairLog = require("../models/RepairLog");
const QC = require("../models/QC");
const User = require("../models/User");
const Quote = require("../models/Quote");
const sendEmail = require("../utils/emailService");

// Get workspace ID
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// Get request access scope
const getRequestScope = (user) => {
  if (["Admin", "Service Desk"].includes(user.role)) {
    const businessId = getWorkspaceId(user);

    return businessId
      ? { businessId }
      : { _id: null };
  }

  if (user.role === "Technician") {
    return { assignedTechnician: user._id };
  }

  return { createdBy: user._id };
};

// CREATE SERVICE REQUEST
const createRequest = async (req, res) => {
  try {
    const {
      customer,
      asset,
      reportedSymptom,
      priority,
      preferredDate,
      serviceAddress
    } = req.body;

    if (!customer || !asset || !reportedSymptom) {
      return res.status(400).json({
        success: false,
        message: "Customer, asset and reported symptom are required"
      });
    }

    const isOperationsStaff = [
      "Admin",
      "Service Desk"
    ].includes(req.user.role);

    const businessId = isOperationsStaff
      ? getWorkspaceId(req.user)
      : null;

    if (isOperationsStaff && !businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a business workspace"
      });
    }

    const customerFilter = {
      _id: customer,
      isActive: true
    };

    if (isOperationsStaff) {
      customerFilter.businessId = businessId;
    } else {
      customerFilter.createdBy = req.user._id;
    }

    const customerExists = await Customer.findOne(customerFilter);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your workspace"
      });
    }

    const assetFilter = {
      _id: asset,
      customer
    };

    if (isOperationsStaff) {
      assetFilter.businessId = businessId;
    } else {
      assetFilter.createdBy = req.user._id;
    }

    const assetExists = await Asset.findOne(assetFilter);

    if (!assetExists) {
      return res.status(404).json({
        success: false,
        message: "Asset not found for this customer"
      });
    }

    const requestId = `KF-${Date.now()}`;

    const serviceRequest = await ServiceRequest.create({
      requestId,
      customer,
      asset,
      reportedSymptom,
      priority: priority || "Normal",
      preferredDate: preferredDate || null,
      serviceAddress,
      createdBy: req.user._id,
      businessId: isOperationsStaff
        ? businessId
        : customerExists.businessId || null
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      serviceRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUBLIC CUSTOMER REPAIR REQUEST

const createPublicRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      category,
      brand,
      model,
      serialNumber,
      reportedSymptom,
      preferredDate
    } = req.body;

    // Validate required fields
    if (!name || !phone || !category || !brand || !reportedSymptom) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, appliance category, brand and problem description are required"
      });
    }

    // Get configured Admin workspace
    const workspaceId = process.env.ADMIN_WORKSPACE_ID;

    if (!workspaceId) {
      return res.status(500).json({
        success: false,
        message: "Repair service workspace is not configured"
      });
    }

    const admin = await User.findOne({
      _id: workspaceId,
      role: "Admin",
      isActive: true
    });

    if (!admin) {
      return res.status(500).json({
        success: false,
        message: "Repair service workspace is unavailable"
      });
    }

    // Create customer
    const customer = await Customer.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone.trim(),
      address: address || "",
      city: city || "",
      createdBy: admin._id,
      businessId: admin.businessId || admin._id
    });

    // Create appliance asset
    const asset = await Asset.create({
      customer: customer._id,
      category,
      brand: brand.trim(),
      model: model || "",
      serialNumber: serialNumber || "",
      condition: "Not Working",
      description: reportedSymptom,
      createdBy: admin._id,
      businessId: admin.businessId || admin._id
    });

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      requestId: `KF-${Date.now()}`,
      customer: customer._id,
      asset: asset._id,
      reportedSymptom: reportedSymptom.trim(),
      priority: "Normal",
      preferredDate: preferredDate || null,
      serviceAddress: address || "",
      createdBy: admin._id,
      businessId: admin.businessId || admin._id,
      status: "Needs Review"
    });

    // Send repair request confirmation email
    if (customer.email) {
      try {
        await sendEmail({
          to: customer.email,
          subject: `KAAMFLOW - Repair Request Received (${serviceRequest.requestId})`,
          text: `Hello ${customer.name},

Your repair request has been successfully submitted to KAAMFLOW.

Request ID: ${serviceRequest.requestId}
Appliance: ${category}
Brand: ${brand}
Model: ${model || "Not specified"}
Reported Problem: ${reportedSymptom}
Current Status: ${serviceRequest.status}

Please keep your Request ID safe for tracking your repair.

Thank you for choosing KAAMFLOW.

Regards,
KAAMFLOW Support Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #334155;">
              <h2 style="color: #4f46e5;">KAAMFLOW</h2>
              <h3>Repair Request Received!</h3>
              <p>Hello ${customer.name},</p>
              <p>Your repair request has been successfully submitted.</p>
              <div style="background: #f8fafc; padding: 18px; border-radius: 10px;">
                <p><strong>Request ID:</strong> ${serviceRequest.requestId}</p>
                <p><strong>Appliance:</strong> ${category}</p>
                <p><strong>Brand:</strong> ${brand}</p>
                <p><strong>Model:</strong> ${model || "Not specified"}</p>
                <p><strong>Problem:</strong> ${reportedSymptom}</p>
                <p><strong>Status:</strong> ${serviceRequest.status}</p>
              </div>
              <p>Please keep your Request ID safe for tracking your repair.</p>
              <p>Thank you for choosing KAAMFLOW!</p>
              <p>KAAMFLOW Support Team</p>
            </div>
          `
        });

        console.log("Repair request confirmation email sent.");
      } catch (emailError) {
        console.error(
          "Repair confirmation email failed:",
          emailError.message
        );
      }
    } else {
      console.log("Customer email not provided. Confirmation email skipped.");
    }

    return res.status(201).json({
      success: true,
      message: "Your repair request has been submitted successfully",
      requestId: serviceRequest.requestId,
      status: serviceRequest.status
    });

  } catch (error) {
    console.error("Public repair request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit repair request"
    });
  }
};


// PUBLIC CUSTOMER SERVICE TRACKING
const trackPublicRequest = async (req, res) => {
  try {
    const { requestId, phone } = req.body;

    if (!requestId || !phone) {
      return res.status(400).json({
        success: false,
        message: "Request ID and registered phone number are required"
      });
    }

    const request = await ServiceRequest.findOne({
      requestId: requestId.trim()
    })
      .populate("customer", "name phone")
      .populate("asset", "category brand model")
      .populate("assignedTechnician", "name phone");

    if (!request || !request.customer) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    if (request.customer.phone !== phone.trim()) {
      return res.status(403).json({
        success: false,
        message: "Invalid request ID or registered phone number"
      });
    }
    // Repair Progress Timeline
    const timelineStages = [
      {
        title: "Request Received",
        statuses: ["Needs Review", "Needs More Information", "Accepted", "Open"]
      },
      {
        title: "Diagnosis",
        statuses: ["In Diagnosis", "Diagnosis Completed"]
      },
      {
        title: "Quote & Approval",
        statuses: [
          "Quote Created",
          "Quote Sent",
          "Awaiting Approval",
          "Pending Approval",
          "Approved"
        ]
      },
      {
        title: "Repair",
        statuses: ["Repair In Progress", "Repair Completed"]
      },
      {
        title: "Quality Check",
        statuses: ["QC In Progress", "QC Passed", "QC Failed"]
      },
      {
        title: "Handover",
        statuses: ["Ready for Handover", "Completed"]
      }
    ];

    const currentStageIndex = timelineStages.findIndex((stage) =>
      stage.statuses.includes(request.status)
    );

    const progressTimeline = timelineStages.map((stage, index) => ({
      title: stage.title,
      status:
        index < currentStageIndex
          ? "Completed"
          : index === currentStageIndex
            ? "Current"
            : "Upcoming"
    }));
    return res.status(200).json({
      success: true,
      message: "Service request details retrieved successfully",
      request: {
        requestId: request.requestId,
        customer: request.customer.name,
        appliance: request.asset,
        reportedSymptom: request.reportedSymptom,
        status: request.status,
        priority: request.priority,
        preferredDate: request.preferredDate,
      assignedTechnician: request.assignedTechnician
  ? request.assignedTechnician.name
  : null,
progressTimeline,
stageTimestamps: request.stageTimestamps,
createdAt: request.createdAt,
updatedAt: request.updatedAt
      }
    });

  } catch (error) {
    console.error("Public tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to track service request"
    });
  }
};

// GET ALL REQUESTS
const getRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find(
      getRequestScope(req.user)
    )
      .populate("customer", "name email phone")
      .populate("asset", "category brand model serialNumber")
      .populate("assignedTechnician", "name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE REQUEST
const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      ...getRequestScope(req.user)
    })
      .populate("customer", "name email phone address")
      .populate("asset", "category brand model serialNumber condition")
      .populate("assignedTechnician", "name email phone role");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE REQUEST STATUS

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      ...getRequestScope(req.user)
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or access denied"
      });
    }

    const transitions = {
      "Needs Review": [
        "Accepted",
        "Needs More Information",
        "Out of Coverage",
        "Declined"
      ],
      "Accepted": ["Open"],
      "Open": ["In Diagnosis"],
      "In Diagnosis": ["Diagnosis Completed"],
      "Diagnosis Completed": ["Repair In Progress"],
      "Repair In Progress": ["Repair Completed"],
      "Repair Completed": ["QC Passed", "QC Failed"],
      "QC Failed": ["Repair In Progress"],
      "QC Passed": ["Ready for Handover"],
      "Ready for Handover": ["Completed"]
    };

    const allowedNextStatuses = transitions[request.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${request.status} to ${status}`
      });
    }

    if (status === "Diagnosis Completed") {
      const diagnosis = await Diagnosis.findOne({
        serviceRequest: request._id
      });

      if (!diagnosis) {
        return res.status(400).json({
          success: false,
          message: "Save diagnosis before completing it"
        });
      }
    }

    if (status === "Repair Completed") {
      const repairLog = await RepairLog.findOne({
        serviceRequest: request._id
      });

      if (!repairLog) {
        return res.status(400).json({
          success: false,
          message: "Repair log must be created before completing repair"
        });
      }
    }

    if (status === "QC Passed" || status === "QC Failed") {
      const qcRecord = await QC.findOne({
        serviceRequest: request._id
      }).sort({ createdAt: -1 });

      if (!qcRecord) {
        return res.status(400).json({
          success: false,
          message: "QC inspection must be completed first"
        });
      }

      const expectedResult = status.replace("QC ", "");

      if (qcRecord.result !== expectedResult) {
        return res.status(400).json({
          success: false,
          message: "Latest QC result does not match requested status"
        });
      }
    }

    // Automatically record repair stage timestamps
    const timestamp = new Date();

    const timestampMapping = {
      "In Diagnosis": "diagnosisStartedAt",
      "Diagnosis Completed": "diagnosisCompletedAt",
      "Repair In Progress": "repairStartedAt",
      "Repair Completed": "repairCompletedAt",
      "QC Passed": "qcPassedAt",
      "Ready for Handover": "readyForHandoverAt",
      "Completed": "completedAt"
    };

    const timestampField = timestampMapping[status];

    if (timestampField) {
      request.stageTimestamps = request.stageTimestamps || {};
      request.stageTimestamps[timestampField] = timestamp;
    }

    request.status = status;
    await request.save();

    // Send customer status update email
  
    // Send customer status update email in background
    Promise.resolve().then(async () => {
      try {
        const customer = await Customer.findById(request.customer)
          .select("name email");

        if (customer?.email) {
          await sendEmail({
            to: customer.email,
            subject: `KAAMFLOW - Service Update (${request.requestId})`,
            text: `Hello ${customer.name},

Your repair service request has been updated.

Request ID: ${request.requestId}
Current Status: ${status}

Thank you for choosing KAAMFLOW.

Regards,
KAAMFLOW Support Team`
          });

          console.log("Customer status notification email sent.");
        } else {
          console.log("Customer email not available. Notification skipped.");
        }
      } catch (emailError) {
        console.error("Customer notification email failed:", emailError);
      }
    });


    return res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ASSIGN TECHNICIAN

const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to assign technicians"
      });
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a business workspace"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      businessId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const technician = await User.findOne({
      _id: technicianId,
      role: "Technician",
      businessId,
      isActive: true
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Active technician from your workspace not found"
      });
    }

    const approvedQuote = await Quote.findOne({
      serviceRequest: request._id,
      status: "Approved"
    });

    if (!approvedQuote) {
      return res.status(400).json({
        success: false,
        message: "An approved quote is required before assignment"
      });
    }

    request.assignedTechnician = technician._id;
    request.assignedBy = req.user._id;
    request.assignedAt = new Date();

    await request.save();

    // Send technician assignment email to customer
    try {
      const customer = await Customer.findById(request.customer)
        .select("name email");

      if (customer?.email) {
        await sendEmail({
          to: customer.email,
          subject: `KAAMFLOW - Technician Assigned (${request.requestId})`,
          text: `Hello ${customer.name},

A technician has been assigned to your repair request.

Request ID: ${request.requestId}
Technician Name: ${technician.name}
Technician Email: ${technician.email}
Technician Phone: ${technician.phone || "Not available"}

Our technician will contact you regarding your repair service.

Thank you for choosing KAAMFLOW.

Regards,
KAAMFLOW Support Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #334155;">
              <h2 style="color: #4f46e5;">KAAMFLOW</h2>
              <h3>Technician Assigned!</h3>
              <p>Hello ${customer.name},</p>
              <p>A technician has been assigned to your repair request.</p>
              <div style="background: #f8fafc; padding: 18px; border-radius: 10px;">
                <p><strong>Request ID:</strong> ${request.requestId}</p>
                <p><strong>Technician:</strong> ${technician.name}</p>
                <p><strong>Email:</strong> ${technician.email}</p>
                <p><strong>Phone:</strong> ${technician.phone || "Not available"}</p>
              </div>
              <p>Our technician will contact you regarding your repair service.</p>
              <p>Thank you for choosing KAAMFLOW!</p>
              <p>KAAMFLOW Support Team</p>
            </div>
          `
        });

        console.log("Technician assignment email sent to customer.");
      } else {
        console.log("Customer email unavailable. Assignment email skipped.");
      }
    } catch (emailError) {
      console.error(
        "Technician assignment email failed:",
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Technician assigned successfully",
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignTechnician,
  createPublicRequest,
  trackPublicRequest
};
