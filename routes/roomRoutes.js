const express = require("express");
const { Protected, adminOnly } = require("../middleware/authMiddleware");
const {
  createRoom,
  getAllRoom,
  updateRoom,
  deleteRoom,
  getRoom,
  updateRoomAvailability,
} = require("../controller/roomController");

const router = express.Router();

router.post("/:hotelid", Protected, adminOnly, createRoom);
router.get("/", getAllRoom);
router.put("/availability/:id", updateRoomAvailability);
router.put("/:id", Protected, adminOnly, updateRoom);
router.delete("/:id/:hotelid", Protected, adminOnly, deleteRoom);
router.get("/:id", getRoom);

module.exports = router;
