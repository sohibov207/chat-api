function validateRegister(body) {
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return {
      valid: false,
      message: "Username, email and password are required",
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
