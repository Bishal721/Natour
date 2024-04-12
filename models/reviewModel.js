const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    packageId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: [true, "Please add User name"],
    },
    review: {
      type: String,
    },
    rating: {
      type: Number,
      max: 5,
    },
  },
  { timestamps: true }
);

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = { Reviews };
