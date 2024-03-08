const { Package } = require("../models/packageModel");
const asyncHandler = require("express-async-handler");

const createPackage = asyncHandler(async (req, res) => {
  const { name, location, price, description } = req.body;

  console.log(name, location, price, description);
  // Validation
  if (!name || !location || !price || !description) {
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
  const package = await Package.create({
    name,
    location,
    price,
    description,
  });

  res.status(201).json(package);
});

// get all products
const getallPackage = asyncHandler(async (req, res) => {
  const packages = await Package.find({}).sort("-createdAt");
  res.status(200).json(packages);
});

// get single product
const getSinglePackage = asyncHandler(async (req, res) => {
  const packages = await Package.findById(req.params.id);
  if (!packages) {
    res.status(404);
    throw new Error("Product not found");
  }

  // if (packages.user.toString() !== req.user.id) {
  //   res.status(401);
  //   throw new Error("user not authorized");
  // }
  res.status(200).json(packages);
});

//  Delete a product
const deletePackage = asyncHandler(async (req, res) => {
  const package = await Package.findById(req.params.id);
  if (!package) {
    res.status(404);
    throw new Error("Product not found");
  }

  //   if (product.user.toString() !== req.user.id) {
  //     res.status(401);
  //     throw new Error("user not authorized");
  //   }

  await package.deleteOne();
  res.status(200).json({ message: "Package deleted." });
});

module.exports = {
  createPackage,
  getallPackage,
  getSinglePackage,
  deletePackage,
};
