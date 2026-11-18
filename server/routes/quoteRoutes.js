
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuoteStatus
} = require("../controllers/quoteController");

router.use(protect);

router.post("/", createQuote);
router.get("/", getQuotes);
router.get("/:id", getQuoteById);
router.patch("/:id/status", updateQuoteStatus);

module.exports = router;
