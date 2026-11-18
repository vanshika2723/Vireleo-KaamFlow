
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");


const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignTechnician
} = require("../controllers/requestController");

router.use(protect);

router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.patch("/:id/status", updateRequestStatus);
router.patch("/:id/assign", assignTechnician);

module.exports = router;
