const User = require('../Model/userModel');

// Middleware to update user role based on portfolio and skill existence
const updateUserRoleMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if the user has a portfolio and skills
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasPortfolios = user.portfolios && user.portfolios.length > 0;
    const hasSkills = user.skills && user.skills.length > 0;

    if (hasPortfolios && hasSkills) {
      // User has both portfolios and skills, update role to freelancer
      req.user.role = 'freelancer';
    } else {
      // User does not have both portfolios and skills, set role to client
      req.user.role = 'client';
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateUserRoleMiddleware;
