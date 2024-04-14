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
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "A Tour must have a difficulty"],
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    description: {
      type: String,
      required: [true, "Tour Must have a description"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", PackageSchema);

module.exports = {
  Package,
};
