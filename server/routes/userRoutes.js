
const express = require("express");
const router = express.Router();

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const {
  getTechnicians,
  getProfile,
  updateProfile
} = require("../controllers/userController");

router.use(protect);

// Only Admin and Service Desk can view technicians
router.get(
  "/technicians",
  authorize("Admin", "Service Desk"),
  getTechnicians
);

// User Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
