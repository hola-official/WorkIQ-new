const Task = require("../Model/TaskModel");
const userModel = require("../Model/userModel");

const createProposal = async (req, res) => {
  try {
    const { taskId, sectionId } = req.params;
    const { coverLetter } = req.body;
    const freelancer = req.userId; // Assuming the freelancer's information is in the request user object

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the section in the task
    const section = task.sections.find(
      (sec) => sec._id.toString() === sectionId
    );
    if (!section) {
      return res.status(404).json({ message: "Section not found in the task" });
    }

    // Check if the freelancer is the owner of the task
    if (freelancer._id.toString() === task.client.toString()) {
      return res.status(403).json({ message: "Freelancer cannot submit a proposal for their own task" });
    }

    // Create a new proposal with only the coverLetter submitted by the freelancer
    const newProposal = {
      freelancer: freelancer._id,
      coverLetter,
      sectionPrice: section.price,
      sectionId,
      sectionDurationDays: section.durationDays,
    };

    // Add the new proposal to the section's proposals array
    section.proposal.push(newProposal);

    // Save the task
    await task.save();
    
    // Save the proposal ID to the sentProposal array in the user document
    freelancer.sentProposal.push(task._id);
    await freelancer.save();

    res.status(201).json({
      message: "Proposal created successfully",
      proposal: newProposal,
    });
  } catch (error) {
    console.error("Error creating proposal for section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getProposalById = async (req, res) => {
  try {
    const { taskId, sectionId, proposalId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const section = task.sections.find((sec) => sec._id.equals(sectionId));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const proposal = section.proposal.id(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.status(200).json(proposal);
  } catch (error) {
    console.error("[GET_PROPOSAL_BY_ID]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProposal = async (req, res) => {
  try {
    const { taskId, sectionId, proposalId } = req.params;
    const { coverLetter } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const section = task.sections.find((sec) => sec._id.equals(sectionId));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const proposal = section.proposal.id(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    proposal.coverLetter = coverLetter;
    await task.save();

    res.status(200).json(proposal);
  } catch (error) {
    console.error("[UPDATE_PROPOSAL]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProposal = async (req, res) => {
  try {
    const { taskId, sectionId, proposalId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const section = task.sections.find((sec) => sec._id.equals(sectionId));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const proposal = section.proposal.id(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    proposal.remove();
    await task.save();

    res.status(200).json({ message: "Proposal deleted successfully" });
  } catch (error) {
    console.error("[DELETE_PROPOSAL]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProposalsForSection = async (req, res) => {
  try {
    const { taskId, sectionId } = req.params;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the section within the task
    const section = task.sections.find((sec) => sec._id.equals(sectionId));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Retrieve all proposals for the section
    const proposals = section.proposal;

    res.status(200).json(proposals);
  } catch (error) {
    console.error("[GET_PROPOSALS_FOR_SECTION]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProposal,
  getProposalById,
  updateProposal,
  deleteProposal,
  getProposalsForSection,
};

module.exports = {
  createProposal,
  getProposalById,
  getProposalsForSection,
  updateProposal,
  deleteProposal,
};
