const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'driver'), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
});

module.exports = User;
