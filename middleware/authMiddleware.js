const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const Protected = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401);
      throw new Error("Not Authorized, Please Login");
    }
    // verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // getting user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not Authorized, Please login");
  }
});

module.exports = { Protected };
