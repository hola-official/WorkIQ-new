// const Task = require("../Model/TaskModel");
// const Category = require("../models/CategoryModel");
// const User = require("../Model/userModel");
const Task = require("../Model/TaskModel");
const User = require("../Model/userModel");

// const browseAllTasks = async (req, res) => {
//   try {
//     let query = { isPublished: true };
//     const { title, categoryId } = req.query;

//     if (title) {
//       query.title = { $regex: title, $options: "i" }; // Case-insensitive title search
//     }
//     if (categoryId) {
//       query.categoryId = categoryId;
//     }

//     const tasks = await Task.find(query)
//       .populate("categoryId", "name") // Populate category field with name
//       .populate({
//         path: "sections",
//         match: { isPublished: true }, // Filter published sections
//       })
//       .populate({
//         path: "client",
//         select: "name avatar", // Populate client field with name and avatar
//       })
//       .sort({ createdAt: "desc" });

//     const tasksWithDetails = await Promise.all(
//       tasks.map(async (task) => {
//         // Filter populated sections to remove those without isPublished property
//         task.sections = task.sections.filter(
//           (section) => section.isPublished
//         );

//         // Calculate average rating for reviews
//         const totalReviews = task.reviews.length;
//         const totalRating = task.reviews.reduce(
//           (acc, review) => acc + review.rating,
//           0
//         );
//         const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

//         // Map each review to include user, rating, and comment
//         const reviewsWithDetails = task.reviews.map((review) => ({
//           user: review.user.username,
//           rating: review.rating,
//           comment: review.comment,
//         }));

//         return {
//           ...task.toObject(),
//           averageRating: averageRating.toFixed(2), // Round to 2 decimal places
//           reviews: reviewsWithDetails,
//         };
//       })
//     );

//     res.status(200).json(tasksWithDetails);
//   } catch (error) {
//     console.error("[GET_TASKS]", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const browseAllTasks = async (req, res) => {
  try {
    const { searchQuery, filter, page = 1, pageSize = 20 } = req.query;
    const skipAmount = (page - 1) * pageSize;
    const query = { isPublished: true };

    // Apply filter options
    let sortOptions = {};
    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 }; // Sort by newest tasks
        break;
      case "bestMatch":
        const { userId } = req.params;
        const freelancer = await User.findById(userId);
        if (freelancer && freelancer.skills && freelancer.skills.length > 0) {
          const freelancerSkills = freelancer.skills;
          const freelancerDescription = freelancer.bio || ""; // Assume bio is the description field
          sortOptions = { $meta: "textScore" };
          query.$text = {
            $search: `${freelancerSkills.join(" ")} ${freelancerDescription}`,
          };
        } else {
          // If freelancer has no skills, return all tasks sorted by newest
          sortOptions = { createdAt: -1 };
        }
        break;
      default:
        break;
    }

    // Fetch tasks based on the constructed query and sorting options
    const tasks = await Task.find(query)
      .populate("categoryId", "name")
      .populate({
        path: "sections",
        match: { isPublished: true },
      })
      .populate({
        path: "client",
        select: "name avatar",
      })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    // const tasks = await Task.find(query)
    //   .populate("categoryId", "name") // Populate category field with name
    //   .populate({
    //     path: "sections",
    //     match: { isPublished: true }, // Filter published sections
    //   })
    //   .populate({
    //     path: "tutor",
    //     select: "name avatar", // Populate tutor field with name and avatar
    //   })
    //   .sort({ createdAt: "desc" });

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        // Filter populated sections to remove those without isPublished property
        task.sections = task.sections.filter((section) => section.isPublished);
      })
    );
    // Apply search query if provided
    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { description: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("[GET_TASKS]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  browseAllTasks,
};
