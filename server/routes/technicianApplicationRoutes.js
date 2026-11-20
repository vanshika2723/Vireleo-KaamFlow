
const express = require("express");
const router = express.Router();

const {
  submitTechnicianApplication
} = require("../controllers/technicianApplicationController");
const {
  activateTechnicianAccount
} = require("../controllers/technicianApprovalController");

// Public technician application submission
router.post("/", submitTechnicianApplication);
// Public technician account activation
router.post("/activate", activateTechnicianAccount);
module.exports = router;
