module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "ReadReceipt",
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      readAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "read_receipts",
      timestamps: true,
    },
  );
};
