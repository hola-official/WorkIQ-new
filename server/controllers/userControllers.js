const bcrypt = require("bcrypt");
const userModel = require("../Model/userModel");
const mongoose = require("mongoose");
const assignBadges = require("../utils/assignBadges");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const ejs = require("ejs");
const path = require("path");
const PendingVerification = require("../Model/PendingVerification");
const dotenv = require("dotenv");
const TransactionModel = require("../Model/TransactionModel");
const TaskModel = require("../Model/TaskModel");
dotenv.config();

// Controller for updating user details
const updateUser = async (req, res) => {
  const userId = req.userId;
  const {
    name,
    email,
    username,
    password,
    location,
    website,
    skills,
    bio = "",
    category,
    socialMedia = {},
  } = req.body;
  let { profilePic } = req.body;

  try {
    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;

      for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    let user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (userId.toString() !== req.params.userId)
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    let isModified = false;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      if (hashedPassword !== user.password) {
        user.password = hashedPassword;
        isModified = true;
      }
    }

    // Social media validation
    const socialMediaValidations = {
      twitter: {
        regex: /^https:\/\/(www\.)?x\.com\//,
        error: "Invalid Twitter URL",
      },
      linkedin: {
        regex: /^https:\/\/(www\.)?linkedin\.com\//,
        error: "Invalid LinkedIn URL",
      },
      github: {
        regex: /^https:\/\/(www\.)?github\.com\//,
        error: "Invalid GitHub URL",
      },
    };

    for (const [key, value] of Object.entries(socialMedia)) {
      if (
        socialMediaValidations[key] &&
        !socialMediaValidations[key].regex.test(value)
      ) {
        return res
          .status(400)
          .json({ error: socialMediaValidations[key].error });
      }
      if (value && value !== user.socialMedia[key]) {
        isModified = true;
      }
    }

    // Check if the information being updated is different from existing information
    if (
      (name && user.name !== name) ||
      (email && user.email !== email) ||
      (username && user.username !== username) ||
      (bio && user.bio !== bio) ||
      (location && user.location !== location) ||
      (website && user.website !== website) ||
      (skills && !arraysEqual(user.skills, skills)) ||
      (category && user.category !== category) ||
      profilePic
    ) {
      isModified = true;
    }

    if (!isModified) {
      return res.status(400).json({ error: "No changes detected" });
    }

    const maxLength = 350;
    if (bio.length > maxLength) {
      return res
        .status(401)
        .json({ error: `Bio must be less than ${maxLength} characters` });
    }

    // Update avatar
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    // Update other user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.avatar = profilePic || user.avatar;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;
    user.skills = skills || user.skills;
    user.category = category || user.category;
    user.socialMedia = {
      twitter: socialMedia.twitter || user.socialMedia.twitter,
      linkedin: socialMedia.linkedin || user.socialMedia.linkedin,
      github: socialMedia.github || user.socialMedia.github,
    };

    // Save updated user data
    user = await user.save();
    user.password = null; // Remove password from response
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in Update User: ", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller for deleting a user
const deleteUser = async (req, res) => {
  const userId = req.userId;
  try {
    await userModel.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for fetching user details
// const getUserProfile = async (req, res) => {
//   // We fetch the user profile either by username or userId
//   // The query parameter can be either username or userId

//   try {
//     let user;
//     const query = req.params.query;

//     // Check if the query is a valid ObjectId (userId)
//     if (mongoose.Types.ObjectId.isValid(query)) {
//       user = await userModel.findById(query);
//     } else {
//       // If the query is not a valid ObjectId, assume it's a username
//       user = await userModel.findOne({
//         $or: [{ username: query }, { _id: query }],
//       });
//     }

//     console.log(user);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error("Error getting user: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const getUserProfile = async (req, res) => {
  try {
    let user;
    const query = req.params.query;

    // Check if the query is a valid ObjectId (userId)
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await userModel.findById(query);
    } else {
      // If the query is not a valid ObjectId, assume it's a username
      user = await userModel.findOne({ username: query });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the total points from the points array
    const totalPoints = user.points.reduce((sum, pointEntry) => {
      // console.log(`Adding point: ${pointEntry.point}`);
      return sum + pointEntry.point;
    }, 0);

    // console.log(`Total points: ${totalPoints}`);
    console.log(totalPoints);
    // Define the criteria to be passed to assignBadges
    const criteria = [{ type: "TOTAL_POINTS", count: totalPoints }];

    // Get the assigned badges
    const badgeCounts = assignBadges({ criteria });

    // Update user's badges based on badgeCounts
    user.badges = Object.keys(badgeCounts).reduce((acc, level) => {
      if (badgeCounts[level] > 0) {
        acc.push({ type: level });
      }
      return acc;
    }, []);
    user.totalPoints = totalPoints;
    // Save the updated user with badges
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error getting user: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const requestVerification = async (req, res) => {
  const userId = req.userId;
  const { name, username, email, address, message, file } = req.body;
  // const  = req.body;
  console.log(file);
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if there is an existing verification request
    const existingRequest = await PendingVerification.findOne({
      userId: user._id,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "Verification request already submitted" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token to PendingVerification collection
    const pendingVerification = new PendingVerification({
      userId: user._id,
      token,
      status: "pending",
    });
    await pendingVerification.save();

    console.log(pendingVerification);

    // Generate file URL
    // let uploadedImageUrl;
    // if (file) {
    //   const uploadedImage = await cloudinary.uploader.upload(file.path, {
    //     folder: "verification",
    //   });
    //   uploadedImageUrl = uploadedImage.secure_url;
    // }

    // console.log(uploadedImageUrl);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;

    // Render the EJS template
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../mails/verification-approval-email.ejs"),
      { user, message, address, token }
    );

    const mailOptions = {
      from: email,
      to: adminEmail,
      subject: `New Verification Request Submission from ${name}`,
      html: emailTemplate,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
          contentType: file.mimetype,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    res
      .status(200)
      .json({ message: "Verification request submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const approveVerification = async (req, res) => {
  const token = req.params.token;
  console.log(token);

  try {
    // Find the token in the PendingVerification collection
    const pendingVerification = await PendingVerification.findOne({ token });
    if (!pendingVerification) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Find the user associated with the token
    const user = await userModel.findById(pendingVerification.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user roles and set isVerified to true
    user.roles.Freelancer = "Freelancer";
    user.roles.Client = "Client";
    user.isVerified = true;
    await user.save();

    // Update pending verification status
    pendingVerification.status = "approved";
    await pendingVerification.save();

    // Delete the pending verification request
    await PendingVerification.findByIdAndDelete(pendingVerification._id);

    // Send a confirmation email to the user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../mails/verification-approved-email.ejs"),
      { user }
    );

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Verification Request has been Approved",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createPortfolio = async (req, res) => {
  try {
    const { title, description, projectUrl, githubUrl, tags, testimonial } =
      req.body;
    const file = req.file; // Assuming you're using multer for file upload
    const userId = req.userId;

    // Validate projectUrl
    const urlRegex = /^(https?:\/\/|www\.)/i;
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.+/i;
    if (projectUrl && !urlRegex.test(projectUrl)) {
      return res.status(400).json({
        message: "Project URL must start with http://, https://, or www.",
      });
    }

    if (githubUrl && !githubRegex.test(githubUrl)) {
      return res.status(400).json({
        message: "GitHub URL must be a valid GitHub repository URL.",
      });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let uploadedImageUrl;
    if (file) {
      const uploadedImage = await cloudinary.uploader.upload(file.path, {
        folder: "portfolios",
      });
      uploadedImageUrl = uploadedImage.secure_url;
    }

    // console.log(title, description, projectUrl, tags, testimonial);
    const newPortfolio = {
      title,
      description,
      imageUrl: uploadedImageUrl,
      projectUrl: projectUrl
        ? projectUrl.startsWith("www.")
          ? `http://${projectUrl}`
          : projectUrl
        : "",
      githubUrl: githubUrl
        ? githubUrl.startsWith("www.")
          ? `http://${githubUrl}`
          : githubUrl
        : "",
      tags: tags.split(",").map((tag) => tag.trim()),
      testimonial,
    };

    user.portfolios.push(newPortfolio);
    await user.save();

    res.status(201).json(newPortfolio);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log("Error in creating portfolio: ", error);
  }
};

// Update a portfolio item
const updatePortfolio = async (req, res) => {
  try {
    const userId = req.userId;
    const portfolioId = req.params.portfolioId;
    const {
      title,
      description,
      imageUrl,
      projectUrl,
      githubUrl,
      skills,
      testimonial,
      tags,
    } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const portfolio = user.portfolios.id(portfolioId);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    // Validate URLs
    const urlRegex = /^(https?:\/\/|www\.)/i;
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.+/i;

    if (projectUrl && !urlRegex.test(projectUrl)) {
      return res.status(400).json({
        message: "Project URL must start with http://, https://, or www.",
      });
    }

    if (githubUrl && !githubRegex.test(githubUrl)) {
      return res.status(400).json({
        message: "GitHub URL must be a valid GitHub repository URL.",
      });
    }

    // Check if there are any changes
    const changes = {};
    if (title && title !== portfolio.title) changes.title = title;
    if (description && description !== portfolio.description)
      changes.description = description;
    if (projectUrl && projectUrl !== portfolio.projectUrl)
      changes.projectUrl = projectUrl;
    if (githubUrl && githubUrl !== portfolio.githubUrl)
      changes.githubUrl = githubUrl;
    if (skills && JSON.stringify(skills) !== JSON.stringify(portfolio.skills))
      changes.skills = skills;
    if (testimonial && testimonial !== portfolio.testimonial)
      changes.testimonial = testimonial;
    if (tags && JSON.stringify(tags) !== JSON.stringify(portfolio.tags))
      changes.tags = tags;

    if (Object.keys(changes).length === 0 && imageUrl === portfolio.imageUrl) {
      return res.status(200).json({ message: "No changes detected" });
    }

    // Update image if new one is provided
    if (
      imageUrl &&
      imageUrl !== portfolio.imageUrl &&
      !imageUrl.startsWith("http")
    ) {
      const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
        folder: "portfolios",
      });
      portfolio.imageUrl = uploadedImage.secure_url;
    }

    // Apply changes
    Object.assign(portfolio, changes);

    await user.save();

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all portfolio items of a user
const getUserPortfolios = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    const user = await userModel.findById(userId).select("portfolios");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a portfolio item
const deletePortfolio = async (req, res) => {
  try {
    const userId = req.userId;
    const portfolioId = req.params.portfolioId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const portfolioIndex = user.portfolios.findIndex(
      (p) => p._id.toString() === portfolioId
    );
    if (portfolioIndex === -1) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const portfolio = user.portfolios[portfolioIndex];

    // Delete image from Cloudinary
    if (portfolio.imageUrl) {
      const publicId = portfolio.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`portfolios/${publicId}`);
    }

    user.portfolios.splice(portfolioIndex, 1);
    await user.save();

    res.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFreelancerStats = async (req, res) => {
  try {
    const { userId } = req;
    const { startDate, endDate } = req.query;

    const freelancer = await userModel.findById(userId);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Calculate total tasks completed and proposals sent
    const totalTasksCompleted = freelancer.tasksCompleted.length;
    const totalProposalsSent = freelancer.sentProposal.length;

    // Calculate total earnings from completed orders
    const totalEarnings = await TaskModel.aggregate([
      {
        $unwind: "$sections",
      },
      {
        $unwind: "$sections.order",
      },
      {
        $match: {
          "sections.order.status": "completed",
          "sections.assignTo": userId,
          ...(startDate &&
            endDate && {
              "sections.order.completedAt": {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$sections.order.sectionPrice" },
        },
      },
    ]).then((results) => results[0]?.total || 0);

    // Get recent activities (last 5 completed tasks)
    const recentActivities = await TaskModel.find({
      _id: { $in: freelancer.tasksCompleted },
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .lean();

    // Get recent transactions (earnings, deposits, and withdrawals)
    const recentTransactions = await TransactionModel.find({
      user: userId,
      type: { $in: ["earning", "order_completed", "deposit", "withdrawal"] },
      ...(startDate &&
        endDate && {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Calculate success rate
    const successRate =
      totalTasksCompleted > 0
        ? (totalTasksCompleted / totalTasksCompleted) * 100
        : 0;

    // Get top skills
    const topSkills = await TaskModel.aggregate([
      { $match: { _id: { $in: freelancer.tasksCompleted } } },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Calculate average task completion time and cancellation rate
    const completionAndCancellationData = await TaskModel.aggregate([
      {
        $unwind: "$sections",
      },
      {
        $unwind: "$sections.order",
      },
      {
        $match: {
          "sections.order.freelancer": new mongoose.Types.ObjectId(
            freelancer._id
          ),
          "sections.order.status": { $in: ["completed", "cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$sections.order.status", "cancelled"] }, 1, 0],
            },
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$sections.order.status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    let avgCompletionTimeValue = 100; // Start at 100%
    let completedOrdersCount = 0;
    let cancelledOrdersCount = 0;

    if (completionAndCancellationData.length > 0) {
      const data = completionAndCancellationData[0];
      cancelledOrdersCount = data.cancelledOrders;
      completedOrdersCount = data.completedOrders;

      // Deduct 5% for each cancelled order
      avgCompletionTimeValue = Math.max(0, 100 - cancelledOrdersCount * 5);
    }

    const avgCompletionTimeFormatted = {
      value: avgCompletionTimeValue,
      unit: "%",
      completedOrders: completedOrdersCount,
      cancelledOrders: cancelledOrdersCount,
    };

    // Fetch all orders (completed, pending, ongoing) by the freelancer
    const allOrders = await TaskModel.aggregate([
      {
        $unwind: "$sections",
      },
      {
        $unwind: "$sections.order",
      },
      // {
      //   $match: {
      //     "sections.assignTo": userId,
      //   },
      //   $match: {
      //     "sections.assignTo": userId,
      //   },
      // },
      {
        $sort: { "sections.order.deliveryEndDate": -1 },
      },
      {
        $limit: 10,
      },
      {
        $group: {
          _id: null,
          allOrders: { $push: "$sections" },
        },
      },
      {
        $project: {
          allOrders: 1,
        },
      },
    ]);

    const extractedAllOrders =
      allOrders.length > 0 ? allOrders[0].allOrders : [];

    const transactions = await TransactionModel.find({
      user: userId,
      type: { $in: ["earning", "order_completed", "deposit", "withdrawal"] },
      ...(startDate &&
        endDate && {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }),
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach((transaction) => {
      if (
        transaction.type === "deposit" ||
        transaction.paymentMethod === "card" ||
        transaction.paymentMethod === "crypto"
      ) {
        totalDeposits += transaction.amount;
      } else if (
        transaction.type === "withdrawal" ||
        transaction.paymentMethod === "card" ||
        transaction.paymentMethod === "crypto"
      ) {
        totalWithdrawals += transaction.amount;
      }
    });

    const BADGE_CRITERIA = {
      TOTAL_POINTS: {
        BRONZE: 600,
        SILVER: 1000,
        GOLD: 5000,
      },
    };

    const calculateBadgeProgress = (totalPoints) => {
      const bronzeThreshold = BADGE_CRITERIA.TOTAL_POINTS.BRONZE;
      const silverThreshold = BADGE_CRITERIA.TOTAL_POINTS.SILVER;
      const goldThreshold = BADGE_CRITERIA.TOTAL_POINTS.GOLD;

      let bronzeProgress, silverProgress, goldProgress;

      if (totalPoints >= goldThreshold) {
        bronzeProgress = 100;
        silverProgress = 100;
        goldProgress = 100;
      } else if (totalPoints >= silverThreshold) {
        bronzeProgress = 100;
        silverProgress = 100;
        goldProgress =
          ((totalPoints - silverThreshold) /
            (goldThreshold - silverThreshold)) *
          100;
      } else if (totalPoints >= bronzeThreshold) {
        bronzeProgress = 100;
        silverProgress =
          ((totalPoints - bronzeThreshold) /
            (silverThreshold - bronzeThreshold)) *
          100;
        goldProgress = 0;
      } else {
        bronzeProgress = (totalPoints / bronzeThreshold) * 100;
        silverProgress = 0;
        goldProgress = 0;
      }

      return [
        { name: "Bronze", value: parseFloat(bronzeProgress.toFixed(2)) },
        { name: "Silver", value: parseFloat(silverProgress.toFixed(2)) },
        { name: "Gold", value: parseFloat(goldProgress.toFixed(2)) },
      ];
    };

    // Prepare data for PieChart
    const pieChartData = {
      badges: calculateBadgeProgress(freelancer.totalPoints),
      successRate: [
        {
          name: "Successful Projects",
          value: parseFloat(successRate.toFixed(2)),
        },
        {
          name: "Not Successful",
          value: parseFloat((100 - successRate).toFixed(2)),
        },
      ],
      avgCompletionTime: avgCompletionTimeFormatted,
      earningRate: [
        {
          name: "Earnings Rate",
          value: totalEarnings / (totalTasksCompleted ? 100 : 0),
        },
      ],
    };
    res.json({
      totalTasksCompleted,
      totalProposalsSent,
      totalEarnings,
      currentBalance: freelancer.balance,
      totalPoints: freelancer.totalPoints,
      badges: freelancer.badges,
      recentActivities,
      recentTransactions,
      successRate,
      topSkills,
      avgCompletionTime: avgCompletionTimeFormatted,
      allOrders: extractedAllOrders,
      pieChartData,
      totalDeposits,
      totalWithdrawals,
    });
  } catch (error) {
    console.error("Error fetching freelancer stats:", error);
    res.status(500).json({ message: "Error fetching freelancer stats" });
  }
};

const getClientStats = async (req, res) => {
  try {
    const { userId } = req;
    const client = await userModel.findById(userId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Calculate total tasks created
    const totalTasksCreated = client.tasksCreated.length;

    // Calculate total spent
    const totalSpent = await TransactionModel.aggregate([
      { $match: { user: userId, type: "withdrawal", status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((results) => results[0]?.total || 0);

    // Get recent activities (last 5 created tasks)
    const recentActivities = await TaskModel.find({
      _id: { $in: client.tasksCreated },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent transactions
    const recentTransactions = await TransactionModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total deposits
    const totalDeposits = await TransactionModel.aggregate([
      { $match: { user: userId, type: "deposit", status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((results) => results[0]?.total || 0);

    // Calculate number of active and completed tasks
    const activeTasks = await TaskModel.countDocuments({
      _id: { $in: client.tasksCreated },
      status: "active",
    });

    const completedTasks = await TaskModel.countDocuments({
      _id: { $in: client.tasksCreated },
      status: "completed",
    });

    // Calculate average task cost
    const avgTaskCost =
      totalTasksCreated > 0 ? totalSpent / totalTasksCreated : 0;

    // Get top categories of tasks created
    const topCategories = await TaskModel.aggregate([
      { $match: { _id: { $in: client.tasksCreated } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Calculate freelancer hiring frequency
    const hiringFrequency =
      totalTasksCreated /
      ((Date.now() - client.createdAt) / (1000 * 3600 * 24));

    res.json({
      totalTasksCreated,
      totalSpent,
      currentBalance: client.balance,
      escrowBalance: client.escrowBalance,
      recentActivities,
      recentTransactions,
      totalDeposits,
      activeTasks,
      completedTasks,
      avgTaskCost,
      topCategories,
      hiringFrequency,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    res.status(500).json({ message: "Error fetching client stats" });
  }
};

module.exports = {
  getUserProfile,
  updateUser,
  deleteUser,
  requestVerification,
  approveVerification,
  createPortfolio,
  updatePortfolio,
  getUserPortfolios,
  deletePortfolio,
  getFreelancerStats,
  getClientStats,
};
