const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createPackage,
  getallPackage,
  getSinglePackage,
  deletePackage,
  updatePackage,
} = require("../controller/packageController");

router.post("/createPackage", Protected, adminOnly, createPackage);
router.get("/", getallPackage); // Get all package
router.get("/:id", getSinglePackage); // Get single package
router.delete("/deletePackage/:id", Protected, adminOnly, deletePackage); // Delete package
router.patch("/updatePackage/:id", Protected, adminOnly, updatePackage); // Update package

module.exports = router;
