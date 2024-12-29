const User = require('../models/User');
const Ride = require('../models/Ride');

exports.getActiveUsers = async (req, res) => {
    try {
        const users = await User.findAll({ where: { status: 'active' } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.manageAccount = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const user = await User.update({ status }, { where: { id } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRideHistory = async (req, res) => {
    try {
        const rides = await Ride.findAll({ include: ['user', 'driver'] });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
