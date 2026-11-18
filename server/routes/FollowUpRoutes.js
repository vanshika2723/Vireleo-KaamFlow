
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  submitOutcome,
  markNoResponse
} = require("../controllers/FollowUpController");

router.use(protect);

// Create follow-up
router.post("/", createFollowUp);

// Get all follow-ups
router.get("/", getFollowUps);

// Get single follow-up
router.get("/:id", getFollowUpById);

// Submit customer outcome
router.patch("/:id/outcome", submitOutcome);

// Mark follow-up as no response
router.patch("/:id/no-response", markNoResponse);

module.exports = router;
