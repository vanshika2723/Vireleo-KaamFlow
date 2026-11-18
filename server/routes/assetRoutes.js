
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset
} = require("../controllers/assetController");

router.use(protect);

router.post("/", createAsset);
router.get("/", getAssets);
router.get("/:id", getAssetById);
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);

module.exports = router;
