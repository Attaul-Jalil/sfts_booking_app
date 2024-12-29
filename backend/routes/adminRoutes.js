const express = require('express');
const { getActiveUsers, manageAccount, getRideHistory } = require('../controllers/adminController');
const router = express.Router();

// Define routes
router.get('/active-users', getActiveUsers);
router.patch('/manage-account/:id', manageAccount);
router.get('/ride-history', getRideHistory);

module.exports = router;
