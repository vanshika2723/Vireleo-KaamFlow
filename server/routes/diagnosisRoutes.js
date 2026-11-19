
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  createDiagnosis,
  getDiagnosisByRequest,
  updateDiagnosis,
  uploadEvidence
} = require("../controllers/diagnosisController");

router.use(protect);

// Create diagnosis
router.post(
  "/",
  authorize("Admin", "Service Desk", "Technician"),
  createDiagnosis
);

// View diagnosis
router.get(
  "/request/:requestId",
  authorize("Admin", "Service Desk", "Technician"),
  getDiagnosisByRequest
);

// Update diagnosis
router.put(
  "/:id",
  authorize("Admin", "Service Desk", "Technician"),
  updateDiagnosis
);

// Upload diagnosis evidence
router.post(
  "/request/:requestId/evidence",
  authorize("Admin", "Service Desk", "Technician"),
  upload.single("evidence"),
  uploadEvidence
);

module.exports = router;
