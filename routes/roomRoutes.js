const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const {
  createRoom,
  getAllRoom,
  updateRoom,
  deleteRoom,
  getRoom,
  updateRoomAvailability,
  getAllHotelReservation,
  getSingleHotelReservation,
  cancelReservation,
} = require("../controller/roomController");

const router = express.Router();

router.post("/:hotelid", Protected, adminOnly, createRoom);
router.get("/", getAllRoom);
router.put("/availability/:id", Protected, updateRoomAvailability);
router.put("/:id", Protected, adminOnly, updateRoom);
router.delete("/:id/:hotelid", Protected, adminOnly, deleteRoom);
router.get("/:id", getRoom);
router.get("/reserve/getAllReserveHotel", Protected, getAllHotelReservation);
router.get(
  "/reserve/getSingleReserveHotel",
  Protected,
  getSingleHotelReservation
);
router.patch("/reserve/cancelReservarion/:id", Protected, cancelReservation);

module.exports = router;
