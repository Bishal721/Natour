const express = require("express");
const ConnectDB = require("./config/ConnectDB");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
require("dotenv").config();
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");

// important routes
const userRoute = require("./routes/userRoute");
const authRoutes = require("./routes/authRoute");
const packageRoute = require("./routes/packageRoute");
const hotelRoute = require("./routes/hotelRoute");
const roomRoute = require("./routes/roomRoutes");
const errorhandler = require("./middleware/errorhandler");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware Routes
app.use("/api/v1/users", userRoute);
app.use("/api/auth", authRoutes);
app.use("/api/v1/package", packageRoute);
app.use("/api/v1/hotels", hotelRoute);
app.use("/api/v1/rooms", roomRoute);
//Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Home Page ",
  });
});
app.use(errorhandler);

const StartServer = async () => {
  try {
    await ConnectDB();
    app.listen(port, () => {
      console.log(`Server Running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

StartServer();
