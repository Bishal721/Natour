const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");

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
    const { _id, name, email, phone } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
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
    const { _id, name, email, phone } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
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
    const { _id, name, email, phone } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
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
    const { name, email, phone } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;

    const updatedUser = await user.save();
    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
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

  // CReate reset url

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  console.log(resetToken);

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
    console.log(error);
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
};
