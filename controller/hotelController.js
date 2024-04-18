const asyncHandler = require("express-async-handler");
const Hotel = require("../models/hotelModel");
const Room = require("../models/roomModel");

const createHotel = asyncHandler(async (req, res) => {
  const { name, city, address, distance, title, desc, cheapestPrice, type } =
    req.body;
  if (
    !name ||
    !city ||
    !address ||
    !distance ||
    !title ||
    !desc ||
    !cheapestPrice ||
    !type
  ) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  const hotels = await Hotel.create({
    name,
    city,
    address,
    distance,
    title,
    desc,
    cheapestPrice,
    type,
  });

  res.status(200).json(hotels);
});

const updateHotel = asyncHandler(async (req, res) => {
  const updatedHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.status(200).json(updatedHotel);
});

const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    res.status(404);
    throw new Error("Hotel Not Found");
  }

  await hotel.deleteOne();
  res
    .status(200)
    .json({ status: "success", message: "Hotel information deleted." });
});
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }
  res.status(200).json(hotel);
});

// const getAllHotels = asyncHandler(async (req, res) => {
//   const { min, max, ...others } = req.query;
//   const hotels = await Hotel.find({
//     ...others,
//     cheapestPrice: { $gte: min || 1, $lte: max || 999 },
//   }).sort("-createdAt");
//   res.status(200).json(hotels);
// });

const getAllHotels = asyncHandler(async (req, res) => {
  const { min, max, ...others } = req.query;
  const regexOptions = { $options: "i" }; // "i" stands for case-insensitive

  // Update the query to include case-insensitive matching for all string fields
  const hotels = await Hotel.find({
    ...others,
    cheapestPrice: { $gte: min || 1, $lte: max || 999 },
    ...Object.entries(others).reduce((acc, [key, value]) => {
      // Apply regex condition for case-insensitive matching on string fields
      if (typeof value === "string") {
        acc[key] = { $regex: new RegExp(value), ...regexOptions };
      } else {
        acc[key] = value; // Keep non-string fields unchanged
      }
      return acc;
    }, {}),
  }).sort("-createdAt");

  res.status(200).json(hotels);
});

const countbyCity = asyncHandler(async (req, res) => {
  const cities = req.query.cities.split(",");

  const list = await Promise.all(
    cities.map((item) => {
      return Hotel.countDocuments({ city: item });
    })
  );

  res.status(200).json(list);
});

const getHotelRooms = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  const list = await Promise.all(
    hotel.rooms.map((room) => {
      return Room.findById(room);
    })
  );
  res.status(200).json(list);
});
module.exports = {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getAllHotels,
  countbyCity,
  getHotelRooms,
};
