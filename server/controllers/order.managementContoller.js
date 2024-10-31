const Task = require("../Model/TaskModel");
const TransactionModel = require("../Model/TransactionModel.js");
const userModel = require("../Model/userModel.js");

// Controller logic for creating an order
const createOrder = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { freelancerId } = req.body;
    const clientId = req.userId; // Assuming the client's information is in the request user object

    // Check if the section is already assigned to a freelancer
    const task = await Task.findOne({
      "sections._id": sectionId,
      client: clientId,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the section in the task
    const section = task.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section) {
      return res.status(404).json({ message: "Section not found in the task" });
    }

    if (section.isAssigned) {
      // Section is already assigned to a freelancer
      return res.status(400).json({ message: "Section is already assigned" });
    }

    // Check if the section has any existing orders
    if (section.order.length > 0) {
      // Section already has an order
      return res.status(400).json({ message: "Section already has an order" });
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

    // Save the section
    await task.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const submitRequirements = async (req, res) => {
  try {
    const { taskId, sectionId, orderId } = req.params;
    const { coverLetter, attachments } = req.body;

    // Check if the task exists
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the section in the task
    const section = task.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section) {
      return res.status(404).json({ message: "Section not found in the task" });
    }

    // Check if the order exists within the section
    const order = section.order.find((o) => o._id.toString() === orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found in the section" });
    }

    // Update the order with the submitted requirements
    order.requirements = {
      coverLetter: coverLetter,
      attachments: attachments || [],
      isSubmitted: true,
    };

    // Start delivery countdown if requirements are submitted
    if (order.requirements.isSubmitted) {
      // Calculate remaining delivery days based on section's durationDays
      const currentDate = new Date();
      const deliveryStartDate = currentDate;
      const deliveryEndDate = new Date(
        currentDate.getTime() + section.durationDays * 24 * 60 * 60 * 1000
      );
      const remainingDeliveryDays =
        Math.round(
          (deliveryEndDate.getTime() - currentDate.getTime()) /
            (24 * 60 * 60 * 1000)
        ) + 1;

      // Update the order with delivery details
      order.deliveryStartDate = deliveryStartDate;
      order.deliveryEndDate = deliveryEndDate;
      order.remainingDeliveryDays = remainingDeliveryDays;
    }

    // Save the task
    await task.save();

    res
      .status(200)
      .json({ message: "Requirements submitted successfully", order });
  } catch (error) {
    console.error("Error submitting requirements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the task containing the order
    const task = await Task.findOne({ "sections.order._id": orderId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task containing the order not found" });
    }

    // Find the section containing the order
    const section = task.sections.find((sec) =>
      sec.order.some((order) => order._id.toString() === orderId)
    );

    if (!section) {
      return res
        .status(404)
        .json({ message: "Section containing the order not found" });
    }

    // Find the order within the section
    const order = section.order.find((o) => o._id.toString() === orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Respond with the order and its associated section details
    res.status(200).json({ order, section, task });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrdersByClient = async (req, res) => {
  try {
    const userId = req.userId; // Assuming the client's information is in the request user object

    // Find all tasks where the client is the creator
    const tasks = await Task.find({
      $or: [
        { client: userId }, // Tasks created by the client
        { "sections.assignTo": userId }, // Tasks assigned to the freelancer
      ],
    }).populate("sections.order");

    // Extract orders and their corresponding section details from all sections of all tasks
    const ordersWithSections = [];
    tasks.forEach((task) => {
      task.sections.forEach((section) => {
        section.order.forEach((order) => {
          ordersWithSections.push({
            order,
            section: {
              _id: section._id,
              title: section.title,
              price: order.sectionPrice,
              // Add other section details as needed
            },
          });
        });
      });
    });

    res.status(200).json({ ordersWithSections });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const submitOrderCompletion = async (req, res) => {
  try {
    const { orderId } = req.params;
    const freelancerId = req.userId; // Assuming the freelancer's information is in the request user object
    const { coverLetter, attachments } = req.body;

    // Find the order
    const task = await Task.findOne({
      "sections.order._id": orderId,
      "sections.assignTo": freelancerId,
    });
    console.log(task);
    if (!task) {
      return res
        .status(404)
        .json({ message: "Order not found or not assigned to you" });
    }

    const section = task.sections.find((sec) =>
      sec.order.some((ord) => ord._id.equals(orderId))
    );

    // Update the order
    const order = section.order.find((ord) => ord._id.equals(orderId));
    order.isDelivered = true;
    order.status = "delivered"; // Update status to delivered
    order.deliver = {
      coverLetter: coverLetter || "", // Include cover letter if provided
      attachments: attachments || [], // Include attachments if provided
    };

    // Save the updated task
    await task.save();

    res.status(200).json({ message: "Order delivered successfully", order });
  } catch (error) {
    console.log("Error submitting order completion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const approveOrderDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const task = await Task.findOne({
      "sections.order._id": orderId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Order not found or not associated with your account",
      });
    }

    const section = task.sections.find((sec) =>
      sec.order.some((ord) => ord._id.equals(orderId))
    );

    // Find the order to approve
    const order = section.order.find((ord) => ord._id.equals(orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already completed
    if (order.status === "completed") {
      return res.status(400).json({ message: "Order is already completed" });
    }

    // Update the order status to approved
    order.isApproved = true;
    order.status = "completed";

    // Calculate and award points to freelancer
    const freelancerId = section.assignTo;
    const pointsEarned = 100; // Points earned by the freelancer

    // Update freelancer's points
    const freelancer = await userModel.findById(freelancerId);

    if (freelancer) {
      freelancer.points.push({
        orderId: orderId,
        description: `Earned 100 points for completing order "${section.title}"`,
        point: pointsEarned,
        date: new Date(),
      });
      await freelancer.save();
    } else {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Deduct section price from client's escrow balance
    const clientById = order.client;
    const client = await userModel.findById(clientById);

    if (client) {
      const sectionPrice = order.sectionPrice;
      if (client.escrowBalance >= sectionPrice) {
        client.escrowBalance -= sectionPrice;
        await client.save();
      } else {
        return res
          .status(400)
          .json({ message: "Insufficient funds in escrow balance" });
      }

      const newClientTransaction = new TransactionModel({
        user: client._id,
        amount: order.sectionPrice,
        type: "order_completed",
        status: "success",
        reference: "Order Completed",
      });
      await newClientTransaction.save();
    } else {
      return res.status(404).json({ message: "Client not found" });
    }

    // Add section price to freelancer's balance
    if (freelancer) {
      freelancer.balance += order.sectionPrice;
      await freelancer.save();

      const newFreelancerTransaction = new TransactionModel({
        user: freelancer._id,
        amount: order.sectionPrice,
        type: "earning",
        status: "success",
        reference: "Order Completed",
      });
      await newFreelancerTransaction.save();
    }

    freelancer.tasksCompleted.push(orderId);
    await task.save();

    // Respond with the updated order details
    res
      .status(200)
      .json({ message: "Order delivery approved successfully", order });
  } catch (error) {
    console.error("Error approving order delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const clientId = req.userId; // Assuming the client's information is in the request user object

    // Find the order
    const task = await Task.findOne({
      "sections.order._id": orderId,
      client: clientId,
    });
    if (!task) {
      return res.status(404).json({
        message: "Order not found or not associated with your account",
      });
    }

    const section = task.sections.find((sec) =>
      sec.order.some((ord) => ord._id.equals(orderId))
    );

    // Find the order to cancel
    const order = section.order.find((ord) => ord._id.equals(orderId));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to cancelled
    order.status = "cancelled";

    // Save the updated task
    await task.save();

    // Return success response
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createOrder,
  submitRequirements,
  getOrderById,
  getOrdersByClient,
  submitOrderCompletion,
  approveOrderDelivery,
  cancelOrder,
};
