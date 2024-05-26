const { HOTELBOOKING } = require("../models/BookingModel");
const Hotel = require("../models/hotelModel");
const Room = require("../models/roomModel");
const asyncHandler = require("express-async-handler");

const createRoom = asyncHandler(async (req, res) => {
  const { title, price, maxPeople, desc } = req.body;
  const hotelId = req.params.hotelid;

  if (!title || !price || !maxPeople || !desc || !hotelId) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }
  const newRoom = new Room(req.body);
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    res.status(400);
    throw new Error("Hotel Not Found");
  }
  const savedRoom = await newRoom.save();

  if (!savedRoom) {
    res.status(400);
    throw new Error("Error in creating a Room");
  }

  const pushToHotel = await Hotel.findByIdAndUpdate(hotelId, {
    $push: { rooms: savedRoom._id },
  });

  if (!pushToHotel) {
    res.status(400);
    throw new Error("Error in saving the Room id");
  }
  res.status(200).json(savedRoom);
});

const updateRoomAvailability = asyncHandler(async (req, res) => {
  const { roomId, hotelId, datenow } = req.body;
  const userId = req.user.id;
  const dates = req.body.dates;

  if (!req.params.id || !dates || dates.length === 0) {
    res.status(400);
    throw new Error(
      "Error updating room availability: Missing required fields."
    );
  }
  const startDate = new Date(dates[0]).toISOString().split("T")[0];
  const endDate = new Date(dates[dates.length - 1]).toISOString().split("T")[0];

  if (!datenow || !roomId || !hotelId || !userId || !startDate || !endDate) {
    res.status(400);
    throw new Error("Please Fill all Fields");
  }
  const data = await Room.updateOne(
    { "roomNumbers._id": req.params.id },
    {
      $push: {
        "roomNumbers.$.unavailableDates": { $each: [startDate, endDate] },
      },
    }
  );
  if (!data) {
    res.status(500);
    throw new Error(`Error updating room availability`);
  }

  const ReserveHotel = await HOTELBOOKING.create({
    userId,
    hotelId,
    roomId: [req.params.id],
    Bookedfor: [{ startDate, endDate }],
    status: "Reserved",
    bookAt: datenow,
  });

  if (!ReserveHotel) {
    res.status(400);
    throw new Error(`Error Creating the Reserve Hotel`);
  }
  res
    .status(200)
    .json({ status: "success", message: "Room Reserved successfully" });
});

const updateRoom = asyncHandler(async (req, res) => {
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.status(200).json(updatedRoom);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelid;
  const room = await Room.findById(req.params.id);
  const hotel = await Hotel.findById(hotelId);
  if (!room) {
    res.status(404);
    throw new Error("Room Not Found");
  }
  if (!hotel) {
    res.status(404);
    throw new Error("Hotel Not Found");
  }

  await room.deleteOne();
  await Hotel.findByIdAndUpdate(hotelId, {
    $pull: { rooms: req.params.id },
  });
  res
    .status(200)
    .json({ status: "success", message: "Room information deleted." });
});
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  res.status(200).json(room);
});

const getAllRoom = asyncHandler(async (req, res) => {
  const room = await Room.find().sort("-createdAt");
  res.status(200).json(room);
});

const getAllHotelReservation = asyncHandler(async (req, res) => {
  const reserve = await HOTELBOOKING.find()
    .populate("userId")
    .populate("hotelId")
    .sort("-createdAt");
  res.status(200).json(reserve);
});

const getSingleHotelReservation = asyncHandler(async (req, res) => {
  const reserve = await HOTELBOOKING.find({ userId: req.user._id })
    .populate("userId")
    .populate("hotelId")
    .sort("-createdAt");
  res.status(200).json(reserve);
});

const cancelReservation = asyncHandler(async (req, res) => {
  const reserve = await HOTELBOOKING.findById(req.params.id)
    .populate("userId")
    .populate("hotelId");
  if (reserve.status.toLowerCase() !== "reserved") {
    res.status(404);
    throw new Error("Reservation not found");
  }
  const roomId = reserve.roomId[0];
  const { startDate, endDate } = reserve.Bookedfor[0];
  // Remove the specified dates from the unavailableDates array
  const data = await Room.updateOne(
    { "roomNumbers._id": roomId },
    {
      $pull: {
        "roomNumbers.$.unavailableDates": {
          $in: [startDate, endDate],
        },
      },
    }
  );
  if (!data) {
    res.status(500);
    throw new Error(`Error updating room availability`);
  }
  reserve.status = "Available";
  await reserve.save();
  res.status(200).json({ message: "Hotel Reservation canceled successfully" });
});
module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoom,
  getAllRoom,
  updateRoomAvailability,
  getAllHotelReservation,
  getSingleHotelReservation,
  cancelReservation,
};
