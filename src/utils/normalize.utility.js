function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function normalizeUsername(username) {
  return username.trim();
}

module.exports = {
  normalizeEmail,
  normalizeUsername,
};
