module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      messageType: {
        type: DataTypes.ENUM(
          "text",
          "image",
          "video",
          "file",
          "voice",
          "audio",
          "system",
        ),
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      caption: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      forwardedMessageId: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: true,
      },
      forwardedFromId: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: true,
      },
      replyToMessageId: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: true,
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      editedAt: {
        type: DataTypes.DATE,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "messages",
      timestamps: true,
    },
  );
};
