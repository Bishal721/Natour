const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add your password"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "+977",
      required: [true, "Please add your phone number"],
    },
    image: {
      type: String,
      required: [true, "please provide your Image"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      required: [true, "Please add your Bio"],
      default: "bio",
    },
    city: {
      type: String,
      required: [true, "Please add your city"],
      default: "Kalanki",
    },
    address: {
      type: String,
      required: [true, "Please add your address"],
      default: "Kathmandu",
    },
    country: {
      type: String,
      required: [true, "Please add your country"],
      default: "Nepal",
    },
    role: {
      type: String,
      enum: ["user", "admin", "suspended"],
      required: true,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // ENcrypt the password
  const salt = await bycrypt.genSalt(10);
  const hashedPassword = await bycrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
