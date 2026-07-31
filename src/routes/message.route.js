const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/conversation/:conversationId",
  authMiddleware,
  messageController.sendMessage,
);

router.get(
  "/conversation/:conversationId",
  authMiddleware,
  messageController.getMessages,
);

router.patch("/:messageId", authMiddleware, messageController.editMessage);

router.delete("/:messageId", authMiddleware, messageController.deleteMessage);

router.post("/forward", authMiddleware, messageController.forwardMessage);

router.post("/:messageId/read", authMiddleware, messageController.markAsRead);

router.post("/read-all", authMiddleware, messageController.bulkRead);

module.exports = router;
