const express = require('express');
const router = express.Router();
const handleLogout = require('../controllers/logout.controller');

router.get('/logout', handleLogout);

module.exports = router;