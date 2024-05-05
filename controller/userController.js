const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const Otp = require("../models/otpModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");
const generateOTP = require("../utils/generateOTP");

const generatetoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email Has already been registered");
  }
  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generatetoken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // expires in 1 day
    secure: true,
    sameSite: "none",
  });
  if (user) {
    const {
      _id,
      name,
      email,
      phone,
      bio,
      isVerified,
      image,
      city,
      address,
      country,
      role,
    } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      isVerified,
      bio,
      image,
      city,
      address,
      country,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Error in creating a user");
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found. Please Register first");
  }
  const CorrectPassword = await bycrypt.compare(password, user.password);

  const token = generatetoken(user._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // expires in 1 day
    secure: true,
    sameSite: "none",
  });
  if (user && CorrectPassword) {
    const {
      _id,
      name,
      email,
      phone,
      bio,
      isVerified,
      image,
      city,
      address,
      country,
      role,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      isVerified,
      bio,
      image,
      city,
      address,
      country,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // current second
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged  Out" });
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    return res.json(true);
  } else {
    return res.json(false);
  }
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const {
      _id,
      name,
      email,
      bio,
      phone,
      isVerified,
      image,
      city,
      address,
      country,
      role,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      isVerified,
      city,
      address,
      country,
      image,
      role,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// update user profile
const userUpdate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, phone, bio, city, address, role, country, image } =
      user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.city = req.body.city || city;
    user.address = req.body.address || address;
    user.country = req.body.country || country;
    user.image = req.body.image || image;
    const updatedUser = await user.save();
    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      city: updatedUser.city,
      address: updatedUser.address,
      country: updatedUser.country,
      role: updatedUser.role,
      image: updatedUser.image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// password Update
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { password, oldpassword } = req.body;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!oldpassword || !password) {
    res.status(400);
    throw new Error("Please provide old password and new password");
  }

  const correctPassword = await bycrypt.compare(oldpassword, user.password);

  if (user && correctPassword) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Does Not Exist");
  }

  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  // Create reset url

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // Hash before saving in DB

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 20 * (60 * 1000),
  }).save();

  // Create a reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email

  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Please use the url below to reset your password.</p>
  <p>This URL is only valid for only 5 Minutes.</p>
  <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
  <p> Regards. </p>
  `;

  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(sent_from, send_to, subject, message);
    res.status(200).json({
      success: true,
      message: "Reset URL Sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Email not Sent, Please try Again");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token and find it in the Database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Inavlid or Expired Token");
  }

  const user = await User.findOne({ _id: userToken.userId });

  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login with new Password",
  });
});

const google = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = generatetoken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // expires in 1 day
      secure: true,
      sameSite: "none",
    });
    const {
      _id,
      name,
      email,
      phone,
      bio,
      image,
      city,
      address,
      role,
      country,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      token,
      bio,
      image,
      city,
      address,
      role,
      country,
    });
  } else {
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const newUser = new User({
      name:
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-8),
      email: req.body.email,
      password: generatedPassword,
      image: req.body.photo,
    });
    await newUser.save();
    const token = generatetoken(newUser._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // expires in 1 day
      secure: true,
      sameSite: "none",
    });
    const {
      _id,
      name,
      email,
      phone,
      bio,
      image,
      city,
      address,
      role,
      country,
    } = newUser;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      token,
      bio,
      city,
      address,
      role,
      country,
      image,
    });
  }
});

const generateEmailOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(400);
    throw new Error("User not found. Please Register first");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }
  let Emailotp = await Otp.findOne({ userId: user._id });
  if (Emailotp) {
    await Otp.deleteOne();
  }
  const otp = generateOTP();
  console.log(otp);

  await new Otp({
    userId: user._id,
    otp,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * (60 * 1000),
  }).save();

  const message = `
  <h2>Hello User</h2>
  <p>Please use this otp below to create your account .</p>
  <p>This otp is only valid for only 5 Minutes.</p>
  ${otp}
  <p> Regards. </p>
  `;

  const subject = "Account Create OTP";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(sent_from, send_to, subject, message);
    res.status(200).json({
      success: true,
      message: "Verification Email Sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Email not Sent, Please try Again");
  }
});

const otpCompare = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id);
  if (!otp) {
    res.status(400);
    throw new Error("Please Fill all required fields");
  }
  const UserOtp = await Otp.findOne({
    userId: user._id,
    otp,
    expiresAt: { $gt: Date.now() },
  });
  if (!UserOtp) {
    res.status(404);
    throw new Error("Invalid Otp or expired");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "Account Verification Successful" });
});

// Get Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");
  if (!users) {
    res.status(500);
    throw new Error("Something went wrong");
  }
  res.status(200).json(users);
});

const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    message: `User role updated to ${role}`,
  });
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.status(200).json({
    message: "User deleted successfully",
  });
});

module.exports = {
  registerUser,
  loginUser,
  loginStatus,
  logoutUser,
  getUser,
  userUpdate,
  changePassword,
  forgetPassword,
  resetPassword,
  google,
  generateEmailOtp,
  otpCompare,
  getAllUsers,
  upgradeUser,
  deleteUser,
};
