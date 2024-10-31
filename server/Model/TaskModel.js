const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proposalSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    isAssigned: { type: Boolean, default: false },
    coverLetter: { type: String, required: true },
    sectionPrice: { type: Number, required: true }, // Price from the section
    link: { type: String },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // ID of the section the proposal is for
    sectionDurationDays: { type: Number, required: true }, // Duration days from the section
  },
  {
    timestamps: true,
  }
);
const orderSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    sectionPrice: {
      type: Number,
      required: true,
    },
    deliveryStartDate: Date,
    deliveryEndDate: Date,
    remainingDeliveryDays: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    requirements: {
      coverLetter: {
        type: String,
      },
      isSubmitted: {
        type: Boolean,
        default: false,
      },
      attachments: [
        {
          name: String,
          url: String,
        },
      ],
    },
    deliver: {
      coverLetter: {
        type: String,
      },
      attachments: [
        {
          name: String,
          url: String,
        },
      ],
    },
    completionTimestamp: Date,
    txHash: String,
    status: {
      type: String,
      default: "in_progress",
      enum: ["pending", "in_progress", "delivered", "completed", "cancelled"],
    },
    sectionId: { type: Schema.Types.ObjectId, ref: "task.section" },
  },
  {
    timestamps: true,
  }
);

const sectionSchema = new Schema({
  title: String,
  description: String,
  durationDays: {
    type: Number,
    default: 3,
  },
  isPublished: Boolean,
  isCryptoPost: {
    type: Boolean,
    default: false,
  },
  assignTo: String,
  txHash: String,
  isAssigned: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 5,
  },
  proposal: [proposalSchema],
  order: [orderSchema],
  attachments: [
    {
      name: String,
      url: String,
    },
  ],
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
    },
    totalPrice: {
      type: Number,
      default: 0,
      // required: true,
    },
    durationDays: {
      type: Number,
      // required: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    txHash: String,
    skills: [{ type: String }],
    sections: [sectionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    clientAddress: String,
    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "completed", "rejected"],
    //   default: "pending",
    // },
    // visibleTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ skills: "text", bio: "text" });

module.exports = mongoose.model("Task", taskSchema);
