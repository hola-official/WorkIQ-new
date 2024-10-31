const express = require("express");

const { stripeWebhook } = require("../controllers/TransactionController");

const router = express.Router();
router.post("/stripe-webhook", stripeWebhook);

module.exports = router;
