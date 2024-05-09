const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Booked", "Canceled"],
      required: true,
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
