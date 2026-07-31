const messageService = require("../services/message.service");

async function sendMessage(req, res) {
  try {
    const message = await messageService.sendMessage({
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      content: req.body.content,
      messageType: req.body.messageType,
      mediaUrl: req.body.mediaUrl,
      caption: req.body.caption,
      replyToMessageId: req.body.replyToMessageId,
      forwardedMessageId: req.body.forwardedMessageId,
      forwardedFromUserId: req.body.forwardedFromUserId,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMessages(req, res) {
  try {
    const messages = await messageService.getMessages(
      req.params.conversationId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function editMessage(req, res) {
  try {
    const message = await messageService.editMessage(
      req.params.messageId,
      req.user.id,
      req.body.content,
    );

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteMessage(req, res) {
  try {
    const message = await messageService.deleteMessage(
      req.params.messageId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function forwardMessage(req, res) {
  try {
    const message = await messageService.forwardMessage(
      req.body.messageId,
      req.body.targetConversationId,
      req.user.id,
    );

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function markAsRead(req, res) {
  try {
    const receipt = await messageService.markAsRead(
      req.params.messageId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function bulkRead(req, res) {
  try {
    const receipt = await messageService.bulkRead(req.user.id);

    return res.status(200).json({
      success: true,
      message: "All messages marked as read",
      data: receipt,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  forwardMessage,
  markAsRead,
  bulkRead,
};
