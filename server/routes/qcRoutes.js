
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createQC,
  getQCByRequest
} = require("../controllers/qcController");

router.use(protect);

router.post("/:requestId", createQC);
router.get("/:requestId", getQCByRequest);

module.exports = router;
