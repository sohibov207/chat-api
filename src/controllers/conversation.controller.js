const conversationService = require("../services/conversation.service");

async function createDirectConversation(req, res) {
  try {
    const { targetUserId } = req.body;

    const conversation = await conversationService.createDirectConversation(
      targetUserId,
      req.user.id,
    );

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getConversationById(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationById(
      req.params.conversationId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

async function getUserConversations(req, res) {
  try {
    const conversations = await conversationService.getUserConversations(
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createDirectConversation,
  getConversationById,
  getUserConversations,
};
