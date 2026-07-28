const db = require("../models");
const bcrypt = require("bcryptjs");
const {
  normalizeEmail,
  normalizeUsername,
} = require("../utils/normalize.utility.js");
const { generateToken } = require("../utils/jwt.utility");

async function register(data) {
  const normalizedEmail = normalizeEmail(data.email);
  const trimmedUsername = normalizeUsername(data.username);

  const existingUser = await db.User.findOne({
    where: {
      [db.Sequelize.Op.or]: [
        { email: normalizedEmail },
        { username: trimmedUsername },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new Error("EMAIL_EXISTS");
    }
    if (existingUser.username === trimmedUsername) {
      throw new Error("USERNAME_TAKEN");
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await db.User.create({
    username: trimmedUsername,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
}

async function login(data) {
  const normalizedEmail = normalizeEmail(data.email);

  const user = await db.User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
}

async function deleteUser(userId) {
  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await user.destroy();

  return {
    message: "User deleted successfully",
  };
}

module.exports = {
  register,
  login,
  deleteUser,
};
