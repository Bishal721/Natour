const express = require("express");

const router = express.Router();

const { google } = require("../controller/userController");

router.post("/google", google);

module.exports = router;
