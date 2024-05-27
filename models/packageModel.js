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
        // Only validate occupiedSpace if it is being modified
        if (this.isModified("occupiedSpace")) {
          // Access maxGroupSize from the parent document
          return val <= this.parent().maxGroupSize;
        }
        // If occupiedSpace is not being modified, validation passes
        return true;
      },
      message: "Occupied Space should not be greater than maxGroupSize",
    },
  },
  extraPeople: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  status: {
    type: String,
    enum: ["full", "partial"],
    required: true,
    default: "partial",
  },
});

const PackageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must have a Name"],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "A Tour Must have a duration"],
    },
    location: {
      type: String,
      required: [true, "A Tour Must have a Location"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Group must have a group size"],
      default: 2,
      min: 2,
    },
    minGroupSize: {
      type: Number,
      required: [true, "A Group must have a minimum group size"],
      default: 1,
      min: 1,
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
// Exporting the max value directly
const maxExtraPeople = RecurringDateSchema.path("extraPeople").options.max;
const Package = mongoose.model("Package", PackageSchema);

module.exports = {
  Package,
  maxExtraPeople,
};
