const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getAllHotels,
  countbyCity,
} = require("../controller/hotelController");
const router = express.Router();

router.post("/", Protected, adminOnly, createHotel);
router.get("/", getAllHotels);
router.put("/:id", Protected, adminOnly, updateHotel);
router.delete("/:id", Protected, adminOnly, deleteHotel);
router.get("/find/:id", getHotel);
router.get("/countByCity", countbyCity);
module.exports = router;
