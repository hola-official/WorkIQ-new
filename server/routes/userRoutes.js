const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
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
} = require("../controllers/userControllers");
const verifyRoles = require("../middleware/verifyRoles");
const verifyJWT = require("../middleware/verifyJWT");
const { Client, Admin, Freelancer } = require("../config/roles_list");


router.get(
  "/freelancer-stats",
  verifyJWT,
  verifyRoles(Admin, Client, Freelancer),
  getFreelancerStats
);
router.get("/client-stats", verifyJWT, getClientStats);
router.put("/update/:userId", verifyJWT, updateUser);
router.delete("/:userId", verifyJWT, deleteUser);
router.get("/:query", verifyJWT, getUserProfile);
// Multer setup
// const upload = multer({ dest: "uploads/" });

router.post("/verify", verifyJWT, requestVerification);
router.post("/verify/:token", approveVerification);

router.post(
  "/:userId/portfolios",
  // upload.single("file"),
  verifyJWT,
  createPortfolio
);
router.get("/:userId/portfolios", getUserPortfolios);
// router.get('/:userId/portfolios/:portfolioId', getPortfolio);
router.put("/:userId/portfolios/:portfolioId", verifyJWT, updatePortfolio);
router.delete("/:userId/portfolios/:portfolioId", verifyJWT, deletePortfolio);

module.exports = router;
