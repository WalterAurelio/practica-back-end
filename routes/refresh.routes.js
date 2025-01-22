const express = require('express');
const router = express.Router();
const handleRefreshToken = require('../controllers/refreshToken.controller');

router.get('/refresh', handleRefreshToken);

module.exports = router;