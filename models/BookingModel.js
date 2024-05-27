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

const HotelReserveSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Hotel",
  },
  roomId: [
    {
      type: String,
      required: true,
    },
  ],
  Bookedfor: [
    {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Reserved", "Available"],
    default: "Available",
    required: true,
  },
  bookAt: {
    type: Date,
    required: true,
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
const CustomBooking = mongoose.model("CustomBooking", CustomSchema);
const HOTELBOOKING = mongoose.model("ReserveHotel", HotelReserveSchema);
module.exports = { Booking, CustomBooking, HOTELBOOKING };
