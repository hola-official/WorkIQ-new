const TASK_MANAGEMENT_CA = "0x863a65fC1A6FBf95b90ac9e32E851fD9977AC589";

const TASK_MANAGEMENT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_usdcTokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "OrderCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newPercentage",
        type: "uint256",
      },
    ],
    name: "PlatformFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PlatformFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "SectionApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "freelancerId",
        type: "string",
      },
    ],
    name: "SectionAssigned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "completionTimestamp",
        type: "uint256",
      },
    ],
    name: "SectionCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "SectionDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "freelancerId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "SectionPaymentClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "SectionPublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "SectionReadyForReview",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
    ],
    name: "SectionUnpublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "client",
        type: "address",
      },
    ],
    name: "TaskCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
    ],
    name: "TaskDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
    ],
    name: "TaskPublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "taskId",
        type: "string",
      },
    ],
    name: "TaskUnpublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "UserAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "UserWithdrawal",
    type: "event",
  },
  {
    inputs: [],
    name: "ADDRESS_CHANGE_COOLDOWN",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CANCEL_ORDER_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "approveSection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_freelancerId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_clientId",
        type: "string",
      },
    ],
    name: "assignSectionToFreelancer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "checkAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "claimSectionPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "completeSection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "deleteSection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "deleteTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "fundPlatform",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsersEscrowBalances",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "getUserBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
    ],
    name: "getUserEscrowBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeePercentage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "tasks",
    outputs: [
      {
        internalType: "address",
        name: "client",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isPublished",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "taskId",
        type: "string",
      },
      {
        internalType: "string",
        name: "sectionId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "sectionPrice",
        type: "uint256",
      },
    ],
    name: "toggleSectionPublicationStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newFeePercentage",
        type: "uint256",
      },
    ],
    name: "updatePlatformFeePercentage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
      {
        internalType: "address",
        name: "_newAddress",
        type: "address",
      },
    ],
    name: "updateUserAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdcToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userIds",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "usersById",
    outputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "usdcBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "escrowBalance",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isRegistered",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "lastAddressChange",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_userId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawUserBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = {
  TASK_MANAGEMENT_CA,
  TASK_MANAGEMENT_ABI,
};
