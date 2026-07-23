const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedUsername = username.trim();

  try {
    const existingUser = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email: normalizedEmail },
          { username: trimmedUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (existingUser.username === trimmedUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.User.create({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Username or email is already in use" });
    }

    console.error('Register error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await db.User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  deleteUser,
};