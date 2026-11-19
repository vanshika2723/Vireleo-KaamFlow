
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoiceByRequest,
  getInvoices,
  updatePaymentStatus
} = require("../controllers/invoiceController");

router.use(protect);

router.get("/", getInvoices);
router.post("/:requestId", createInvoice);
router.get("/:requestId", getInvoiceByRequest);
router.patch("/:id/payment", updatePaymentStatus);

module.exports = router;
