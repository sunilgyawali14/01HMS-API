import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model.js";
import Post from "../post/post.model.js";

const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
const jwtExpiry = "1h";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Post,
          as: "posts",
        },
      ],
    });

    return res.status(200).json({
      message: "Users fetched successfully.",
      users,
      data: { users },
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};
const createUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    if (!email || !password || !roles) {
      return res.status(400).json({
        message: "Email, password, and roles are required.",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      age,
    });

    return res.status(201).json({
      message: "User created successfully.",
      data: { user },
    });
  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      message: "Failed to create user.",
      error: error.message,
    });
  }
};
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Post,
          as: "posts",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully.",
      user,
      data: { user },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      message: "Unable to fetch user.",
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, password } = req.body;

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "age", "password"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const updateData = { name, email, age };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(id);

    return res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      message: "Unable to update user.",
      error: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await User.destroy({
      where: { id },
    });

    if (!deletedRows) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    return res.status(200).json({
      message: "User deleted successfully.",
      data: { id },
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      message: "Unable to delete user.",
      error: error.message,
    });
  }
};
export {
  //   registerUser,
  //   loginUser,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
