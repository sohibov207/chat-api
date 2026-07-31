const { Sequelize, DataTypes } = require("sequelize");

const connectionString = process.env.DATABASE_URL;

let sequelize;

if (connectionString) {
  console.log("Connecting via DATABASE_URL");
  sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    logging: false,
  });
} else {
  console.log(
    `Connecting via parameters: ${process.env.DB_NAME || "chat_api"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}`,
  );
  sequelize = new Sequelize(
    process.env.DB_NAME || "chat_api",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "postgres",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    },
  );
}

const db = {
  sequelize,
  Sequelize,
};

db.User = require("./user.model")(sequelize, DataTypes);
db.Participants = require("./participants.model")(sequelize, DataTypes);
db.Conversation = require("./conversation.model")(sequelize, DataTypes);
db.Message = require("./message.model")(sequelize, DataTypes);
db.ReadReceipt = require("./readReceipt.model")(sequelize, DataTypes);

db.Conversation.hasMany(db.Participants, {
  foreignKey: "conversationId",
  as: "participants",
});

db.Participants.belongsTo(db.Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

db.User.hasMany(db.Participants, {
  foreignKey: "userId",
  as: "memberships",
});

db.Participants.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

db.Conversation.hasMany(db.Message, {
  foreignKey: "conversationId",
});

db.Message.belongsTo(db.Conversation, {
  foreignKey: "conversationId",
});

db.User.hasMany(db.Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});

db.Message.belongsTo(db.User, {
  foreignKey: "senderId",
  as: "sender",
});

db.Message.hasMany(db.ReadReceipt, {
  foreignKey: "messageId",
});

db.ReadReceipt.belongsTo(db.Message, {
  foreignKey: "messageId",
});

db.User.hasMany(db.ReadReceipt, {
  foreignKey: "userId",
});

db.ReadReceipt.belongsTo(db.User, {
  foreignKey: "userId",
});

db.Conversation.belongsToMany(db.User, {
  through: db.Participants,
  as: "members",
  foreignKey: "conversationId",
  otherKey: "userId",
});

db.User.belongsToMany(db.Conversation, {
  through: db.Participants,
  as: "conversations",
  foreignKey: "userId",
  otherKey: "conversationId",
});

db.Conversation.belongsTo(db.Message, {
  foreignKey: "lastMessageId",
  as: "lastMessage",
});

module.exports = db;
