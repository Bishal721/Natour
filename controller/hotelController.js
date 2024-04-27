const asyncHandler = require("express-async-handler");
const Hotel = require("../models/hotelModel");
const Room = require("../models/roomModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

const createHotel = asyncHandler(async (req, res) => {
  const { name, city, address, distance, desc, cheapestPrice, rooms } =
    req.body;
  // console.log(req);
  if (
    !name ||
    !city ||
    !address ||
    !distance ||
    !desc ||
    !cheapestPrice ||
    !rooms
  ) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }
  // handle file upload
  let fileData = {};
  if (req.file) {
    // save in cloudinary
    let uploadImage;
    try {
      uploadImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "Natours",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadImage.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const hotels = await Hotel.create({
    name,
    city,
    address,
    distance,
    desc,
    cheapestPrice,
    rooms,
    photos: fileData,
  });

  res.status(200).json(hotels);
});

// const updateHotel = asyncHandler(async (req, res) => {
//   console.log(req.body);
//   console.log(req.params);

//   // handle file upload
//   let fileData = {};
//   if (req.file) {
//     // save in cloudinary
//     let uploadImage;
//     try {
//       uploadImage = await cloudinary.uploader.upload(req.file.path, {
//         folder: "Natours",
//         resource_type: "image",
//       });
//     } catch (error) {
//       res.status(500);
//       throw new Error("Image could not be uploaded");
//     }

//     fileData = {
//       fileName: req.file.originalname,
//       filePath: uploadImage.secure_url,
//       fileType: req.file.mimetype,
//       fileSize: fileSizeFormatter(req.file.size, 2),
//     };
//   }
//   const updatedHotel = await Hotel.findByIdAndUpdate(
//     req.params.id,
//     { $set: req.body },
//     {
//       photos: Object.keys(fileData).length === 0 ? Hotel.photos : fileData,
//     },
//     { new: true }
//   );
//   res.status(200).json(updatedHotel);
// });

const updateHotel = asyncHandler(async (req, res) => {
  // Fetch existing hotel data
  const existingHotel = await Hotel.findById(req.params.id);

  // handle file upload
  let fileData = {};
  if (req.file) {
    // save in cloudinary
    let uploadImage;
    try {
      uploadImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "Natours",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadImage.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Merge existing data with new data, preserving existing photo if no new photo is uploaded
  const updateData = {
    ...existingHotel.toObject(), // Convert Mongoose document to plain JavaScript object
    ...req.body,
    photos: fileData.filePath ? fileData : existingHotel.photos,
  };

  const updatedHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
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

  // Split the comma-separated string of room IDs into an array
  const roomIds = hotel.rooms[0].split(",");

  // Use Promise.all to fetch details of all rooms asynchronously
  const rooms = await Promise.all(
    roomIds.map(async (roomId) => {
      try {
        // Assuming Room is the model for rooms
        const room = await Room.findById(roomId.trim()); // Trim to remove any extra spaces
        return room;
      } catch (error) {
        // Handle error if room is not found
        return null; // Or you can throw an error
      }
    })
  );

  // Filter out any null values (rooms not found) from the array
  const validRooms = rooms.filter((room) => room !== null);
  res.status(200).json(validRooms);
});
// const getHotelRooms = asyncHandler(async (req, res) => {
//   const hotel = await Hotel.findById(req.params.id);
//   const list = await Promise.all(
//     hotel.rooms.map(async (room) => {
//       console.log(room);
//       return await Room.findById(room);
//     })
//   );
//   console.log(list);
//   res.status(200).json(list);
// });
module.exports = {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getAllHotels,
  countbyCity,
  getHotelRooms,
};
