
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");


const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignTechnician,
  createPublicRequest,
  trackPublicRequest
} = require("../controllers/requestController");
// Public customer repair request
router.post("/public", createPublicRequest);
// Public customer service tracking
router.post("/track", trackPublicRequest);

router.use(protect);


router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.patch("/:id/status", updateRequestStatus);
router.patch("/:id/assign", assignTechnician);

module.exports = router;
