
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoiceByRequest,
    updatePaymentStatus
} = require("../controllers/invoiceController");

router.use(protect);

router.post("/:requestId", createInvoice);
router.get("/:requestId", getInvoiceByRequest);
router.patch("/:id/payment", updatePaymentStatus);

module.exports = router;
