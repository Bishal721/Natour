const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    phone: {
      type: Number,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Package",
    },
    bookAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
