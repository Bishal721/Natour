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
} = require("../controller/userController");
const { Protected } = require("../middleware/authMiddleware");

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

module.exports = router;
