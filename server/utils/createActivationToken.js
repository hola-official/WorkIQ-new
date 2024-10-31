const jwt = require("jsonwebtoken");

module.exports = createActivationToken = (user) => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "10m",
    }
  );

  return { token, activationCode };
};
