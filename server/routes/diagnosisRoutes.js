
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createDiagnosis,
  getDiagnosisByRequest,
  updateDiagnosis,
  uploadEvidence
} = require("../controllers/diagnosisController");

router.use(protect);

router.post("/", createDiagnosis);
router.get("/request/:requestId", getDiagnosisByRequest);
router.put("/:id", updateDiagnosis);

// Upload diagnosis evidence
router.post(
  "/request/:requestId/evidence",
  upload.single("evidence"),
  uploadEvidence
);

module.exports = router;
