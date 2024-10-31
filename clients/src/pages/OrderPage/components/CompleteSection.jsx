import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@chakra-ui/react";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import useShowToast from "@/hooks/useShowToast";
import useAuth from "@/hooks/useAuth";
import CustomConnectButton from "@/components/CustomConnectButton";

const CompleteSection = ({ taskId, sectionId, freelancerAddress }) => {
  const {
    completeSection,
    completeSectionHash,
    isCompleteSectionPending,
    completeSectionError,
  } = useTaskManagement();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: completeSectionHash,
  });
  const { loadingToast, successToast, errorToast, dismissToast } = useShowToast();
  const [toastId, setToastId] = useState(null);
  const { _id: userId } = useAuth();
  const { isConnected, address } = useAccount();

  const handleCompleteSection = async () => {
    try {
      const result = await completeSection(taskId, sectionId, userId, freelancerAddress);
      console.log(`Mark Order as completed: ${result}`)
    } catch (error) {
      console.error("Failed to complete section:", error);
      errorToast("Failed to complete section. Please try again later.");
    }
  };

  useEffect(() => {
    if (isCompleteSectionPending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
    }
    if (isConfirming) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast("Waiting for confirmation on the blockchain...");
      setToastId(newToastId);
    }
    if (isConfirmed) {
      successToast("Section completed successfully!", { id: toastId });
      // You might want to update some state or trigger a re-fetch of data here
    }
    if (completeSectionError) {
      errorToast(completeSectionError, { id: toastId });
    }
  }, [isCompleteSectionPending, isConfirming, isConfirmed, completeSectionError]);

  if (address !== freelancerAddress) {
    return null; // Don't render the button if the connected wallet doesn't match
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isConnected ? <Button
        onClick={handleCompleteSection}
        isLoading={isCompleteSectionPending || isConfirming}
        loadingText="Processing"
        colorScheme="green"
      >
        Mark Completed
      </Button> :
        <CustomConnectButton className="w-full rounded-md py-3" />
      }
    </motion.div>
  );
};

export default CompleteSection;