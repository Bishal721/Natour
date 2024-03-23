const { Package } = require("../models/packageModel");
const asyncHandler = require("express-async-handler");

const createPackage = asyncHandler(async (req, res) => {
  const { name, location, price, summary, duration, difficulty, maxGroupSize } =
    req.body;

  // Validation
  if (
    !name ||
    !location ||
    !price ||
    !summary ||
    !duration ||
    !difficulty ||
    !maxGroupSize
  ) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  //   // handle file upload
  //   let fileData = {};
  //   if (req.file) {
  //     // save in cloudinary
  //     let uploadImage;
  //     try {
  //       uploadImage = await cloudinary.uploader.upload(req.file.path, {
  //         folder: "Inventory Management",
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

  // Create products
  try {
    const package = await Package.create({
      name,
      location,
      price,
      summary,
      duration,
      difficulty,
      maxGroupSize,
    });

    res.status(201).json(package);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
});

// get all products
const getallPackage = asyncHandler(async (req, res) => {
  const packages = await Package.find({}).sort("-createdAt");
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
    summary,
    duration,
    difficulty,
    maxGroupSize,
    description,
  } = req.body;
  const { id } = req.params;
  const package = await Package.findById(id);

  if (!package) {
    res.status(404);
    throw new Error("Package not found");
  }

  // // handle file upload
  // let fileData = {};
  // if (req.file) {
  //   // save in cloudinary
  //   let uploadImage;
  //   try {
  //     uploadImage = await cloudinary.uploader.upload(req.file.path, {
  //       folder: "Inventory Management",
  //       resource_type: "image",
  //     });
  //   } catch (error) {
  //     res.status(500);
  //     throw new Error("Image could not be uploaded");
  //   }

  //   fileData = {
  //     fileName: req.file.originalname,
  //     filePath: uploadImage.secure_url,
  //     fileType: req.file.mimetype,
  //     fileSize: fileSizeFormatter(req.file.size, 2),
  //   };
  // }

  // update products
  const updatedPackage = await Package.findByIdAndUpdate(
    { _id: id },
    {
      name,
      location,
      price,
      summary,
      duration,
      difficulty,
      maxGroupSize,
      description,
      // image: Object.keys(fileData).length === 0 ? Package.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(202).json(updatedPackage);
});

module.exports = {
  createPackage,
  getallPackage,
  getSinglePackage,
  deletePackage,
  updatePackage,
};
