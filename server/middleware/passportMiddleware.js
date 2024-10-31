const passport = require("passport");
const clientUrl = process.env.CLIENT_URL


const authenticateGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });


const googleAuthCallback = passport.authenticate("google", {
	// successRedirect: "http://localhost:5173",
	failureRedirect: `${clientUrl}/auth` // Redirect on authentication failure
});


module.exports = {authenticateGoogle, googleAuthCallback };
