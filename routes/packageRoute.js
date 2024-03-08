const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createPackage,
  getallPackage,
  getSinglePackage,
} = require("../controller/packageController");

router.post("/create", createPackage);
router.get("/", getallPackage); // Get all package
router.get("/:id", getSinglePackage); // Get single package

module.exports = router;
