
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  createRepairLog,
  getRepairLogs
} = require("../controllers/repairController");

router.use(protect);

// Only Technician can create repair logs
router.post(
  "/:requestId",
  authorize("Technician"),
  createRepairLog
);

// Staff, assigned Technician and QC Reviewer can view logs
router.get(
  "/:requestId",
  authorize("Admin", "Service Desk", "Technician", "QC Reviewer"),
  getRepairLogs
);

module.exports = router;
