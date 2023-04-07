const User = require("../models/user.model");
const userRoles = require("../utils/enum");

exports.updateUserRole = async (req, res) => {
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
    const { message } = error ?? {};
    res.status(500).json({
      success: false,
      message: message ?? "Internal server error",
    });
  }
};
