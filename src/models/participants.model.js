module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Participants",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("member", "subscriber", "admin", "owner"),
        allowNull: false,
        defaultValue: "member",
      },

      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      lastReadMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "participants",
      timestamps: true,

      indexes: [
        {
          unique: true,
          fields: ["conversationId", "userId"],
        },
      ],
    },
  );
};
