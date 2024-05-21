const mongoose = require("mongoose");

const RecurringDateSchema = mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  occupiedSpace: {
    type: Number,
    default: 0,
    min: 0,
    required: true,
    validate: {
      validator: function (val) {
        // Access maxGroupSize from the parent document
        return val <= this.parent().maxGroupSize;
      },
      message: "Occupied Space should not be greater than maxGroupSize",
    },
  },
});

const PackageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must have a Name "],
      unique: true,
    },
    duration: {
      type: Number,
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
    recurringDates: [RecurringDateSchema], // Array of recurring dates
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
