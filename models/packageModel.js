const mongoose = require("mongoose");

const PackageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name "],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add an Location"],
    },
    price: {
      type: String,
      required: [true, "Please add a price"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
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
