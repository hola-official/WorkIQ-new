// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TaskManagement is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdcToken;
    uint256 public platformFeePercentage = 10;
    uint256 public constant CANCEL_ORDER_DELAY = 1 days;
    uint256 public constant ADDRESS_CHANGE_COOLDOWN = 10 days;

    struct Section {
        string sectionId;
        uint256 price;
        address assignee;
        bool isPublished;
        bool isCompleted;
        bool isApproved;
        uint256 completionTimestamp;
        uint256 claimableTimestamp;
    }

    struct Task {
        address client;
        uint256 totalAmount;
        mapping(string => Section) sections;
        string[] sectionIds;
        bool isPublished;
    }

    struct User {
        string id;
        address walletAddress;
        uint256 usdcBalance;
        uint256 escrowBalance;
        bool isRegistered;
        uint256 lastAddressChange;
    }

    mapping(string => User) public usersById;
    string[] public userIds;

    mapping(string => Task) public tasks;

    event UserRegistered(string id, address walletAddress);
    event UserAddressUpdated(string id, address oldAddress, address newAddress);
    event TaskCreated(string taskId, address client);
    event TaskPublished(string taskId);
    event TaskUnpublished(string taskId);
    event TaskDeleted(string taskId);
    event SectionPublished(string taskId, string sectionId);
    event SectionUnpublished(string taskId, string sectionId);
    event SectionDeleted(string taskId, string sectionId);
    event SectionCompleted(
        string taskId,
        string sectionId,
        uint256 completionTimestamp
    );
    event SectionApproved(string taskId, string sectionId);
    event SectionReadyForReview(string taskId, string sectionId);
    event SectionAssigned(string taskId, string sectionId, string freelancerId);
    event SectionPaymentClaimed(
        string taskId,
        string sectionId,
        string freelancerId,
        uint256 amount
    );
    event OrderCanceled(string taskId, string sectionId);
    event UserWithdrawal(string userId, uint256 amount);
    event PlatformFeeUpdated(uint256 newPercentage);
    event PlatformFunded(string userId, uint256 amount);

    constructor(address _usdcTokenAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function registerUser(string memory _id) external {
        require(!usersById[_id].isRegistered, "User already registered");
        require(!isAddressUsed(msg.sender), "Address already used");

        usersById[_id] = User({
            id: _id,
            walletAddress: msg.sender,
            usdcBalance: 0,
            escrowBalance: 0,
            isRegistered: true,
            lastAddressChange: block.timestamp
        });
        userIds.push(_id);

        emit UserRegistered(_id, msg.sender);
    }

    function isAddressUsed(address _address) internal view returns (bool) {
        for (uint256 i = 0; i < userIds.length; i++) {
            if (usersById[userIds[i]].walletAddress == _address) {
                return true;
            }
        }
        return false;
    }

    function updateUserAddress(
        string memory _id,
        address _newAddress
    ) external {
        require(usersById[_id].isRegistered, "User not registered");
        require(
            msg.sender == usersById[_id].walletAddress || msg.sender == owner(),
            "Unauthorized"
        );
        require(!isAddressUsed(_newAddress), "New address already used");
        require(
            block.timestamp >=
                usersById[_id].lastAddressChange + ADDRESS_CHANGE_COOLDOWN,
            "Address change cooldown not elapsed"
        );

        address oldAddress = usersById[_id].walletAddress;
        usersById[_id].walletAddress = _newAddress;
        usersById[_id].lastAddressChange = block.timestamp;

        emit UserAddressUpdated(_id, oldAddress, _newAddress);
    }

    function toggleSectionPublicationStatus(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId,
        uint256 sectionPrice
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];

        // If the task doesn't exist, create a new one
        if (task.client == address(0)) {
            task.client = msg.sender;
            task.isPublished = false; // Start as unpublished
            task.totalAmount = 0;
            emit TaskCreated(taskId, msg.sender);
        }

        require(
            msg.sender == task.client,
            "Only client can toggle section publication"
        );

        Section storage section = task.sections[sectionId];
        if (section.price == 0) {
            // Section not found in the task, create a new one
            task.sections[sectionId] = Section({
                sectionId: sectionId,
                price: sectionPrice,
                assignee: address(0),
                isPublished: false,
                isCompleted: false,
                isApproved: false,
                completionTimestamp: 0,
                claimableTimestamp: 0
            });
            task.sectionIds.push(sectionId);
            section = task.sections[sectionId]; // Update the section reference
        }

        User storage user = usersById[_userId];

        if (!section.isPublished) {
            require(user.usdcBalance >= section.price, "Insufficient balance");
            user.usdcBalance -= section.price;
            user.escrowBalance += section.price;
            section.isPublished = true;
            task.totalAmount += section.price;
            emit SectionPublished(taskId, sectionId);
        } else {
            require(
                section.assignee == address(0),
                "Cannot unpublish assigned section"
            );
            require(!section.isCompleted, "Cannot unpublish completed section");
            user.usdcBalance += section.price;
            user.escrowBalance -= section.price;
            section.isPublished = false;
            task.totalAmount -= section.price;
            emit SectionUnpublished(taskId, sectionId);
        }

        // Check if all sections are unpublished
        bool allUnpublished = true;
        for (uint256 i = 0; i < task.sectionIds.length; i++) {
            if (task.sections[task.sectionIds[i]].isPublished) {
                allUnpublished = false;
                break;
            }
        }

        // Update task publication status
        if (allUnpublished && task.isPublished) {
            task.isPublished = false;
            emit TaskUnpublished(taskId);
        } else if (!allUnpublished && !task.isPublished) {
            task.isPublished = true;
            emit TaskPublished(taskId);
        }
    }

    function assignSectionToFreelancer(
        string calldata taskId,
        string calldata sectionId,
        string memory _freelancerId,
        string memory _clientId
    ) external nonReentrant {
        require(usersById[_clientId].isRegistered, "Client not registered");
        require(
            msg.sender == usersById[_clientId].walletAddress,
            "Unauthorized"
        );
        require(
            usersById[_freelancerId].isRegistered,
            "Freelancer not registered"
        );

        Task storage task = tasks[taskId];
        require(
            msg.sender == task.client,
            "Only task client can assign sections"
        );

        Section storage section = task.sections[sectionId];
        require(section.assignee == address(0), "Section already assigned");
        require(section.isPublished, "Section is not published");

        section.assignee = usersById[_freelancerId].walletAddress;
        emit SectionAssigned(taskId, sectionId, _freelancerId);
    }

    function completeSection(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        Section storage section = task.sections[sectionId];
        require(
            msg.sender == section.assignee,
            "Only assignee can complete section"
        );
        require(section.isPublished, "Section is not published");
        require(!section.isCompleted, "Section already completed");

        // Mark the section as completed by the freelancer
        section.isCompleted = true;
        section.completionTimestamp = block.timestamp;
        section.claimableTimestamp = block.timestamp + CANCEL_ORDER_DELAY;

        emit SectionCompleted(taskId, sectionId, section.completionTimestamp);
        emit SectionReadyForReview(taskId, sectionId);
    }

    function claimSectionPayment(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        Section storage section = task.sections[sectionId];
        require(
            msg.sender == section.assignee,
            "Only assignee can claim payment"
        );
        require(section.isCompleted, "Section not completed");
        require(!section.isApproved, "Section already approved");
        require(
            block.timestamp >= section.completionTimestamp + 4 days,
            "Not yet claimable"
        );
        User storage client = usersById[getUserIdByAddress(task.client)];
        User storage assignee = usersById[_userId];

        uint256 platformFee = (section.price * platformFeePercentage) / 100;
        uint256 assigneePayment = section.price - platformFee;

        client.escrowBalance -= section.price;
        assignee.usdcBalance += assigneePayment;

        section.isApproved = true;

        emit SectionPaymentClaimed(taskId, sectionId, _userId, assigneePayment);
    }

    function approveSection(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId,
        string memory _freelancerId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        Section storage section = task.sections[sectionId];
        require(msg.sender == task.client, "Only client can approve section");
        require(section.isCompleted, "Section not completed");
        require(!section.isApproved, "Section already approved");

        User storage client = usersById[getUserIdByAddress(task.client)];
        User storage assignee = usersById[_freelancerId];

        uint256 platformFee = (section.price * platformFeePercentage) / 100;
        uint256 assigneePayment = section.price - platformFee;

        client.escrowBalance -= section.price;
        assignee.usdcBalance += assigneePayment;

        section.isApproved = true;

        emit SectionApproved(taskId, sectionId);
    }

    function fundPlatform(
        string memory _userId,
        uint256 amount
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");
        require(amount > 0, "Amount must be greater than 0");

        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        usersById[_userId].usdcBalance += amount;

        emit PlatformFunded(_userId, amount);
    }

    function withdrawUserBalance(
        string memory _userId,
        uint256 amount
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");
        require(
            usersById[_userId].usdcBalance >= amount,
            "Insufficient balance"
        );

        usersById[_userId].usdcBalance -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");

        emit UserWithdrawal(_userId, amount);
    }

    function getUserBalance(
        string memory _userId
    ) external view returns (uint256) {
        return usersById[_userId].usdcBalance;
    }

    // Add this function to get escrow balance for a specific user
    function getUserEscrowBalance(
        string memory _userId
    ) external view returns (uint256) {
        return usersById[_userId].escrowBalance;
    }

    // Add this function for admin to see all users' escrow balances
    function getAllUsersEscrowBalances()
        external
        view
        onlyOwner
        returns (string[] memory, uint256[] memory)
    {
        string[] memory ids = new string[](userIds.length);
        uint256[] memory balances = new uint256[](userIds.length);

        for (uint256 i = 0; i < userIds.length; i++) {
            ids[i] = userIds[i];
            balances[i] = usersById[userIds[i]].escrowBalance;
        }

        return (ids, balances);
    }

    function getContractBalance() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    function updatePlatformFeePercentage(
        uint256 newFeePercentage
    ) external onlyOwner {
        require(newFeePercentage <= 20, "Fee percentage too high");
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        require(usdcBalance > 0, "No balance to withdraw");
        require(usdcToken.transfer(owner(), usdcBalance), "Transfer failed");
    }

    function deleteTask(
        string calldata taskId,
        string memory _userId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        require(msg.sender == task.client, "Only client can delete the task");

        for (uint256 i = 0; i < task.sectionIds.length; i++) {
            Section storage section = task.sections[task.sectionIds[i]];
            if (section.isPublished) {
                User storage user = usersById[getUserIdByAddress(task.client)];
                user.usdcBalance += section.price;
                user.escrowBalance -= section.price;
                task.totalAmount -= section.price;
                emit SectionUnpublished(taskId, task.sectionIds[i]);
            }
            if (section.assignee != address(0)) {
                revert("Cannot delete task with assigned sections");
            }
        }

        delete tasks[taskId];
        emit TaskDeleted(taskId);
    }

    function deleteSection(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        Section storage section = task.sections[sectionId];
        require(
            msg.sender == task.client,
            "Only client can delete the section"
        );
        require(
            section.assignee == address(0),
            "Cannot delete assigned section"
        );

        if (section.isPublished) {
            User storage user = usersById[getUserIdByAddress(task.client)];
            user.usdcBalance += section.price;
            user.escrowBalance -= section.price;
            task.totalAmount -= section.price;
            emit SectionUnpublished(taskId, sectionId);
        }

        // Remove the section from the task
        for (uint256 i = 0; i < task.sectionIds.length; i++) {
            if (
                keccak256(bytes(task.sectionIds[i])) ==
                keccak256(bytes(sectionId))
            ) {
                task.sectionIds[i] = task.sectionIds[
                    task.sectionIds.length - 1
                ];
                task.sectionIds.pop();
                break;
            }
        }
        delete task.sections[sectionId];

        emit SectionDeleted(taskId, sectionId);
    }

    function cancelOrder(
        string calldata taskId,
        string calldata sectionId,
        string memory _userId
    ) external nonReentrant {
        require(usersById[_userId].isRegistered, "User not registered");
        require(msg.sender == usersById[_userId].walletAddress, "Unauthorized");

        Task storage task = tasks[taskId];
        Section storage section = task.sections[sectionId];
        require(msg.sender == task.client, "Only client can cancel the order");
        require(section.isPublished, "Section is not published");
        require(section.isCompleted, "Section is not completed");
        require(!section.isApproved, "Section is already approved");
        require(
            block.timestamp <= section.completionTimestamp + CANCEL_ORDER_DELAY,
            "Cancellation delay elapsed"
        );

        // Refund the escrow balance to the client
        User storage client = usersById[getUserIdByAddress(task.client)];
        client.usdcBalance += section.price;
        client.escrowBalance -= section.price;

        // Reset the section status
        section.isCompleted = false;
        section.isApproved = false;
        section.completionTimestamp = 0;

        // Assign the section to a new freelancer
        section.assignee = address(0);

        emit OrderCanceled(taskId, sectionId);
    }

    function getUserIdByAddress(
        address userAddress
    ) internal view returns (string memory) {
        for (uint256 i = 0; i < userIds.length; i++) {
            if (usersById[userIds[i]].walletAddress == userAddress) {
                return userIds[i];
            }
        }
        revert("User not found");
    }

    function checkAllowance(
        address _user,
        uint256 _amount
    ) public view returns (bool) {
        return usdcToken.allowance(_user, address(this)) >= _amount;
    }
}
