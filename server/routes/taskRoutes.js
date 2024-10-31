
const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const { browseAllTasks, purchaseTask, getAssignTasksWithProgress } = require("../controllers/taskController");


const router = express.Router();
router.get("/search", verifyJWT, browseAllTasks);
// router.get("/all-assign", verifyJWT, getAssignTasksWithProgress);

module.exports = router;
