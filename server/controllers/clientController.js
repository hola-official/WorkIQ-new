const Category = require("../Model/CategoryModel.js");
const Task = require("../Model/TaskModel");
const userModel = require("../Model/userModel.js");
const { sendMail } = require("../utils/sendMail.js");

//Get all tasks categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create task title
const createTitle = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Please enter title" });
    const maxLength = 70;
    if (title.length > maxLength) {
      return res
        .status(401)
        .json({ message: `Title must be less than ${maxLength} characters` });
    }
    const userId = req.userId;
    const user = await userModel.findById(userId).select("-password");

    const task = new Task({ title, client: userId });
    user.tasksCreated.push(task._id);
    await user.save();
    await task.save();
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

const getAllClientTasks = async (req, res) => {
  try {
    // console.log(req.userId)
    const tasks = await Task.find({ client: req.userId });
    // console.log(tasks)
    if (!tasks.length)
      return res.status(404).json({ message: "No task found" });
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have user information stored in req.user after authentication

    // const { title, description } = req.body;
    // const titleMaxLength = 70;
    // if (title.length > titleMaxLength) {
    // 	return res
    // 		.status(401)
    // 		.json({ message: `Title must be less than ${titleMaxLength} characters` });
    // }

    // const descriMaxLength = 500;
    // if (description.length > descriMaxLength) {
    // 	return res
    // 		.status(401)
    // 		.json({ message: `Title must be less than ${descriMaxLength} characters` });
    // }

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the task exists and the user is the owner
    const taskOwner = await Task.findOne({
      _id: req.params.id,
      client: userId,
    });

    if (!taskOwner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Update the task price if provided in req.body
    // if (req.body.price !== undefined) {
    // 	task.price = req.body.price;
    // }

    // // Save additional property from req.body if present
    // const propertyName = Object.keys(req.body)[0]; // Get the first (and only) property name
    // if (propertyName && propertyName !== "price") {
    // 	task[propertyName] = req.body[propertyName];
    // }
    // Update the task price if provided in req.body

    // Update the total price if provided in req.body
    if (req.body.totalPrice !== undefined) {
      task.totalPrice = req.body.totalPrice;
    }

    // Save additional properties from req.body if present
    for (let propertyName in req.body) {
      if (propertyName !== "price" && propertyName !== "totalPrice") {
        task[propertyName] = req.body[propertyName];
      }
    }

    // Save the updated task
    const updatedTask = await task.save();

    res.status(200).json({ task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskCategory = async (req, res) => {
  console.log("first updating category...");
  const taskId = req.params.id;
  const categoryId = req.body.categoryId;

  try {
    const userId = req.userId; // Assuming you have user information stored in req.user after authentication

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the task exists and the user is the owner
    const taskOwner = await Task.findOne({
      _id: req.params.id,
      client: userId,
    });
    if (!taskOwner) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Find the task and update its category
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldCategoryId = task.categoryId;

    task.categoryId = categoryId;
    await task.save();

    // Update the old category
    if (oldCategoryId) {
      const oldCategory = await Category.findById(oldCategoryId);
      if (oldCategory) {
        oldCategory.tasks = oldCategory.tasks.filter(
          (id) => id.toString() !== taskId
        );
        await oldCategory.save();
      }
    }

    // Update the new category
    if (categoryId) {
      const newCategory = await Category.findById(categoryId);
      if (newCategory) {
        newCategory.tasks.push(taskId);
        await newCategory.save();
      }
    }

    res.status(200).json({ message: "Task category updated successfully" });
  } catch (error) {
    console.log("[UPDATE TASK CATEGORY]", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createSection = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have user information stored in req.user after authentication
    const { title } = req.body;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const maxTitleLength = 50;
    if (title.length > maxTitleLength) {
      return res.status(400).json({
        message: `Title must be less than ${maxTitleLength} characters`,
      });
    }

    // Check if the task exists and the user is the owner
    const taskOwner = await Task.findOne({
      _id: req.params.id,
      client: userId,
    });
    if (!taskOwner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the last section and determine the position for the new section
    const lastSectionPosition =
      taskOwner.sections.length > 0
        ? taskOwner.sections[taskOwner.sections.length - 1].position
        : 0;
    const newPosition = lastSectionPosition + 1;

    // const isFree = taskOwner.price ? false : true;

    // Create the new section
    const newSection = {
      title,
      // isFree,
      position: newPosition,
    };

    // Add the newly created section to the task's sections array
    taskOwner.sections.push(newSection);
    await taskOwner.save();

    return res.json(newSection);
  } catch (error) {
    console.log("[SECTsections]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const toggleTaskPublicationStatus = async (req, res) => {
  try {
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: taskId } = req.params;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Toggle the task's publication status
    ownTask.isPublished = !ownTask.isPublished;

    // If the task is being published and has no sections, return error
    if (ownTask.isPublished && ownTask.sections.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot publish task with no sections" });
    }

    // Save the updated task with toggled publication status
    await ownTask.save();

    return res
      .status(200)
      .json({ message: "Task publication status toggled successfully" });
  } catch (error) {
    console.log("[TOGGLE TASK PUBLICATION STATUS]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: id,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete the task
    await Task.deleteOne({ _id: id });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("[DELETE TASK]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const reorderSections = async (req, res) => {
  try {
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { list } = req.body;
    // console.log(list)

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: req.params.id,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update the positions of sections based on the provided list
    for (let item of list) {
      const sectionToUpdate = ownTask.sections.find((section) =>
        section._id.equals(item.id)
      );
      if (sectionToUpdate) {
        sectionToUpdate.position = item.position;
      }
    }

    ownTask.sections.sort((a, b) => a.position - b.position);

    // Save the updated task with reordered sections
    await ownTask.save();
    // console.log(ownTask)

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log("[REORDER]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

//Update Task section
const updateSection = async (req, res) => {
  try {
    const { taskId, sectionId } = req.params;
    // console.log(taskId, sectionId, req.body);

    const { userId } = req;
    //update section in a task
    const task = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!task) return res.status(404).json({ msg: "Task not found" });
    const section = task.sections.id(sectionId);
    if (!section) return res.status(404).json({ msg: "Section not found" });
    section.set(req.body);
    if (section.isPublished) {
      return res
        .status(400)
        .json({ message: "UnList before you can update this section" });
    }
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const addAttachmentToSection = async (req, res) => {
  try {
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sectionId, taskId } = req.params;
    const { attachment } = req.body;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the section by its ID
    const sectionToUpdate = ownTask.sections.find((section) =>
      section._id.equals(sectionId)
    );
    if (!sectionToUpdate) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Add attachments to the section
    sectionToUpdate.attachments.push(attachment);

    // Save the updated task with added attachments
    await ownTask.save();

    return res.status(200).json({ message: "Attachment added successfully" });
  } catch (error) {
    console.log("[ADD ATTACHMENTS]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const deleteAttachmentFromSection = async (req, res) => {
  try {
    // console.log(req.body)
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sectionId, taskId, attachmentId } = req.params;
    // const { attachmentId } = req.body;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the section by its ID
    const sectionToUpdate = ownTask.sections.find((section) =>
      section._id.equals(sectionId)
    );
    if (!sectionToUpdate) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Find the index of the attachment to delete
    const attachmentIndex = sectionToUpdate.attachments.findIndex(
      (attachment) => attachment._id.equals(attachmentId)
    );
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Remove the attachment from the attachments array
    sectionToUpdate.attachments.splice(attachmentIndex, 1);

    // Save the updated task with deleted attachment
    await ownTask.save();

    return res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.log("[DELETE ATTACHMENT]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { userId } = req; // Assuming you have user information stored in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sectionId, taskId } = req.params;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the section index in the sections array
    const sectionIndex = ownTask.sections.findIndex((section) =>
      section._id.equals(sectionId)
    );
    if (sectionIndex === -1) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Remove the section from the sections array
    ownTask.sections.splice(sectionIndex, 1);

    // If the deleted section is the last section, unpublish the task
    if (ownTask.sections.length === 0) {
      ownTask.isPublished = false;
    }

    // Save the updated task with deleted section
    await ownTask.save();

    return res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.log("[DELETE SECTION]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

// const toggleSectionPublicationStatus = async (req, res) => {
//   try {
//     const { userId } = req; // Assuming you have user information stored in req.user after authentication
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { sectionId, taskId } = req.params;
//     const { paymentMethod } = req.body;

//     // Check if the user owns the task
//     const ownTask = await Task.findOne({
//       _id: taskId,
//       client: userId,
//     });
//     if (!ownTask) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // Find the section by its ID
//     const sectionToUpdate = ownTask.sections.find((section) =>
//       section._id.equals(sectionId)
//     );
//     if (!sectionToUpdate) {
//       return res.status(404).json({ message: "Section not found" });
//     }

//     // Toggle the section's publication status
//     const previousPublicationStatus = sectionToUpdate.isPublished;
//     sectionToUpdate.isPublished = !previousPublicationStatus;

//     // Adjust task's total price based on section's publication status
//     const sectionPrice = sectionToUpdate.price;

//     // Retrieve the user from the database
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     const userWithWallet = await userModel
//       .findById(userId)
//       .select("paymentWallet");

//     if (
//       (paymentMethod === "both" || paymentMethod === "crypto") &&
//       !userWithWallet.paymentWallet
//     ) {
//       return res.status(400).json({
//         message: "Please set up your address to receive crypto payment",
//       });
//     }

//     if (sectionToUpdate.isPublished) {
//       // Check if the user has sufficient balance
//       if (user.balance < sectionPrice) {
//         return res.status(400).json({ message: "Insufficient balance" });
//       }

//       // Deduct the section price from the user's balance and hold it in escrow
//       user.balance -= sectionPrice;

//       // Update the user's balance and hold the escrow amount
//       user.escrowBalance = (user.escrowBalance || 0) + sectionPrice;
//       console.log(user.balance);
//       console.log(user.escrowBalance);
//       // Save the updated user's balance
//       await user.save();
//     } else {
//       user.balance += sectionPrice;
//       user.escrowBalance = (user.escrowBalance || 0) - sectionPrice;

//       await user.save();
//     }
//     // If balance deduction is successful, update the section's publication status
//     if (user.balance >= 0) {
//       if (sectionToUpdate.isPublished !== previousPublicationStatus) {
//         if (sectionToUpdate.isPublished) {
//           ownTask.totalPrice += sectionPrice; // Add section price to task's total price
//         } else {
//           ownTask.totalPrice -= sectionPrice; // Remove section price from task's total price
//         }
//       }
//     } else {
//       // If balance is insufficient after deduction, revert the publication status and balance deduction
//       sectionToUpdate.isPublished = previousPublicationStatus;
//       user.balance += sectionPrice;
//       user.escrowBalance -= sectionPrice; // Remove escrow amount
//       await user.save();
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // If the section unpublished is the only section, unpublish the task
//     if (!sectionToUpdate.isPublished && ownTask.sections.length === 1) {
//       ownTask.isPublished = false;
//     }

//     // Save the updated task with toggled publication status of the section
//     await ownTask.save();

//     return res
//       .status(200)
//       .json({ message: "Section publication status toggled successfully" });
//   } catch (error) {
//     console.log("[TOGGLE SECTION PUBLICATION STATUS]", error);
//     return res.status(500).json({ message: "Internal Error" });
//   }
// };

const toggleSectionPublicationStatus = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sectionId, taskId } = req.params;
    const { paymentMethod } = req.body;

    // Check if the user owns the task
    const ownTask = await Task.findOne({
      _id: taskId,
      client: userId,
    });
    if (!ownTask) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the section by its ID
    const sectionToUpdate = ownTask.sections.find((section) =>
      section._id.equals(sectionId)
    );
    if (!sectionToUpdate) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Check paymentWallet
    const userWithWallet = await userModel
      .findById(userId)
      .select("paymentWallet");
    if (
      (paymentMethod === "both" || paymentMethod === "crypto") &&
      !userWithWallet.paymentWallet
    ) {
      return res.status(400).json({
        message: "Please set up your address to receive crypto payment",
      });
    }

    // Toggle the section's publication status
    const previousPublicationStatus = sectionToUpdate.isPublished;
    sectionToUpdate.isPublished = !previousPublicationStatus;

    // Adjust task's total price based on section's publication status
    const sectionPrice = sectionToUpdate.price;

    // Retrieve the user from the database
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (sectionToUpdate.isPublished) {
      // Check if the user has sufficient balance
      if (user.balance < sectionPrice) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct the section price from the user's balance and hold it in escrow
      user.balance -= sectionPrice;
      user.escrowBalance = (user.escrowBalance || 0) + sectionPrice;
    } else {
      user.balance += sectionPrice;
      user.escrowBalance = (user.escrowBalance || 0) - sectionPrice;
    }

    // Save the updated user's balance
    await user.save();

    // Update task's total price
    if (sectionToUpdate.isPublished !== previousPublicationStatus) {
      if (sectionToUpdate.isPublished) {
        ownTask.totalPrice += sectionPrice;
      } else {
        ownTask.totalPrice -= sectionPrice;
      }
    }

    // If the section unpublished is the only section, unpublish the task
    if (!sectionToUpdate.isPublished && ownTask.sections.length === 1) {
      ownTask.isPublished = false;
    }

    // Save the updated task
    await ownTask.save();

    return res
      .status(200)
      .json({ message: "Section publication status toggled successfully" });
  } catch (error) {
    console.log("[TOGGLE SECTION PUBLICATION STATUS]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

const createProposalForSection = async (req, res) => {
  try {
    const { taskId, sectionId } = req.params;
    const { coverLetter } = req.body;
    const freelancerId = req.userId; // Assuming the freelancer's information is in the request user object

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const freelancer = await userModel.findById(freelancerId);

    // Find the section in the task
    const section = task.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section) {
      return res.status(404).json({ message: "Section not found in the task" });
    }

    // Check if the freelancer has already submitted a proposal for this section
    const existingProposal = section.proposal.find(
      (prop) => prop.freelancer.toString() === freelancerId
    );
    if (existingProposal) {
      return res.status(400).json({
        message: "You have already submitted a proposal for this section",
      });
    }

    // Create a new proposal with only the coverLetter submitted by the freelancer
    const newProposal = {
      freelancer: freelancerId,
      coverLetter,
      sectionPrice: section.price,
      sectionId,
      sectionDurationDays: section.durationDays,
    };

    // Add the new proposal to the section's proposals array
    section.proposal.push(newProposal);

    // Save the task
    await task.save();

    // Save the proposal ID to the sentProposal array in the user document
    freelancer.sentProposal.push(task._id);
    await freelancer.save();

    res.status(201).json({
      message: "Proposal created successfully",
      proposal: newProposal,
    });
  } catch (error) {
    console.error("Error creating proposal for section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller method to get a task by ID
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Export the controller methods
module.exports = {
  createTitle,
  getAllClientTasks,
  updateTask,
  getCategories,
  updateTaskCategory,
  createSection,
  reorderSections,
  updateSection,
  addAttachmentToSection,
  deleteAttachmentFromSection,
  deleteSection,
  toggleSectionPublicationStatus,
  toggleTaskPublicationStatus,
  createProposalForSection,
  getTaskById,
  deleteTask,
};
