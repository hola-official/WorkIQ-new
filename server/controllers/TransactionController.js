const stripe = require("stripe")(process.env.STRIPE_KEY);
const { uuid } = require("uuidv4");
const { sendMail } = require("../utils/sendMail.js");
const TransactionModel = require("../Model/TransactionModel");
const userModel = require("../Model/userModel");
// const { parseUnits } = require("ethers/lib/utils");

// let uuid = crypto.randomUUID();

const clientUrl = process.env.CLIENT_URL;

const depositFunds = async (req, res) => {
  try {
    const userId = req.userId;
    const { token, amount } = req.body;

    const parsedAmount = parseFloat(amount);

    // Validate the amount
    if (isNaN(parsedAmount) || parsedAmount < 0.5) {
      return res.status(400).json({
        message: "Transaction failed",
        data: "Amount must be at least $0.50 USD",
        success: false,
      });
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(parsedAmount * 100);
    console.log("Amount in cents:", amountInCents); // Log amount in cents

    // Create a customer
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    console.log("Customer created:", customer.id); // Log customer ID

    // Create a charge
    const charge = await stripe.charges.create(
      {
        amount: amountInCents,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `Deposited to WorkIQ`,
      },
      {
        idempotencyKey: uuid(),
      }
    );
    console.log("Charge created:", charge.status); // Log charge status

    // Save the transaction
    if (charge.status === "succeeded") {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      const currentBalance = user.balance;
      const newBalance = Number(currentBalance) + parsedAmount;

      await userModel.findByIdAndUpdate(userId, {
        balance: newBalance,
      });

      const newTransaction = new TransactionModel({
        user: userId,
        amount: parsedAmount,
        type: "deposit",
        paymentMethod: "card",
        reference: "stripe deposit",
        status: "success",
      });

      await newTransaction.save();

      const userData = {
        name: user.name,
        email: user.email,
        location: user.location,
        timestamp: new Date().toLocaleString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      };

      try {
        await sendMail({
          email: userData.email,
          subject: "Deposit Successful",
          template: "deposit-mail.ejs",
          data: {
            user: { username: user.username },
            amount: parsedAmount,
            time: { timestamp: userData.timestamp },
          },
        });
      } catch (error) {
        console.log("Error sending deposit email:", error);
      }

      res.send({
        message: "Transaction successful",
        data: newTransaction,
        success: true,
      });
    } else {
      res.send({
        message: "Transaction failed",
        data: charge,
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      message: "Transaction failed",
      data: error.message,
      success: false,
    });
  }
};

const depositUSDC = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, txHash } = req.body;

    // Validate the amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "Invalid deposit amount",
        success: false,
      });
    }

    // Find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Update user's balance
    const currentUsdcBalance = user.usdcBalance || 0;
    const newUsdcBalance = currentUsdcBalance + parsedAmount;

    await userModel.findByIdAndUpdate(userId, {
      usdcBalance: newUsdcBalance,
    });

    // Create a new transaction record
    const newTransaction = new TransactionModel({
      user: userId,
      amount: parsedAmount,
      type: "deposit",
      reference: "USDC deposit",
      status: "success",
      txHash: txHash,
    });

    await newTransaction.save();

    // Send email notification
    try {
      await sendMail({
        email: user.email,
        subject: "USDC Deposit Successful",
        template: "deposit-mail.ejs",
        data: {
          user: { username: user.username },
          amount: parsedAmount,
          time: { timestamp: new Date().toLocaleString() },
        },
      });
    } catch (error) {
      console.log("Error sending USDC deposit email:", error);
    }

    res.status(200).json({
      message: "USDC deposit successful",
      data: newTransaction,
      success: true,
    });
  } catch (error) {
    console.error("Error in depositUSDC:", error);
    res.status(500).json({
      message: "USDC deposit failed",
      data: error.message,
      success: false,
    });
  }
};

const createOrRefreshStripeConnectAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // Change this based on your requirements
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      user.stripeAccountId = account.id;
      await user.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/freelancer/stripe-connect/refresh`,
      return_url: `${process.env.CLIENT_URL}/freelancer/stripe-connect/complete`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("[CREATE_OR_REFRESH_STRIPE_CONNECT_ACCOUNT]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const completeStripeConnectOnboarding = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.stripeAccountId) {
      return res
        .status(400)
        .json({ message: "No Stripe account found for this user" });
    }

    // Retrieve the account to check its status
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    if (account.details_submitted) {
      // The account setup is complete
      user.stripeOnboardingComplete = true;
      await user.save();

      res.json({ message: "Stripe account setup completed successfully" });
    } else {
      // The account setup is not complete
      res.status(400).json({ message: "Stripe account setup is not complete" });
    }
  } catch (error) {
    console.error("[COMPLETE_STRIPE_CONNECT_ONBOARDING]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPayoutDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user.stripeAccountId) {
      return res
        .status(400)
        .json({ message: "No Stripe account found for this user" });
    }

    // Retrieve the balance from Stripe
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    // Get the available balance in the default currency (usually USD)
    const availableBalance = user.balance || 0;

    // Retrieve the default bank account (assuming the user has set one up)
    const bankAccounts = await stripe.accounts.listExternalAccounts(
      user.stripeAccountId,
      { object: "bank_account", limit: 1 }
    );

    let bankAccount = null;
    if (bankAccounts.data.length > 0) {
      const { last4, bank_name } = bankAccounts.data[0];
      bankAccount = { last4, bank_name };
    }

    res.json({ availableBalance, bankAccount });
  } catch (error) {
    console.error("[GET_PAYOUT_DETAILS]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const initiateWithdrawal = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    // Validate the amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check if Stripe account is set up
    if (!user.stripeAccountId || !user.stripeOnboardingComplete) {
      return res.status(400).json({ message: "Stripe account not set up" });
    }
    const totalAmount = amount;
    const freelancerShare = totalAmount * 0.9; // 90% for the freelancer

    const transfer = await stripe.transfers.create({
      amount: Math.round(freelancerShare * 100), // Convert to cents
      currency: "usd",
      destination: user.stripeAccountId,
      transfer_group: `${uuid}`,
    });

    console.log("Transfer created:", transfer.id);

    const payout = await stripe.payouts.create(
      {
        amount: Math.round(freelancerShare * 100), // Convert to cents
        currency: "usd",
      },
      {
        stripeAccount: user.stripeAccountId,
      }
    );

    console.log(payout.status);
    // If charge is successful, update user's balance
    if (payout.status === "paid" || payout.status === "pending") {
      user.balance -= amount;

      await user.save();
      // Create a new transaction record
      const newTransaction = new TransactionModel({
        user: userId,
        amount: amount,
        type: "withdrawal",
        paymentMethod: "card",
        status: payout.status === "paid" ? "success" : payout.status,
        reference: "stripe withdraw",
        stripeChargeId: payout.id,
      });
      await newTransaction.save();

      return res.status(200).json({
        message: "Withdrawal initiated successfully",
        // chargeId: charge.id,
        payoutId: payout.id,
      });
    } else {
      return res.status(400).json({ message: "Withdrawal failed" });
    }
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const withdrawals = await TransactionModel.find({
      user: userId,
      type: "withdrawal",
    }).sort({ createdAt: -1 });

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // console.log(event);
  console.log(event.type);

  if (
    event.type === "payout.paid" ||
    event.type === "payout.failed" ||
    event.type === "payout.pending"
  ) {
    const payout = event.data.object;
    const status = payout.status;
    const payoutId = payout.id;

    try {
      const transaction = await TransactionModel.findOne({
        stripeChargeId: payoutId,
      });

      if (transaction) {
        transaction.status = status === "paid" ? "success" : status;
        await transaction.save();
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error updating payout status:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.json({ received: true });
  }
};

module.exports = {
  depositFunds,
  depositUSDC,
  createOrRefreshStripeConnectAccount,
  completeStripeConnectOnboarding,
  getPayoutDetails,
  initiateWithdrawal,
  getWithdrawalHistory,
  stripeWebhook,
};
