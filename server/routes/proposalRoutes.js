const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");

// Create a proposal
router.post(":taskId/sections/:sectionId/", proposalController.createProposal);

// Get a proposal by ID
router.get("/:id", proposalController.getProposalById);

// Update a proposal by ID
router.put("/:id", proposalController.updateProposal);

// Delete a proposal by ID
router.delete("/:id", proposalController.deleteProposal);

// Get all proposals for a section
router.get("/section/:sectionId", proposalController.getProposalsForSection);

module.exports = router;
