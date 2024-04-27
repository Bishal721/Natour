const asyncHandler = require("express-async-handler");
const { Package } = require("../models/packageModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const { Reviews } = require("../models/reviewModel");
const Booking = require("../models/BookingModel");
const cloudinary = require("cloudinary").v2;

const createPackage = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    price,
    description,
    duration,
    difficulty,
    maxGroupSize,
    startDate,
    endDate,
  } = req.body;
  // Validation
  if (
    !name ||
    !location ||
    !price ||
    !description ||
    !duration ||
    !difficulty ||
    !maxGroupSize ||
    !startDate ||
    !endDate
  ) {
    res.status(400);
    throw new Error("Please add all fields");
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

  // Create package
  try {
    const package = await Package.create({
      name,
      location,
      price,
      description,
      duration,
      difficulty,
      maxGroupSize,
      image: fileData,
      startDate,
      endDate,
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
  const packages = await Package.findById(req.params.id);
  if (!packages) {
    res.status(404);
    throw new Error("Package not found");
  }

  res.status(200).json(packages);
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
  } = req.body;
  const { id } = req.params;
  const package = await Package.findById(id);
  if (!package) {
    res.status(404);
    throw new Error("Package not found");
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
  // update products
  const updatedPackage = await Package.findByIdAndUpdate(
    { _id: id },
    {
      name,
      location,
      price,
      description,
      duration,
      difficulty,
      maxGroupSize,
      description,
      image: Object.keys(fileData).length === 0 ? Package.image : fileData,
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
  const { phone, guests, date, packageId } = req.body;
  console.log(req.body);
  const userid = req.user.id;
  console.log(userid);

  if (!phone || !guests || !date || !packageId || !userid) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  try {
    const booking = await Booking.create({
      phone,
      guests,
      bookAt: date,
      packageId,
      userId: userid,
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
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
};
