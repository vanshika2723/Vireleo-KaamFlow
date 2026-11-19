
const express = require("express");

const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  createQC,
  getQCByRequest
} = require("../controllers/qcController");

router.use(protect);

// Only Admin can create QC inspections until reviewer assignment is implemented
router.post(
  "/:requestId",
  authorize("Admin"),
  createQC
);

// Admin, Service Desk and assigned Technician can view QC records
router.get(
  "/:requestId",
  authorize("Admin", "Service Desk", "Technician"),
  getQCByRequest
);

module.exports = router;
