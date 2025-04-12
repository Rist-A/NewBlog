const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("HabeshaBlog", "userist", "rist", {
  host: "localhost",
  dialect: "postgres",
  logging: false // Optional: disable logging for cleaner output
});

module.exports = sequelize;