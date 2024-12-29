const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Ride = sequelize.define('Ride', {
    date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed'), allowNull: false },
});

Ride.belongsTo(User, { as: 'user' });
Ride.belongsTo(User, { as: 'driver' });

module.exports = Ride;
