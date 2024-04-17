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

module.exports = { createRoom, updateRoom, deleteRoom, getRoom, getAllRoom };
