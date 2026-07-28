const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const express = require("express");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.delete("/delete/me", authMiddleware, authController.deleteUser);

module.exports = router;
