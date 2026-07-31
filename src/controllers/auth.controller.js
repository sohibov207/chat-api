const authService = require("../services/auth.service");
const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

const register = async (req, res) => {
  const validation = validateRegister(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  try {
    const result = await authService.register(req.body);

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(400).json({
        message: "Email is already in use",
      });
    }

    if (error.message === "USERNAME_TAKEN") {
      return res.status(400).json({
        message: "Username is already taken",
      });
    }

    console.log("Register_error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  const validation = validateLogin(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  try {
    const result = await authService.login(req.body);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    console.log("Login_error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const deleteUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const result = await authService.deleteUser(userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  register,
  login,
  deleteUser,
};
