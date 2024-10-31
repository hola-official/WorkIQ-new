const { MongoClient } = require("mongodb");
const { generateNonce, SiweMessage } = require("siwe");
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const { StreamClient } = require("@stream-io/node-sdk");

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let nonceCollection;

async function connectToNonceCollection() {
  if (!nonceCollection) {
    await client.connect();
    const database = client.db("lms");
    nonceCollection = database.collection("nonces");
  }
}

exports.getNonce = async (req, res) => {
  await connectToNonceCollection();
  const nonce = generateNonce();
  await nonceCollection.insertOne({ nonce, createdAt: new Date() });
  res.json({ nonce });
};

exports.verifySignature = async (req, res) => {
  await connectToNonceCollection();
  const { message, signature, userId } = req.body;
  // console.log(req.body)

  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });
    // console.log("fields,", fields)

    const nonceDoc = await nonceCollection.findOne({
      nonce: fields?.data?.nonce,
    });
    if (!nonceDoc) {
      return res.status(400).json({ error: "Invalid nonce" });
    }

    if (new Date() - nonceDoc.createdAt > 5 * 60 * 1000) {
      await nonceCollection.deleteOne({ nonce: fields?.data?.nonce });
      return res.status(400).json({ error: "Nonce expired" });
    }

    await nonceCollection.deleteOne({ nonce: fields?.data?.nonce });

    // Check if the wallet address is already connected to another user
    const existingUser = await User.findOne({
      connectedWallets: fields?.data?.address,
    });

    let user;
    //Add address to wallet list
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ error: "Wallet already connected to another user" });
      }
      if (!user.connectedWallets.includes(fields?.data?.address)) {
        user.connectedWallets.push(fields?.data?.address);
        await user.save();
      }
    } else {
      user = await User.findOne({ connectedWallets: fields?.data?.address });
      if (!user) {
        return res.status(200).json({
          requireAdditionalInfo: true,
          ethAddress: fields?.data?.address,
        });
      }
    }
    // console.log(user);

    const newRefreshToken = jwt.sign(
      { _id: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    let newRefreshTokenArray = user.refreshToken;

    // Saving refreshToken with current user
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];

    const streamClient = new StreamClient(api_key, api_secret);
    const streamToken = streamClient.createToken(user._id.toString());
    const result = await user.save();

    const roles = Object.values(user.roles).filter(Boolean);
		
    // console.log("newRefreshToken", newRefreshToken);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          _id: user._id,
          username: user.username,
          fullName: user.name,
          image: user.avatar,
          connectedWallets: user.connectedWallets,
          paymentWallet: user.paymentWallet,
          roles: roles,
          streamToken: streamToken,
          stripeOnboardingComplete: user.stripeOnboardingComplete,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Wallet signed successfully",
      accessToken,
      loggedUser: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Function to clean up expired nonces
async function cleanupExpiredNonces() {
  await connectToNonceCollection();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  await nonceCollection.deleteMany({ createdAt: { $lt: fiveMinutesAgo } });
}

// Run cleanup every 15 minutes
setInterval(cleanupExpiredNonces, 15 * 60 * 1000);
