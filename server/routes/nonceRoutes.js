const express = require('express');
const router = express.Router();
const nonceController = require('../controllers/nonceController');

router.get('/', nonceController.getNonce);
router.post('/verify', nonceController.verifySignature);

module.exports = router;