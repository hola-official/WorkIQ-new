const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
  type: {
    type: String,
    enum: ["BRONZE", "SILVER", "GOLD"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    projectUrl: { type: String },
    githubUrl: { type: String },
    skills: [String],
    testimonial: { type: String },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      //  required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      // required: true
    },
    roles: {
      Client: {
        type: String,
        default: "Client",
      },
      Freelancer: String,
      Admin: String,
    },
    connectedWallets: { type: [String], default: [] },
    paymentWallet: { type: String, unique: true },
    paymentWalletRegisterComplete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // New field for verification status
    googleId: String,
    location: { type: String },
    avatar: { type: String },
    bio: { type: String },
    balance: {
      type: Number,
    },
    escrowBalance: { type: Number, default: 0 }, // New field for escrow balance
    usdcBalance: {
      type: Number,
    },
    stripeAccountId: String,
    stripeOnboardingComplete: { type: Boolean, default: false },
    portfolios: [portfolioSchema],
    sentProposal: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    tasksCompleted: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    tasksCreated: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    refreshToken: [String],
    devices: [
      {
        fingerprint: String,
        userAgent: String,
        browser: String,
        os: String,
        lastIP: String,
        location: String,
        lastUsed: Date,
        isVerified: Boolean,
        createdAt: { type: Date, default: Date.now },
        // expiresAt: { type: Date, default: () => new Date(+new Date() + 2*60*1000) } // 30 days from now
        expiresAt: {
          type: Date,
          default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
        }, // 30 days from now
      },
    ],
    points: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: "task.section.order" },
        description: String,
        point: Number,
        date: Date,
      },
    ],
    totalPoints: { type: Number, default: 0 },
    badges: [badgeSchema],
    skills: [{ type: String }],
    category: { type: String },
    website: { type: String },
    socialMedia: {
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
    },
    experience: [
      {
        title: { type: String },
        company: { type: String },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
