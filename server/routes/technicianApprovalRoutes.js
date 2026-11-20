
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  getTechnicianApplications,
  approveTechnicianApplication,
  rejectTechnicianApplication
} = require("../controllers/technicianApprovalController");

// Admin-only access
router.use(protect, authorize("Admin"));

// Get all applications
router.get("/", getTechnicianApplications);

// Approve application
router.patch("/:id/approve", approveTechnicianApplication);

// Reject application
router.patch("/:id/reject", rejectTechnicianApplication);

module.exports = router;
