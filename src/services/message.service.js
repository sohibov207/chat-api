const db = require("../models");

async function sendMessage({
  conversationId,
  senderId,
  content = null,
  messageType = "text",
  mediaUrl = null,
  caption = null,
  replyToMessageId = null,
}) {
  conversationId = Number(conversationId);
  senderId = Number(senderId);

  const allowedTypes = ["text", "image", "video", "file", "voice"];

  if (!allowedTypes.includes(messageType)) {
    throw new Error("Invalid message type");
  }

  const conversation = await db.Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const participant = await db.Participants.findOne({
    where: {
      conversationId,
      userId: senderId,
    },
  });

  if (!participant) {
    throw new Error("You are not a participant of this conversation");
  }

  if (messageType === "text" && !content?.trim()) {
    throw new Error("Text message content is required");
  }

  if (["image", "video", "file", "voice"].includes(messageType) && !mediaUrl) {
    throw new Error(`${messageType} messages require mediaUrl`);
  }

  if (content && content.length > 4000) {
    throw new Error("Message too long");
  }

  if (replyToMessageId) {
    const repliedMessage = await db.Message.findByPk(replyToMessageId);

    if (!repliedMessage) {
      throw new Error("Reply target not found");
    }

    if (repliedMessage.isDeleted) {
      throw new Error("Cannot reply to deleted message");
    }

    if (repliedMessage.conversationId !== conversationId) {
      throw new Error("Cannot reply across conversations");
    }
  }

  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const message = await db.Message.create(
      {
        conversationId,
        senderId,
        content,
        messageType,
        mediaUrl,
        caption,
        replyToMessageId,
      },
      { transaction },
    );

    conversation.lastMessageId = message.id;

    await conversation.save({ transaction });

    await transaction.commit();

    return message;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
  }
}

async function getMessages(conversationId, userId) {
  conversationId = Number(conversationId);
  userId = Number(userId);

  const conversation = await db.Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const participant = await db.Participants.findOne({
    where: {
      conversationId,
      userId,
    },
  });

  if (!participant) {
    throw new Error("You are not a participant of this conversation");
  }

  const messages = await db.Message.findAll({
    where: {
      conversationId,
    },
    include: [
      {
        model: db.User,
        as: "sender",
        attributes: ["id", "name", "username"],
      },
      {
        model: db.ReadReceipt,
        include: [
          {
            model: db.User,
            attributes: ["id", "username"],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  if (messages.length > 0) {
    participant.lastReadMessageId = messages[messages.length - 1].id;

    await participant.save();
  }

  return messages;
}

async function editMessage(messageId, userId, content) {
  const message = await db.Message.findByPk(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.isDeleted) {
    throw new Error("Cannot edit deleted message");
  }

  if (message.senderId !== userId) {
    throw new Error("You can only edit your own messages");
  }

  if (!content?.trim()) {
    throw new Error("Message content is required");
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  return message;
}

async function deleteMessage(messageId, userId) {
  const message = await db.Message.findByPk(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.isDeleted) {
    throw new Error("Message has already been deleted");
  }

  if (message.senderId !== userId) {
    throw new Error("You can only delete your own messages");
  }

  message.isDeleted = true;
  message.content = "Deleted message";
  message.caption = null;
  message.mediaUrl = null;
  message.deletedAt = new Date();

  await message.save();

  return message;
}

async function forwardMessage(messageId, targetConversationId, senderId) {
  targetConversation = Number(conversationId);
  senderId = Number(senderId);
  const originalMessage = await db.Message.findByPk(messageId);

  if (!originalMessage) {
    throw new Error("Message not found");
  }

  const targetConversation =
    await db.Conversation.findByPk(targetConversationId);

  if (!targetConversation) {
    throw new Error("Target conversation not found");
  }

  const participant = await db.Participants.findOne({
    where: {
      conversationId: targetConversationId,
      userId: senderId,
    },
  });

  if (!participant) {
    throw new Error("You are not a participant of this conversation");
  }

  const sourceParticipant = await db.Participants.findOne({
    where: {
      conversationId: originalMessage.conversationId,
      userId: senderId,
    },
  });

  if (!sourceParticipant) {
    throw new Error("You do not have access to the original message");
  }

  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const forwardedMessage = await db.Message.create(
      {
        conversationId: targetConversationId,
        senderId,

        content: originalMessage.content,
        messageType: originalMessage.messageType,
        mediaUrl: originalMessage.mediaUrl,
        caption: originalMessage.caption,

        forwardedMessageId: originalMessage.id,
        forwardedFromId: originalMessage.senderId,
      },
      { transaction },
    );

    targetConversation.lastMessageId = forwardedMessage.id;

    await targetConversation.save({ transaction });

    await transaction.commit();

    return forwardedMessage;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
  }
}

async function markAsRead(messageId, userId) {
  messageId = Number(messageId);
  userId = Number(userId);

  const message = await db.Message.findByPk(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  const participant = await db.Participants.findOne({
    where: {
      conversationId: message.conversationId,
      userId,
    },
  });

  if (!participant) {
    throw new Error("You are not a participant of this conversation");
  }

  const existingReceipt = await db.ReadReceipt.findOne({
    where: {
      messageId,
      userId,
    },
  });

  if (existingReceipt) {
    return existingReceipt;
  }

  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const receipt = await db.ReadReceipt.create(
      {
        messageId,
        userId,
        readAt: new Date(),
      },
      { transaction },
    );

    participant.lastReadMessageId = message.id;

    await participant.save({ transaction });

    await transaction.commit();

    return receipt;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
  }
}

async function bulkRead(userId) {
  userId = Number(userId);

  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const participants = await db.Participants.findAll({
      where: { userId },
      transaction,
    });

    let totalRead = 0;

    for (const participant of participants) {
      const unreadMessages = await db.Message.findAll({
        where: {
          conversationId: participant.conversationId,
          senderId: {
            [db.Sequelize.Op.ne]: userId,
          },
          id: {
            [db.Sequelize.Op.gt]: participant.lastReadMessageId || 0,
          },
        },
        transaction,
      });

      if (unreadMessages.length === 0) {
        continue;
      }

      const receipts = unreadMessages.map((message) => ({
        messageId: message.id,
        userId,
        readAt: new Date(),
      }));

      await db.ReadReceipt.bulkCreate(receipts, {
        ignoreDuplicates: true,
        transaction,
      });

      participant.lastReadMessageId =
        unreadMessages[unreadMessages.length - 1].id;

      await participant.save({ transaction });

      totalRead += unreadMessages.length;
    }

    await transaction.commit();

    return {
      success: true,
      readMessages: totalRead,
    };
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    throw error;
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
