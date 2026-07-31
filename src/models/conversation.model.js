module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM("chat", "group", "channel"),
        allowNull: false,
        defaultValue: "chat",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 40],
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 300],
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pinnedMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      directKey: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      lastMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "conversations",
      timestamps: true,
    },
  );
};
