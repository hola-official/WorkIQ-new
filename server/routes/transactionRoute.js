const express = require("express");
const router = express.Router();
const {
  depositFunds,
  createOrRefreshStripeConnectAccount,
  completeStripeConnectOnboarding,
  getPayoutDetails,
  initiateWithdrawal,
  getWithdrawalHistory,
  depositUSDC,
} = require("../controllers/TransactionController");
const verifyJWT = require("../middleware/verifyJWT");

// Deposit funds
router.post("/deposit-funds", verifyJWT, depositFunds);
router.post("/deposit-usdc", verifyJWT, depositUSDC);

// Stripe Connect account creation and management
router.post(
  "/create-stripe-connect",
  verifyJWT,
  createOrRefreshStripeConnectAccount
);
router.post(
  "/complete-stripe-onboarding",
  verifyJWT,
  completeStripeConnectOnboarding
);

// Payout related routes
router.get("/payout-details", verifyJWT, getPayoutDetails);

// Withdrawal related routes
router.post("/withdraw", verifyJWT, initiateWithdrawal);
router.get("/withdrawal-history", verifyJWT, getWithdrawalHistory);

module.exports = router;
