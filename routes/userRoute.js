const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginStatus,
  logoutUser,
  getUser,
  userUpdate,
  changePassword,
  forgetPassword,
  resetPassword,
  generateEmailOtp,
  otpCompare,
  getAllUsers,
  upgradeUser,
  deleteUser,
} = require("../controller/userController");
const { Protected, adminOnly } = require("../middleware/authMiddleware");

//Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/loggedin", loginStatus);
router.get("/logout", logoutUser);
router.get("/getuser", Protected, getUser);
router.patch("/updateuser", Protected, userUpdate);
router.patch("/changepassword", Protected, changePassword);
router.post("/forgotpassword", forgetPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.post("/otp", Protected, generateEmailOtp);
router.post("/compareotp", Protected, otpCompare);
router.get("/getAllUsers", Protected, adminOnly, getAllUsers);
router.post("/upgradeUser", Protected, adminOnly, upgradeUser);
router.delete("/:id", Protected, adminOnly, deleteUser);

module.exports = router;
