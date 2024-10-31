const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const refreshRoute = require("./routes/refresh");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const orderRoutes = require("./routes/orderRoutes");
const transactionRoutes = require("./routes/transactionRoute");
const ProposalRoutes = require("./routes/proposalRoutes");
const taskRoutes = require("./routes/taskRoutes");
const webhookRoute = require("./routes/webhookRoute");
const nonceRoutes = require("./routes/nonceRoutes");
const homeHTMLContent = require("./utils/homeHTMLContent");
const TaskManagementController = require("./controllers/contractEventsController");
const cloudinary = require("cloudinary").v2;
require("./config/passport-setup");

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up MongoDB store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
  expires: 1 * 60 * 60, // 1hr in seconds
});

// Use express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a secure secret key
    resave: false,
    saveUninitialized: false,
    store: store, // Use MongoDB store
  })
);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Middleware to initialize passport
app.use("/api", express.raw({ type: "application/json" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: "50mb" })); //parse json data inside the req body
app.use(express.urlencoded({ extended: true })); // parse form data inside the req body

// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// app.use(cors);
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send(homeHTMLContent);
});
app.use("/nonce", nonceRoutes);
app.use("/auth", authRoutes);
app.use("/refresh", refreshRoute);
app.use("/api", webhookRoute);
app.use("/users", userRoutes);
app.use("/projects", taskRoutes);
app.use("/proposal", ProposalRoutes);
app.use("/tasks", clientRoutes);
app.use("/order", orderRoutes);
app.use("/transactions", transactionRoutes);

TaskManagementController.initializeWebSocket();

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Is 🏃‍♂️ On PORT ${PORT}`));
  })
  .catch((err) => console.log(err));
