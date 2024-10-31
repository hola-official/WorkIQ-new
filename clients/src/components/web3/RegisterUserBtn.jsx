import { useTaskManagement } from "@/hooks/useTaskManagement";
import React, { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import useShowToast from "@/hooks/useShowToast";

const RegisterUserBtn = ({ label, className }) => {
    const [toastId, setToastId] = useState(null);
    const { showToast, dismissToast, loadingToast, successToast, errorToast } = useShowToast();
    const { address } = useAccount();
    const {
        registerUser,
        registerUserHash,
        isRegisterUserPending,
        registerUserError,
    } = useTaskManagement();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: registerUserHash,
        });
    const { _id: userId } = useAuth();

    console.log(registerUserHash)
    
    useEffect(() => {
        if (isRegisterUserPending) {
            const newToastId = loadingToast("Waiting for approval from wallet...");
            setToastId(newToastId);
            console.log("Transaction is pending...");
        }
        if (isConfirming) {
            if (toastId) dismissToast(toastId);
            const newToastId = loadingToast("Waiting for confirmation on the blockchain...");
            setToastId(newToastId);
            console.log("Waiting for confirmation...");
        }
        if (isConfirmed) {
            console.log("Transaction confirmed!");
            successToast("Registration successful!", { id: toastId });
        }
        if (registerUserError) {
            errorToast(registerUserError, { id: toastId });
        }
    }, [isRegisterUserPending, isConfirming, isConfirmed, registerUserError]);

    const handleRegister = async () => {
        // registerUser(userId);
        console.log("Starting registration process...");
        try {
            console.log("Calling registerUser with:", userId, address);
            const result = await registerUser(userId, address);
            console.log("registerUser result:", result);
            if (!result) {
                console.log("checkConnectionAndChain failed");
                errorToast("Failed to initiate transaction. Please check your wallet connection.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            errorToast(error.message || "An error occurred during registration.");
        }
    };

    return (
        <Button
            isDisabled={isRegisterUserPending || isConfirming}
            onClick={handleRegister}
            className={className}
            colorScheme={'blue'}
            borderRadius={'lg'}
            size={["sm", "md"]}
        >
            {isRegisterUserPending || isConfirming
                ? "Registering..."
                : label || "Register User"}
        </Button>
    );
};

export default RegisterUserBtn;
