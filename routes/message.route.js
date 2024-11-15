const express = require('express');
const { saveMessage } = require('../controllers/message.controller');

const router = express.Router();

router.post('/', saveMessage);

module.exports = router;