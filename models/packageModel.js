const mongoose = require("mongoose");

const PackageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must have a Name "],
      unique: true,
    },
    duration: {
      type: String,
      required: [true, "A Tour Must have a duration "],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    location: {
      type: String,
      required: [true, "A Tour Must have a Location"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Group must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A Group must have a difficulty"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    description: {
      type: String,
      // required: [true, "Please add a description"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "A Tour Must have a Summary"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", PackageSchema);

module.exports = {
  Package,
};
