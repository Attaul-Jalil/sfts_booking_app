const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Correct the path if needed

const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,  // If you're not using default timestamps
  tableName: 'messages',  // Optional: define the table name explicitly
});

module.exports = Message;
