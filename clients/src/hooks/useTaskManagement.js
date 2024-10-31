import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  TASK_MANAGEMENT_ABI,
  TASK_MANAGEMENT_CA,
  USDC_ABI,
  USDC_CA,
} from "@/contract/taskManagement";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useAuth from "./useAuth";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import useShowToast from "./useShowToast";

const CORRECT_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID, 10);

export function useTaskManagement() {
  const { address, isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { paymentWallet } = useAuth();
  const { showToast } = useShowToast();

  const truncateAddress = truncateWalletAddress(paymentWallet);

  const checkConnectionAndChain = useCallback(async () => {
    if (!isConnected) {
      showToast("Error", "Please connect your wallet.", "error");
      openConnectModal?.();
      return false;
    }
    if (paymentWallet !== address) {
      showToast(
        "Error",
        `Please connect the correct wallet ${truncateAddress}.`,
        "error"
      );
      return false;
    }
    if (chain?.id !== CORRECT_CHAIN_ID) {
      showToast("Error", "Switching to the correct network...", "error");
      try {
        await switchChain({ chainId: CORRECT_CHAIN_ID });
      } catch (error) {
        console.error("Failed to switch network:", error);
        showToast(
          "Error",
          "Failed to switch network. Please switch manually.",
          "error"
        );
        return false;
      }
    }
    return true;
  }, [
    isConnected,
    openConnectModal,
    chain,
    switchChain,
    paymentWallet,
    address,
    showToast,
  ]);

  const wrapWithConnectionAndChainCheck = useCallback(
    (writeFunction) => {
      return async (...args) => {
        if (await checkConnectionAndChain()) {
          return writeFunction(...args);
        }
      };
    },
    [checkConnectionAndChain]
  );

  // USDC Approval
  const {
    writeContract: approveUSDCRaw,
    data: approveDataHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract({
    address: USDC_CA,
    abi: USDC_ABI,
    functionName: "approve",
  });

  const approveUSDC = wrapWithConnectionAndChainCheck((amount) => {
    console.log("Inside approveUSDC, amount:", amount);
    return approveUSDCRaw({
      address: USDC_CA,
      abi: USDC_ABI,
      functionName: "approve",
      args: [TASK_MANAGEMENT_CA, parseUnits(amount, 6)],
    });
  });

  // Task Management Contract Functions
  const {
    writeContract: registerUserRaw,
    data: registerUserHash,
    isPending: isRegisterUserPending,
    error: registerUserError,
  } = useWriteContract();

  const {
    writeContract: fundPlatformRaw,
    data: fundPlatformHash,
    isPending: isFundPlatformPending,
    error: fundPlatformError,
  } = useWriteContract();

  const {
    writeContract: withdrawUserBalanceRaw,
    data: withdrawUserBalanceHash,
    isPending: isWithdrawUserBalancePending,
    error: withdrawUserBalanceError,
  } = useWriteContract();

  const {
    writeContract: updateUserAddressRaw,
    data: updateUserAddressHash,
    isPending: isUpdateUserAddressPending,
    error: updateUserAddressError,
  } = useWriteContract();

  const {
    writeContract: toggleSectionPublicationStatusRaw,
    data: toggleSectionPublicationStatusHash,
    isPending: isToggleSectionPublicationStatusPending,
    error: toggleSectionPublicationStatusError,
  } = useWriteContract();

  const {
    writeContract: approveSectionRaw,
    data: approveSectionHash,
    isPending: isApproveSectionPending,
    error: approveSectionError,
  } = useWriteContract();

  const {
    writeContract: assignSectionToFreelancerRaw,
    data: assignSectionToFreelancerHash,
    isPending: isAssignSectionToFreelancerPending,
    error: assignSectionToFreelancerError,
  } = useWriteContract();

  const {
    writeContract: cancelOrderRaw,
    data: cancelOrderHash,
    isPending: isCancelOrderPending,
    error: cancelOrderError,
  } = useWriteContract();

  const {
    writeContract: claimSectionPaymentRaw,
    data: claimSectionPaymentHash,
    isPending: isClaimSectionPaymentPending,
    error: claimSectionPaymentError,
  } = useWriteContract();

  const {
    writeContract: completeSectionRaw,
    data: completeSectionHash,
    isPending: isCompleteSectionPending,
    error: completeSectionError,
  } = useWriteContract();

  const {
    writeContract: deleteSectionRaw,
    data: deleteSectionHash,
    isPending: isDeleteSectionPending,
    error: deleteSectionError,
  } = useWriteContract();

  const {
    writeContract: deleteTaskRaw,
    data: deleteTaskHash,
    isPending: isDeleteTaskPending,
    error: deleteTaskError,
  } = useWriteContract();

  // Implement contract functions
  const registerUser = wrapWithConnectionAndChainCheck((_id) =>
    registerUserRaw({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "registerUser",
      args: [_id],
    })
  );

  const fundPlatform = wrapWithConnectionAndChainCheck((_userId, amount) =>
    fundPlatformRaw({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "fundPlatform",
      args: [_userId, parseUnits(amount, 6)],
    })
  );

  const withdrawUserBalance = wrapWithConnectionAndChainCheck(
    (_userId, amount) =>
      withdrawUserBalanceRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "withdrawUserBalance",
        args: [_userId, parseUnits(amount, 6)],
      })
  );

  const updateUserAddress = wrapWithConnectionAndChainCheck(
    (_id, _newAddress) =>
      updateUserAddressRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "updateUserAddress",
        args: [_id, _newAddress],
      })
  );

  const toggleSectionPublicationStatus = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId, sectionPrice) =>
      toggleSectionPublicationStatusRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "toggleSectionPublicationStatus",
        args: [taskId, sectionId, _userId, parseUnits(sectionPrice, 6)],
      })
  );

  const approveSection = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId) =>
      approveSectionRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "approveSection",
        args: [taskId, sectionId, _userId],
      })
  );

  const assignSectionToFreelancer = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _freelancerId, _clientId) =>
      assignSectionToFreelancerRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "assignSectionToFreelancer",
        args: [taskId, sectionId, _freelancerId, _clientId],
      })
  );

  const cancelOrder = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId) =>
      cancelOrderRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "cancelOrder",
        args: [taskId, sectionId, _userId],
      })
  );

  const claimSectionPayment = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId) =>
      claimSectionPaymentRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "claimSectionPayment",
        args: [taskId, sectionId, _userId],
      })
  );

  const completeSection = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId) =>
      completeSectionRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "completeSection",
        args: [taskId, sectionId, _userId],
      })
  );

  const deleteSection = wrapWithConnectionAndChainCheck(
    (taskId, sectionId, _userId) =>
      deleteSectionRaw({
        address: TASK_MANAGEMENT_CA,
        abi: TASK_MANAGEMENT_ABI,
        functionName: "deleteSection",
        args: [taskId, sectionId, _userId],
      })
  );

  const deleteTask = wrapWithConnectionAndChainCheck((taskId, _userId) =>
    deleteTaskRaw({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "deleteTask",
      args: [taskId, _userId],
    })
  );

  // Read functions
  const getUserBalance = useCallback((_userId) => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "getUserBalance",
      args: [_userId],
    });
  }, []);

  const getContractBalance = useCallback(() => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "getContractBalance",
    });
  }, []);

  const checkAllowance = useCallback((address, amount) => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "checkAllowance",
      args: [address, parseUnits(amount, 6)],
    });
  }, []);

  const getUserEscrowBalance = useCallback((_userId) => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "getUserEscrowBalance",
      args: [_userId],
    });
  }, []);

  const getTaskDetails = useCallback((taskId) => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "tasks",
      args: [taskId],
    });
  }, []);

  const getUserDetails = useCallback((_userId) => {
    return useReadContract({
      address: TASK_MANAGEMENT_CA,
      abi: TASK_MANAGEMENT_ABI,
      functionName: "usersById",
      args: [_userId],
    });
  }, []);

  // Wait for transaction receipts
  const {
    isLoading: isRegisterUserProcessing,
    isSuccess: isRegisterUserComplete,
  } = useWaitForTransactionReceipt({ hash: registerUserHash });
  const {
    isLoading: isFundPlatformProcessing,
    isSuccess: isFundPlatformComplete,
  } = useWaitForTransactionReceipt({ hash: fundPlatformHash });
  const {
    isLoading: isWithdrawUserBalanceProcessing,
    isSuccess: isWithdrawUserBalanceComplete,
  } = useWaitForTransactionReceipt({ hash: withdrawUserBalanceHash });
  const {
    isLoading: isUpdateUserAddressProcessing,
    isSuccess: isUpdateUserAddressComplete,
  } = useWaitForTransactionReceipt({ hash: updateUserAddressHash });
  const {
    isLoading: isToggleSectionPublicationStatusProcessing,
    isSuccess: isToggleSectionPublicationStatusComplete,
  } = useWaitForTransactionReceipt({
    hash: toggleSectionPublicationStatusHash,
  });
  const {
    isLoading: isApproveSectionProcessing,
    isSuccess: isApproveSectionComplete,
  } = useWaitForTransactionReceipt({ hash: approveSectionHash });
  const {
    isLoading: isAssignSectionToFreelancerProcessing,
    isSuccess: isAssignSectionToFreelancerComplete,
  } = useWaitForTransactionReceipt({ hash: assignSectionToFreelancerHash });
  const {
    isLoading: isCancelOrderProcessing,
    isSuccess: isCancelOrderComplete,
  } = useWaitForTransactionReceipt({ hash: cancelOrderHash });
  const {
    isLoading: isClaimSectionPaymentProcessing,
    isSuccess: isClaimSectionPaymentComplete,
  } = useWaitForTransactionReceipt({ hash: claimSectionPaymentHash });
  const {
    isLoading: isCompleteSectionProcessing,
    isSuccess: isCompleteSectionComplete,
  } = useWaitForTransactionReceipt({ hash: completeSectionHash });
  const {
    isLoading: isDeleteSectionProcessing,
    isSuccess: isDeleteSectionComplete,
  } = useWaitForTransactionReceipt({ hash: deleteSectionHash });
  const { isLoading: isDeleteTaskProcessing, isSuccess: isDeleteTaskComplete } =
    useWaitForTransactionReceipt({ hash: deleteTaskHash });

  return {
    approveUSDC,
    approveDataHash,
    isApproving,
    approveError:
      approveError?.cause?.code === 4001
        ? "User denied transaction signature."
        : approveError?.cause?.reason,
    checkAllowance,

    registerUser,
    registerUserHash,
    isRegisterUserPending,
    isRegisterUserProcessing,
    isRegisterUserComplete,
    registerUserError:
      registerUserError?.cause?.code === 4001
        ? "User denied transaction signature."
        : registerUserError?.cause?.reason,

    fundPlatform,
    fundPlatformHash,
    isFundPlatformPending,
    isFundPlatformProcessing,
    isFundPlatformComplete,
    fundPlatformError:
      fundPlatformError?.cause?.code === 4001
        ? "User denied transaction signature."
        : fundPlatformError?.cause?.reason,

    withdrawUserBalance,
    withdrawUserBalanceHash,
    isWithdrawUserBalancePending,
    isWithdrawUserBalanceProcessing,
    isWithdrawUserBalanceComplete,
    withdrawUserBalanceError:
      withdrawUserBalanceError?.cause?.code === 4001
        ? "User denied transaction signature."
        : withdrawUserBalanceError?.cause?.reason,

    updateUserAddress,
    updateUserAddressHash,
    isUpdateUserAddressPending,
    isUpdateUserAddressProcessing,
    isUpdateUserAddressComplete,
    updateUserAddressError:
      updateUserAddressError?.cause?.code === 4001
        ? "User denied transaction signature."
        : updateUserAddressError?.cause?.reason,

    toggleSectionPublicationStatus,
    toggleSectionPublicationStatusHash,
    isToggleSectionPublicationStatusPending,
    isToggleSectionPublicationStatusProcessing,
    isToggleSectionPublicationStatusComplete,
    toggleSectionPublicationStatusError:
      toggleSectionPublicationStatusError?.cause?.code === 4001
        ? "User denied transaction signature."
        : toggleSectionPublicationStatusError?.cause?.reason,

    approveSection,
    approveSectionHash,
    isApproveSectionPending,
    isApproveSectionProcessing,
    isApproveSectionComplete,
    approveSectionError:
      approveSectionError?.cause?.code === 4001
        ? "User denied transaction signature."
        : approveSectionError?.cause?.reason,

    assignSectionToFreelancer,
    assignSectionToFreelancerHash,
    isAssignSectionToFreelancerPending,
    isAssignSectionToFreelancerProcessing,
    isAssignSectionToFreelancerComplete,
    assignSectionToFreelancerError:
      assignSectionToFreelancerError?.cause?.code === 4001
        ? "User denied transaction signature."
        : assignSectionToFreelancerError?.cause?.reason,

    cancelOrder,
    cancelOrderHash,
    isCancelOrderPending,
    isCancelOrderProcessing,
    isCancelOrderComplete,
    cancelOrderError:
      cancelOrderError?.cause?.code === 4001
        ? "User denied transaction signature."
        : cancelOrderError?.cause?.reason,

    claimSectionPayment,
    claimSectionPaymentHash,
    isClaimSectionPaymentPending,
    isClaimSectionPaymentProcessing,
    isClaimSectionPaymentComplete,
    claimSectionPaymentError:
      claimSectionPaymentError?.cause?.code === 4001
        ? "User denied transaction signature."
        : claimSectionPaymentError?.cause?.reason,

    completeSection,
    completeSectionHash,
    isCompleteSectionPending,
    isCompleteSectionProcessing,
    isCompleteSectionComplete,
    completeSectionError:
      completeSectionError?.cause?.code === 4001
        ? "User denied transaction signature."
        : completeSectionError?.cause?.reason,

    deleteSection,
    deleteSectionHash,
    isDeleteSectionPending,
    isDeleteSectionProcessing,
    isDeleteSectionComplete,
    deleteSectionError:
      deleteSectionError?.cause?.code === 4001
        ? "User denied transaction signature."
        : deleteSectionError?.cause?.reason,

    deleteTask,
    deleteTaskHash,
    isDeleteTaskPending,
    isDeleteTaskProcessing,
    isDeleteTaskComplete,
    deleteTaskError:
      deleteTaskError?.cause?.code === 4001
        ? "User denied transaction signature."
        : deleteTaskError?.cause?.reason,

    getUserBalance,
    getContractBalance,
    getUserEscrowBalance,
    getTaskDetails,
    getUserDetails,
  };
}
