
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getOutcomeAnalytics
} = require("../controllers/outcomeAnalyticsController");

router.use(protect);

router.get("/", getOutcomeAnalytics);

module.exports = router;
