const { Sequelize } = require('sequelize');

// Initialize Sequelize with MySQL connection
const sequelize = new Sequelize('user_registration', 'root', '12345', {
  host: '127.0.0.1', // Adjust host if necessary
  dialect: 'mysql',
  port: 3306, // Adjust port if necessary
});

module.exports = sequelize;
