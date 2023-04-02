const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const cors = require("cors");
const dotenv = require("dotenv");

const User = require("./models/user.model");
const userRoles = require("./utils/enum");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

// Load env vars
dotenv.config();

// Call Imported function to connect to the database
connectDB();

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

app.put("/updateUserRole", async (req, res) => {
  try {
    const { user } = req.cookies ?? {};

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { role } = user ?? {};

    if (!role || role !== userRoles.SUPER_ADMIN) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId: targetUserId, role: targetUserNewRole } = req.body ?? {};

    if (!targetUserId || !targetUserNewRole) {
      return res.status(400).json({
        success: false,
        message: "Bad request: userId and role are required",
      });
    }

    const targetUserExists = await User.exists({ _id: targetUserId });

    if (!targetUserExists) {
      return res.status(404).json({
        success: false,
        message: "Not found: user not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      {
        role: targetUserNewRole,
      },
      {
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);

    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Bad request: username and password are required",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userCookie = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.cookie("user", userCookie, { httpOnly: true });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error(error);

    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Bad request: username and password are required",
      });
    }

    const user = await User.create({
      username,
      password,
      role: role ?? userRoles.USER,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);

    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
