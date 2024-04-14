const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Package",
    },
    username: {
      type: String,
      required: [true, "Please Enter your  name"],
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = { Reviews };
