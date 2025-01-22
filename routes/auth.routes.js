const express = require('express');
const router = express.Router();
const authUser = require('../controllers/auth.controller');

router.post('/auth', authUser);

module.exports = router;