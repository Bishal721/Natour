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
  getExtraPeople,
  getSingleBooking,
  createCustomBooking,
  getAllCustomBookings,
  getSingleCustomBooking,
  cancelCustomBooking,
} = require("../controller/packageController");
const { upload } = require("../utils/fileUpload");
const { checkout, customCheckout } = require("../controller/paymentController");

// Routes

router.get("/getMaxPeople", Protected, getExtraPeople);
router.post("/", Protected, adminOnly, upload.single("image"), createPackage);
router.get("/", getallPackage); // Get all package
// Payment api
router.post("/checkout", checkout);
router.post("/customCheckout", customCheckout);
router.patch("/cancelBooking/:id", Protected, cancelBooking);
router.patch("/cancelCustomBooking/:id", Protected, cancelCustomBooking);
router.get("/getFivePackages", getFiveData); // Get five package
router.get("/:id", getSinglePackage); // Get single package
router.patch(
  "/:id",
  Protected,
  adminOnly,
  upload.single("image"),
  updatePackage
); // Update package

router.post("/createReview", Protected, createReview); // Create a new review
router.post("/createBooking", Protected, createBooking);
router.post("/customBooking", Protected, createCustomBooking);
router.get("/book/getAllBooking", Protected, getAllBookings);
router.get("/book/getUserSpecific", Protected, getSingleBooking);
router.get("/book/getAllCustomBookings", Protected, getAllCustomBookings);
router.get("/book/getUserSpecificCustom", Protected, getSingleCustomBooking);
router.get("/search/getTourBySearch", getTourBySearch);
router.delete("/:id", Protected, adminOnly, deletePackage); // Delete package

module.exports = router;
