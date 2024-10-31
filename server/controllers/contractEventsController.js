const User = require("../Model/userModel");
const Task = require("../Model/TaskModel");
const Transaction = require("../Model/TransactionModel");
const {
  TASK_MANAGEMENT_CA,
  TASK_MANAGEMENT_ABI,
} = require("../contract/taskManagement");
const { ethers, Contract } = require("ethers");
const userModel = require("../Model/userModel");

require("dotenv").config();

const contractABI = TASK_MANAGEMENT_ABI;
const contractAddress = TASK_MANAGEMENT_CA;

let provider;
let contract;

const setupWebSocketProvider = () => {
  if (!TASK_MANAGEMENT_CA || !TASK_MANAGEMENT_ABI) {
    console.error("Contract address or ABI is missing.");
    return;
  }

  provider = new ethers.WebSocketProvider(
    "wss://alfajores-forno.celo-testnet.org/ws"
  );
  contract = new Contract(contractAddress, contractABI, provider);

  provider.on("error", (error) => {
    console.error("WebSocket Error:", error);
    reconnect();
  });

  setupEventListeners();
};

const reconnect = () => {
  console.log("Attempting to reconnect...");
  setTimeout(setupWebSocketProvider, 5000);
};

const setupEventListeners = () => {
  // UserRegistered event
  contract.on("UserRegistered", async (id, walletAddress, event) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { paymentWallet: walletAddress } },
        { new: true }
      );
      user.paymentWalletRegisterComplete = true;
      user.save();
      console.log(`User registered: ${id}, User Address: ${walletAddress}`);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  });

  // UserAddressUpdated event
  contract.on(
    "UserAddressUpdated",
    async (id, oldAddress, newAddress, event) => {
      try {
        const user = await User.findOneAndUpdate(
          { _id: id },
          { $set: { paymentWallet: newAddress } },
          { new: true }
        );
        console.log(
          `User address updated: ${id}, Old Address: ${oldAddress}, New Address: ${newAddress}`
        );
      } catch (error) {
        console.error("Error updating user address:", error);
      }
    }
  );

  // TaskCreated event
  contract.on("TaskCreated", async (taskId, client, event) => {
    try {
      const txHash = event.log.transactionHash;
      const task = await Task.findById(taskId);
      task.clientAddress = client;
      task.txHash = txHash;

      await task.save();
      console.log(`Task created: ${taskId}, Client: ${client}`);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  });

  // SectionPublished event
  contract.on("SectionPublished", async (taskId, sectionId, event) => {
    try {
      const txHash = event.log.transactionHash;
      const task = await Task.findById(taskId);
      if (task) {
        const section = task.sections.id(sectionId);
        if (section) {
          section.txHash = txHash;
          section.isCryptoPost = true;
          section.isPublished = true;
          await task.save();
        }
      }
      console.log(`Section published: Task ${taskId}, Section ${sectionId}`);
    } catch (error) {
      console.error("Error publishing section:", error);
    }
  });

  // SectionUnpublished event
  contract.on("SectionUnpublished", async (taskId, sectionId, event) => {
    try {
      const txHash = event.log.transactionHash;
      const task = await Task.findById(taskId);
      if (task) {
        const section = task.sections.id(sectionId);
        if (section) {
          section.txHash = txHash;
          section.isPublished = false;
          await task.save();
        }
      }
      console.log(`Section unpublished: Task ${taskId}, Section ${sectionId}`);
    } catch (error) {
      console.error("Error unpublishing section:", error);
    }
  });

  // SectionCompleted event
  contract.on(
    "SectionCompleted",
    async (taskId, sectionId, completionTimestamp, event) => {
      try {
        const txHash = event.log.transactionHash;
        const task = await Task.findById(taskId);
        if (task) {
          const section = task.sections.id(sectionId);
          if (section && section.order && section.order.length > 0) {
            const order = section.order[0];
            order.txHash = txHash;
            order.status = "delivered";
            // order.isApproved = true;
            order.completionTimestamp = new Date(Number(completionTimestamp) * 1000);

            await task.save();
          }
        }
        console.log(
          `Section completed: Task ${taskId}, Section ${sectionId}, Completion Time: ${new Date(
            Number(completionTimestamp) * 1000
          )}`
        );
      } catch (error) {
        console.error("Error completing section:", error);
      }
    }
  );

  // UserWithdrawal event
  contract.on("UserWithdrawal", async (userId, amount, event) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        const txHash = event.log.transactionHash;
        await Transaction.create({
          user: user._id,
          amount: ethers.formatUnits(amount, 6),
          type: "withdrawal",
          paymentMethod: "crypto",
          status: "success",
          txHash: txHash,
          reference: "usdc withdraw",
        });
        console.log(
          `User withdrawal: ${userId}, ${ethers.formatUnits(amount, 6)}`
        );
      } else {
        console.log(`User not found for ID: ${userId}`);
      }
    } catch (error) {
      console.error("Error processing user withdrawal:", error);
    }
  });

  // PlatformFunded event
  contract.on("PlatformFunded", async (userId, amount, event) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        const txHash = event.log.transactionHash;
        await Transaction.create({
          user: user._id,
          amount: ethers.formatUnits(amount, 6),
          type: "deposit",
          paymentMethod: "crypto",
          status: "success",
          reference: "usdc deposit",
          txHash: txHash,
        });
        console.log(
          `Platform funded: ${userId}, ${ethers.formatUnits(amount, 6)}`
        );
      } else {
        console.log(`User not found for ID: ${userId}`);
      }
    } catch (error) {
      console.error("Error processing platform funding:", error);
    }
  });

  // PlatformFeeUpdated event
  contract.on("PlatformFeeUpdated", async (newPercentage, event) => {
    console.log(`Platform fee updated: ${newPercentage}%`);
    // You might want to update this in your database or application state
  });

  // OrderCanceled event
  contract.on("OrderCanceled", async (taskId, sectionId, event) => {
    try {
      const txHash = event.log.transactionHash;
      const task = await Task.findById(taskId);
      if (task) {
        const section = task.sections.id(sectionId);
        if (section && section.order && section.order.length > 0) {
          const order = section.order[0];
          order.txHash = txHash;
          order.status = "cancelled";
          await task.save();
        }
      }
      console.log(`Order canceled: Task ${taskId}, Section ${sectionId}`);
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  });

  // SectionApproved event
  contract.on("SectionApproved", async (taskId, sectionId, event) => {
    try {
      const txHash = event.log.transactionHash;
      const task = await Task.findById(taskId);
      if (task) {
        const section = task.sections.id(sectionId);
        if (section && section.order && section.order.length > 0) {
          const order = section.order[0];

          // Check if the order is already completed
          if (order.status === "completed") {
            return res
              .status(400)
              .json({ message: "Order is already completed" });
          }

          order.txHash = txHash;
          order.isApproved = true;
          order.status = "completed";

          // Calculate and award points to freelancer
          const freelancerId = section.assignTo;
          const pointsEarned = 100; // Points earned by the freelancer

          // Update freelancer's points
          const freelancer = await userModel.findById(freelancerId);

          if (freelancer) {
            freelancer.points.push({
              orderId: order._id,
              description: `Earned 100 points for completing order "${section.title}"`,
              point: pointsEarned,
              date: new Date(),
            });
            await freelancer.save();
          } else {
            return res.status(404).json({ message: "Freelancer not found" });
          }

          await Transaction.create({
            user: task.client,
            amount: order.sectionPrice,
            type: "order_completed",
            status: "success",
            reference: "Order Completed",
          });

          if (freelancer) {
            await Transaction.create({
              user: freelancer._id,
              amount: order.sectionPrice,
              type: "earning",
              status: "success",
              reference: "Order Completed",
            });
          }
          await task.save();
        }
      }
      console.log(`Section approved: Task ${taskId}, Section ${sectionId}`);
    } catch (error) {
      console.error("Error approving section:", error);
    }
  });

  // SectionAssigned event
  contract.on(
    "SectionAssigned",
    async (taskId, sectionId, freelancerId, event) => {
      try {
        const txHash = event.log.transactionHash;
        const task = await Task.findById(taskId);
        if (task) {
          const section = task.sections.id(sectionId);
          if (section) {
            if (section.isAssigned) {
              // Section is already assigned to a freelancer
              return res
                .status(400)
                .json({ message: "Section is already assigned" });
            }

            // Check if the section has any existing orders
            if (section.order.length > 0) {
              // Section already has an order
              return res
                .status(400)
                .json({ message: "Section already has an order" });
            }

            // Find the proposal for this section and freelancer
            const proposal = section.proposal.find(
              (prop) => prop.freelancer.toString() === freelancerId
            );
            if (!proposal) {
              return res.status(404).json({
                message: "Proposal not found for this freelancer and section",
              });
            }

            // Create the order
            const order = {
              client: task.client, // Use the client from the task object
              freelancer: proposal.freelancer, // Use the freelancer's ID from the request
              task: task._id, // Use the task's ID from the task object
              sectionPrice: proposal.sectionPrice, // Use the price from the proposal
              status: "pending",
              sectionId: proposal.sectionId,
            };

            // Add the order to the section's orders array
            section.order.push(order);

            // Update the section's assignTo and isAssigned fields
            section.assignTo = freelancerId;
            section.isAssigned = true;
            section.txHash = txHash;
            await task.save();
          }
        }
        console.log(
          `Section assigned: Task ${taskId}, Section ${sectionId}, Freelancer ${freelancerId}`
        );
      } catch (error) {
        console.error("Error assigning section:", error);
      }
    }
  );

  // SectionPaymentClaimed event
  contract.on(
    "SectionPaymentClaimed",
    async (taskId, sectionId, freelancerId, amount, event) => {
      try {
        const txHash = event.log.transactionHash;
        await Transaction.create({
          user: freelancerId,
          amount: ethers.formatUnits(amount, 6),
          type: "earning",
          paymentMethod: "crypto",
          status: "success",
          txHash: txHash,
          reference: `Payment claimed for Task ${taskId}, Section ${sectionId}`,
        });
        console.log(
          `Section payment claimed: Task ${taskId}, Section ${sectionId}, Freelancer ${freelancerId}, Amount ${ethers.formatUnits(
            amount,
            6
          )}`
        );
      } catch (error) {
        console.error("Error processing section payment claim:", error);
      }
    }
  );

  // TaskPublished event
  contract.on("TaskPublished", async (taskId, event) => {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        { isPublished: true },
        { new: true }
      );
      console.log(`Task published: ${taskId}`);
    } catch (error) {
      console.error("Error publishing task:", error);
    }
  });

  // TaskUnpublished event
  contract.on("TaskUnpublished", async (taskId, event) => {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        { isPublished: false },
        { new: true }
      );
      console.log(`Task unpublished: ${taskId}`);
    } catch (error) {
      console.error("Error unpublishing task:", error);
    }
  });

  // TaskDeleted event
  contract.on("TaskDeleted", async (taskId, event) => {
    try {
      await Task.findByIdAndDelete(taskId);
      console.log(`Task deleted: ${taskId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  });

  // SectionDeleted event
  contract.on("SectionDeleted", async (taskId, sectionId, event) => {
    try {
      const task = await Task.findById(taskId);
      if (task) {
        task.sections.pull(sectionId);
        await task.save();
        console.log(`Section deleted: Task ${taskId}, Section ${sectionId}`);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  });

  // SectionReadyForReview event
  contract.on("SectionReadyForReview", async (taskId, sectionId, event) => {
    try {
      const task = await Task.findById(taskId);
      if (task) {
        const section = task.sections.id(sectionId);
        const order = section.order.find(
          (prop) => prop.sectionId.toString() === sectionId
        );
        if (order) {
          order.isDelivered = true;
          order.status = "delivered";
          await task.save();
        }
      }
      console.log(
        `Section ready for review: Task ${taskId}, Section ${sectionId}`
      );
    } catch (error) {
      console.error("Error setting section ready for review:", error);
    }
  });

  console.log("Event listeners set up successfully");
};

const TaskManagementController = {
  initializeWebSocket: () => {
    setupWebSocketProvider();
  },

  // Additional functions to interact with the smart contract can be added here
};

module.exports = TaskManagementController;
