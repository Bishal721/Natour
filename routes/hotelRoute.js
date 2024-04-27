const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getAllHotels,
  countbyCity,
  getHotelRooms,
} = require("../controller/hotelController");
const router = express.Router();
const { upload } = require("../utils/fileUpload");

router.post("/", Protected, adminOnly, upload.single("photos"), createHotel);
router.get("/", getAllHotels);
router.put("/:id", Protected, adminOnly, upload.single("photos"), updateHotel);
router.delete("/:id", Protected, adminOnly, deleteHotel);
router.get("/find/:id", getHotel);
router.get("/countByCity", countbyCity);
router.get("/room/:id", getHotelRooms);
module.exports = router;
