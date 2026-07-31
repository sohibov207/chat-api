const { Op } = require("sequelize");
const db = require("../models");

async function createDirectConversation(targetUserId, currentUserId) {
  const currentId = parseInt(currentUserId, 10);
  const targetId = parseInt(targetUserId, 10);
  let transaction;

  console.log(`Checking/Creating chat between ${currentId} and ${targetId}`);

  try {
    const directKey = [currentId, targetId].sort((a, b) => a - b).join(":");

    const existingDirectConversation = await db.Conversation.findOne({
      where: {
        type: "chat",
        directKey,
      },
    });

    if (existingDirectConversation) {
      return existingDirectConversation;
    }

    if (currentId === targetId) {
      throw new Error("You cannot chat with yourself!");
    }

    transaction = await db.sequelize.transaction();

    const newConversation = await db.Conversation.create(
      {
        type: "chat",
        directKey,
      },
      { transaction },
    );

    await db.Participants.bulkCreate(
      [
        {
          conversationId: newConversation.id,
          userId: currentId,
          role: "member",
        },
        {
          conversationId: newConversation.id,
          userId: targetId,
          role: "member",
        },
      ],
      { transaction },
    );

    await transaction.commit();
    return newConversation;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function createGroup() {}

async function createChannel() {}

async function getConversationById(conversationId, userId) {
  const conversation = await db.Conversation.findByPk(conversationId, {
    include: [
      {
        model: db.User,
        as: "members",
        attributes: ["id", "name", "username"],
        through: {
          attributes: ["role", "joinedAt"],
        },
      },
    ],
  });

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

  return conversation;
}

async function getUserConversations(userId) {
  const user = await db.User.findByPk(userId, {
    include: [
      {
        model: db.Conversation,
        as: "conversations",
        include: [
          {
            model: db.Message,
            as: "lastMessage",
            include: [
              {
                model: db.User,
                as: "sender",
                attributes: ["id", "name", "username"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!user) {
    throw new Error("User not found");
  }

  for (const conversation of user.conversations) {
    const participant = await db.Participants.findOne({
      where: {
        conversationId: conversation.id,
        userId,
      },
    });

    conversation.dataValues.unreadCount = await db.Message.count({
      where: {
        conversationId: conversation.id,
        senderId: {
          [Op.ne]: userId,
        },
        id: {
          [Op.gt]: participant?.lastReadMessageId || 0,
        },
      },
    });
  }

  return user.conversations;
}

module.exports = {
  createDirectConversation,
  getConversationById,
  getUserConversations,
};
