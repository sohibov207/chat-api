function validateRegister(body) {
  const { name, username, email, password } = body;

  if (!name || !username || !email || !password) {
    return {
      valid: false,
      message: "Name, username, email and password are required",
    };
  }

  if (name.trim().length < 2) {
    return {
      valid: false,
      message: "Name must be at least 2 characters",
    };
  }

  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: "Invalid email format",
    };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/;

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      message:
        "Username must be 3-32 characters and contain only letters, numbers, _ and -",
    };
  }

  return { valid: true };
}

function validateLogin(body) {
  const { email, password } = body;
  if (!email || !password) {
    return { valid: false, message: "Email and password are required" };
  }

  return { valid: true };
}

module.exports = {
  validateRegister,
  validateLogin,
};
