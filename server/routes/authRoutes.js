const express = require("express");
const {
  signUp,
  login,
  logout,
  // getCurrentUserInfo,
  activateUser,
  passwordReset,
  confirmPasswordResetOTP,
  passwordResetConfirmed,
  generateGoogleAuthCookie,
  verifyDeviceOTP,
  submitAdditionalInfo,
  createUsername,
} = require("../controllers/authController");
const {
  googleAuthCallback,
  authenticateGoogle,
} = require("../middleware/passportMiddleware");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// Google Signup with optional Google authentication
router.get("/googleauth", authenticateGoogle);

router.get("/google/callback", googleAuthCallback, generateGoogleAuthCookie);
router.post("/username", verifyJWT, createUsername);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/additional-info", submitAdditionalInfo);
router.post("/verify-device", verifyDeviceOTP);
router.post("/activate-account", activateUser);
router.post("/reset-password", passwordReset);
router.post("/reset-password/confirm", confirmPasswordResetOTP);
router.put("/reset-password/finish", passwordResetConfirmed);
router.post("/logout", logout);

module.exports = router;
