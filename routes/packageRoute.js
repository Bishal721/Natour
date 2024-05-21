const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createPackage,
  getallPackage,
  getSinglePackage,
  deletePackage,
  updatePackage,
  getFiveData,
  createReview,
  createBooking,
  getTourBySearch,
  getAllBookings,
  cancelBooking,
} = require("../controller/packageController");
const { upload } = require("../utils/fileUpload");
const { checkout } = require("../controller/paymentController");

router.post("/", Protected, adminOnly, upload.single("image"), createPackage);
router.get("/", getallPackage); // Get all package
// Payment api
router.post("/checkout", checkout);
router.get("/getFivePackages", getFiveData); // Get five package
router.get("/:id", getSinglePackage); // Get single package
router.delete("/:id", Protected, adminOnly, deletePackage); // Delete package
router.patch(
  "/:id",
  Protected,
  adminOnly,
  upload.single("image"),
  updatePackage
); // Update package

router.post("/createReview", Protected, createReview); // Create a new review
router.post("/createBooking", Protected, createBooking);
router.get("/book/getAllBooking", getAllBookings);
router.get("/search/getTourBySearch", getTourBySearch);
router.patch("/cancelBooking/:id", Protected, cancelBooking);
module.exports = router;
