const asyncHandler = require("express-async-handler");
const { Package, maxExtraPeople } = require("../models/packageModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const { Reviews } = require("../models/reviewModel");
const Booking = require("../models/BookingModel");
const { response } = require("express");
const cloudinary = require("cloudinary").v2;

const createPackage = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    price,
    description,
    difficulty,
    maxGroupSize,
    duration,
    minGroupSize,
    recurringDates, // Add recurring dates to request body
  } = req.body;
  const parsedRecurringDates = JSON.parse(recurringDates);
  // Validation
  if (
    !name ||
    !location ||
    !price ||
    !description ||
    !difficulty ||
    !duration ||
    !maxGroupSize ||
    !minGroupSize ||
    !recurringDates || // Check if recurringDates are provided
    recurringDates.length === 0 // Check if recurringDates array is not empty
  ) {
    res.status(400);
    throw new Error(
      "Please provide all required fields including recurringDates"
    );
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

  try {
    const package = await Package.create({
      name,
      location,
      price,
      description,
      difficulty,
      maxGroupSize,
      minGroupSize,
      duration,
      image: fileData,
      recurringDates: parsedRecurringDates, // Include recurring dates in the creation
    });
    res.status(201).json(package);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
});

// get all products
const getallPackage = asyncHandler(async (req, res) => {
  const packages = await Package.find({})
    .sort("-createdAt")
    .populate("reviews");

  res.status(200).json(packages);
});

// get single Package
const getSinglePackage = asyncHandler(async (req, res) => {
  const packages = await Package.findById(req.params.id).populate("reviews");
  if (!packages) {
    res.status(404);
    throw new Error("Package not found");
  }
  res.status(200).json(packages);
});

const getExtraPeople = asyncHandler(async (req, res) => {
  res.status(200).json(maxExtraPeople);
});

//  Delete a Package
const deletePackage = asyncHandler(async (req, res) => {
  const package = await Package.findById(req.params.id);
  if (!package) {
    res.status(404);
    throw new Error("Package not found");
  }

  await package.deleteOne();
  res.status(200).json({ message: "Package deleted." });
});

// const updatePackage = asyncHandler(async (req, res) => {
//   const {
//     name,
//     location,
//     price,
//     description,
//     duration,
//     difficulty,
//     maxGroupSize,
//     minGroupSize,
//     recurringDates, // Add recurring dates to request body
//   } = req.body;
//   console.log(recurringDates);
//   const parsedRecurringDates = JSON.parse(recurringDates);
//   const { id } = req.params;
//   const package = await Package.findById(id);
//   if (!package) {
//     res.status(404);
//     throw new Error("Package not found");
//   }
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
//   // update products
//   const updatedPackage = await Package.findByIdAndUpdate(
//     { _id: id },
//     {
//       name,
//       location,
//       price,
//       description,
//       duration,
//       difficulty,
//       maxGroupSize,
//       minGroupSize,
//       image: Object.keys(fileData).length === 0 ? Package.image : fileData,
//       recurringDates: parsedRecurringDates, // Include recurring dates in the creation
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res.status(202).json(updatedPackage);
// });

const updatePackage = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    price,
    description,
    duration,
    difficulty,
    maxGroupSize,
    minGroupSize,
    recurringDates, // Add recurring dates to request body
  } = req.body;
  const parsedRecurringDates = JSON.parse(recurringDates);
  const { id } = req.params;
  const package = await Package.findById(id);
  if (!package) {
    res.status(404);
    throw new Error("Package not found");
  }

  // Handle file upload
  let fileData = {};
  if (req.file) {
    // Save in cloudinary
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

  // Filter out recurringDates and only include fields other than occupiedSpace and extraPeople
  const updatedRecurringDates = parsedRecurringDates.map((date) => {
    const { occupiedSpace, extraPeople, ...rest } = date;
    return rest;
  });
  // Update package excluding occupiedSpace and extraPeople in recurringDates
  const updatedPackage = await Package.findByIdAndUpdate(
    id,
    {
      name,
      location,
      price,
      description,
      duration,
      difficulty,
      maxGroupSize,
      minGroupSize,
      image: Object.keys(fileData).length === 0 ? package.image : fileData,
      recurringDates: updatedRecurringDates,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(202).json(updatedPackage);
});

const getFiveData = asyncHandler(async (req, res) => {
  const packages = await Package.find({}).sort("-createdAt").limit(5);
  res.status(200).json(packages);
});

const createReview = asyncHandler(async (req, res) => {
  const username = req.user.name;
  const { review, rating, packageId } = req.body;
  if (!username || !packageId || !review || !rating) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  try {
    const reviews = await Reviews.create({
      username,
      packageId,
      review,
      rating,
    });
    await Package.findByIdAndUpdate(packageId, {
      $push: { reviews: reviews._id },
    });

    res.status(201).json(reviews);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
});

const createBooking = asyncHandler(async (req, res) => {
  const { guests, date, packageId, price, Bookfor, dateId, extraPeople } =
    req.body;
  const userid = req.user.id;

  if (
    (!guests && guests !== 0) ||
    !date ||
    !packageId ||
    !userid ||
    !price ||
    !Bookfor ||
    !dateId
  ) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Ensure at least one of guests or extraPeople is greater than 0
  if (guests <= 0 && (!extraPeople || extraPeople <= 0)) {
    res.status(400);
    throw new Error(
      "At least one of guests or extraPeople must be greater than 0"
    );
  }

  // Combine guests and extraPeople
  const totalGuests = Number(guests) + Number(extraPeople);
  const package = await Package.findById(packageId);

  const data = package.recurringDates.find(
    (rec) => rec._id.toString() === dateId
  );

  if (!data) {
    res.status(404);
    throw new Error("Date not found in package");
  }

  const updateSpace = data.occupiedSpace + Number(guests);
  const extraPeopleadd = data.extraPeople + Number(extraPeople);

  if (extraPeopleadd > maxExtraPeople) {
    res.status(404);
    throw new Error("Booking has exceeded the max group size");
  }

  data.occupiedSpace = updateSpace;
  data.extraPeople = extraPeopleadd;
  // data.extraPeople =
  if (
    data.occupiedSpace >= package.maxGroupSize &&
    data.extraPeople >= maxExtraPeople
  ) {
    data.status = "full";
  }
  // Save the modified package
  const pack = await package.save();

  // const pack = await Package.findByIdAndUpdate(
  //   packageId,
  //   { $set: { occupiedSpace: updateSpace } },
  //   { new: true }
  // );
  if (!pack) {
    res.status(400);
    throw new Error("Error Updating the package");
  }
  const booking = await Booking.create({
    guests: totalGuests,
    bookAt: date,
    packageId,
    userId: userid,
    price,
    status: "Booked",
    Bookedfor: Bookfor,
  });

  if (!booking) {
    res.status(400);
    throw new Error("Error Updating the booking");
  }

  res.status(201).json(booking);
});

const getTourBySearch = asyncHandler(async (req, res) => {
  const location = new RegExp(req.query.location, "i");

  const package = await Package.find({ location });

  res.status(200).json({
    success: true,
    message: "Successful",
    count: package.length,
    data: package,
  });
});

const getAllBookings = asyncHandler(async (req, res) => {
  const booking = await Booking.find()
    .sort("-createdAt")
    .populate("userId")
    .populate("packageId");
  res.status(200).json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const cancelbooking = await Booking.findById(req.params.id);

  if (!cancelbooking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  cancelbooking.status = "Canceled";
  await cancelbooking.save();

  res.status(200).json({
    message: "Booking Canceled successfully",
  });
});

module.exports = {
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
};
