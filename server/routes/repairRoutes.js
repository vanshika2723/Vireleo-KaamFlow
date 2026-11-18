
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createRepairLog,
  getRepairLogs
} = require("../controllers/repairController");

router.use(protect);

router.post("/:requestId", createRepairLog);
router.get("/:requestId", getRepairLogs);

module.exports = router;
