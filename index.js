const express = require("express");
const ConnectDB = require("./config/ConnectDB");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

// important routes
const userRoute = require("./routes/userRoute");
const authRoutes = require("./routes/authRoute");

const errorhandler = require("./middleware/errorhandler");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware Routes
app.use("/api/v1/users", userRoute);
app.use("/api/auth", authRoutes);
app.use(errorhandler); 
//Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Home Page ",
  });
});

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
