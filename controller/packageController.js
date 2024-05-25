const asyncHandler = require("express-async-handler");
const { Package, maxExtraPeople } = require("../models/packageModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const { Reviews } = require("../models/reviewModel");
const { Booking, CustomBooking } = require("../models/BookingModel");
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
  const {
    guests,
    date,
    packageId,
    price,
    Bookfor,
    dateId,
    extraPeople,
    specificDateId,
  } = req.body;
  const userid = req.user.id;

  if (
    (!guests && guests !== 0) ||
    !date ||
    !packageId ||
    !userid ||
    !price ||
    !Bookfor ||
    !dateId ||
    !specificDateId
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
    specificDateId,
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

const getSingleBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.find({ userId: req.user._id })
    .sort("-createdAt")
    .populate("userId")
    .populate("packageId");
  res.status(200).json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const cancelbooking = await Booking.findById(req.params.id).populate(
    "packageId"
  );

  if (!cancelbooking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const { guests, specificDateId } = cancelbooking;
  const recurringDate = cancelbooking.packageId.recurringDates.find(
    (date) => date._id.toString() === specificDateId
  );

  if (!recurringDate) {
    res.status(404);
    throw new Error("Recurring date not found");
  }

  let remainingGuests = guests;

  // Reduce guests from extraPeople first
  if (recurringDate.extraPeople >= remainingGuests) {
    recurringDate.extraPeople -= remainingGuests;
    remainingGuests = 0;
  } else {
    remainingGuests -= recurringDate.extraPeople;
    recurringDate.extraPeople = 0;
  }

  // If extraPeople is not enough, reduce the remaining guests from occupiedSpace
  if (remainingGuests > 0) {
    if (recurringDate.occupiedSpace >= remainingGuests) {
      recurringDate.occupiedSpace -= remainingGuests;
    } else {
      // This should generally not happen if your data is consistent, but handle it gracefully
      return res.status(400).json({
        message: "Not enough space to cancel the booking properly",
      });
    }
  }

  // Save the changes
  await cancelbooking.packageId.save();
  // Optionally, update the booking status to canceled
  cancelbooking.status = "Canceled";
  await cancelbooking.save();

  res.status(200).json({
    message: "Booking canceled successfully",
  });
});

const createCustomBooking = asyncHandler(async (req, res) => {
  const { guests, date, packageId, price, Bookfor, duration } = req.body;
  const userid = req.user.id;
  console.log(guests, date, packageId, price, Bookfor, duration);
  if (
    !guests ||
    !date ||
    !packageId ||
    !userid ||
    !price ||
    !Bookfor ||
    !duration
  ) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  const booking = await CustomBooking.create({
    guests: guests,
    bookAt: date,
    packageId,
    userId: userid,
    price,
    duration,
    status: "Booked",
    Bookedfor: Bookfor.startDate,
  });
  if (!booking) {
    res.status(400);
    throw new Error("Error Updating the booking");
  }
  console.log(booking);
  res.status(201).json(booking);
});

const getAllCustomBookings = asyncHandler(async (req, res) => {
  const booking = await CustomBooking.find()
    .sort("-createdAt")
    .populate("userId")
    .populate({
      path: "packageId",
      select: "-recurringDates",
    });
  res.status(200).json(booking);
});

const getSingleCustomBooking = asyncHandler(async (req, res) => {
  const booking = await CustomBooking.find({ userId: req.user._id })
    .sort("-createdAt")
    .populate("userId")
    .populate({
      path: "packageId",
      select: "-recurringDates",
    });
  res.status(200).json(booking);
});

const cancelCustomBooking = asyncHandler(async (req, res) => {
  const cancelbooking = await CustomBooking.findById(req.params.id).populate({
    path: "packageId",
    select: "-recurringDates, -reviews",
  });
  console.log(cancelbooking);
  if (!cancelbooking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (cancelbooking.status === "Canceled") {
    res.status(404);
    throw new Error("Package Already canceled");
  }
  cancelbooking.status = "Canceled";
  await cancelbooking.save();

  res.status(200).json({
    message: "Custom Booking canceled successfully",
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
  getSingleBooking,
  createCustomBooking,
  getAllCustomBookings,
  getSingleCustomBooking,
  cancelCustomBooking,
};
