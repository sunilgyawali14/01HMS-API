//auth.controller.js
import { registerService, loginService } from "./auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const { user, token } = await registerService(name, email, password, role);
    return res.status(201).json({
      message: "User registered successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// login to the user
export const loginUser = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await loginService(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "login successfully",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
