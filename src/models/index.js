const { Sequelize, DataTypes } = require('sequelize');

const connectionString = process.env.DATABASE_URL;

let sequelize;

if (connectionString) {
  console.log('Connecting via DATABASE_URL');
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  console.log(`Connecting via parameters: ${process.env.DB_NAME || 'chat_api'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  sequelize = new Sequelize(
    process.env.DB_NAME || 'chat_api',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

const db = {
  sequelize,
  Sequelize,
};

db.User = require('./user.model')(sequelize, DataTypes);

module.exports = db;