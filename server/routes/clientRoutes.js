const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/clientController");
const verifyJWT = require("../middleware/verifyJWT");
const { Admin, Client, Freelancer } = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.get("/task-categories", verifyJWT, getCategories);

router.post(
  "/create-title",
  verifyJWT,
  verifyRoles(Admin, Client),
  createTitle
);

router.get(
  "/all-tasks",
  verifyJWT,
  verifyRoles(Admin, Client),
  getAllClientTasks
);

router.put(
  "/edit-task/:id/category",
  verifyJWT,
  verifyRoles(Admin, Client),
  updateTaskCategory
);



router.put("/edit-task/:id", verifyJWT, verifyRoles(Admin, Client), updateTask);

// router.put(
//   "/edit-task/:id/category",
//   verifyJWT,
//   verifyRoles(Admin, Client),
//   updateTaskCategory
// );

// router.put(
//   "/edit-task/:id/category",
//   verifyJWT,
//   verifyRoles(Admin, Client),
//   updateTaskCategory
//   // createSection
// );


router.put(
  "/edit-task/:id/create-section",
  verifyJWT,
  verifyRoles(Admin, Client),
  // updateTaskCategory
  createSection
);

router.put(
  "/edit-task/:id/toggle-publish",
  verifyJWT,
  verifyRoles(Admin, Client),
  toggleTaskPublicationStatus
);

router.put(
  "/edit-task/:id/reorder-sections",
  verifyJWT,
  verifyRoles(Admin, Client),
  reorderSections
);

router.put(
  "/edit-task/:taskId/section/:sectionId",
  verifyJWT,
  verifyRoles(Admin, Client),
  updateSection
);

router.delete(
  "/edit-task/:taskId/section/:sectionId",
  verifyJWT,
  verifyRoles(Admin, Client),
  deleteSection
);

router.put(
  "/edit-task/:taskId/section/:sectionId/toggle-publish",
  verifyJWT,
  verifyRoles(Admin, Client),
  toggleSectionPublicationStatus
);

router.put(
  "/edit-task/:taskId/section/:sectionId/attachment",
  verifyJWT,
  verifyRoles(Admin, Client),
  addAttachmentToSection
);
router.delete(
  "/edit-task/:taskId/section/:sectionId/attachment/:attachmentId",
  verifyJWT,
  verifyRoles(Admin, Client),
  deleteAttachmentFromSection
);

// Route to create a proposal for a section within a task
router.post(
  "/:taskId/section/:sectionId/create-proposal",
  verifyJWT,
  verifyRoles(Freelancer), // Only freelancers can create proposals
  createProposalForSection
);

// Route to delete a task by ID
router.delete("/:id", verifyJWT, verifyRoles(Admin, Client), deleteTask);

// Route to get a task by ID
router.get("/:id", verifyJWT, getTaskById);

module.exports = router;
