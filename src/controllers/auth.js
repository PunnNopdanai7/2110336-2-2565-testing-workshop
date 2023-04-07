const User = require("../models/user.model");
const userRoles = require("../utils/enum");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Bad request: username and password are required",
      });
    }

    const user = await User.findOne({ username });

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
    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
};

exports.register = async (req, res) => {
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
    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
};
