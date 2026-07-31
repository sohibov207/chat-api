const express = require("express");
const router = express.Router();

const conversationController = require("../controllers/conversation.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/direct",
  authMiddleware,
  conversationController.createDirectConversation,
);

router.get("/", authMiddleware, conversationController.getUserConversations);

router.get(
  "/:conversationId",
  authMiddleware,
  conversationController.getConversationById,
);

module.exports = router;
