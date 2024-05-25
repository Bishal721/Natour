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
    Bookedfor: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Booked", "Canceled"],
      required: true,
    },
    bookAt: {
      type: Date,
      required: true,
    },
    specificDateId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomSchema = mongoose.Schema(
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
    duration: {
      type: Number,
      required: [true, "Must have a duration"],
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
    Bookedfor: [
      {
        type: Date,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Booked", "Canceled", "Pending"],
      default: "Pending",
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
const CustomBooking = mongoose.model("CustomBooking", CustomSchema);
module.exports = { Booking, CustomBooking };
