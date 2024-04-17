const asyncHandler = require("express-async-handler");
const Hotel = require("../models/hotelModel");

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

const getAllHotels = asyncHandler(async (req, res) => {
  // const { min, max, ...others } = req.query;
  const hotels = await Hotel.find().sort("-createdAt");
  res.status(200).json(hotels);
});

const countbyCity = asyncHandler(async (req, res) => {
  const cities = req.query.cities.split(",");
  console.log(cities);

  const list = await Promise.all(
    cities.map((item) => {
      console.log(item);
      return Hotel.countDocuments({ city: item });
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
};
