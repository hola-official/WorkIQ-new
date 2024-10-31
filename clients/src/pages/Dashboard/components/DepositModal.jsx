import React, { useState, useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useAxiosInstance } from "../../../../api/axios";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Flex,
  Text,
  Switch,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import CustomConnectButton from "@/components/CustomConnectButton";
import useShowToast from "@/hooks/useShowToast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "@/atoms/userAtom";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import useAuth from "@/hooks/useAuth";
import { parseUnits, formatUnits } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import RegisterUserBtn from "@/components/web3/RegisterUserBtn";

const apiKey = import.meta.env.VITE_STRIPE_KEY;

function DepositModal({ showDepositModal, setShowDepositModal, reloadData }) {
  const { showToast, dismissToast, loadingToast, successToast, errorToast } = useShowToast();
  const [amount, setAmount] = useState("");
  const [isUSDC, setIsUSDC] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [users, setUsers] = useState()
  const axiosInstance = useAxiosInstance();
  const user = useRecoilValue(userAtom);
  const { _id: userId } = useAuth();
  const setUser = useSetRecoilState(userAtom);
  const { isConnected, address } = useAccount();
  const [toastId, setToastId] = useState(null);

  const {
    getUserBalance,
    fundPlatform,
    fundPlatformHash,
    isFundPlatformPending,
    fundPlatformError,
    isFundPlatformComplete,
    approveUSDC,
    checkAllowance,
  } = useTaskManagement();

  const { data: userUSDCBalance, refetch } = getUserBalance(userId);
  const USDCBalance = Number(formatUnits(userUSDCBalance || 0, 6)) || 0;

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({
      hash: fundPlatformHash,
    });

  useEffect(() => {
    if (isFundPlatformPending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
    }
    if (isDepositConfirming) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast(
        "Waiting for confirmation on the blockchain..."
      );
      setToastId(newToastId);
    }
    if (isDepositConfirmed) {
      successToast(`${amount} USDC deposit successful!`, { id: toastId });
      refetch()
      setShowDepositModal(false);
      // reloadData();
    }
    if (fundPlatformError) {
      errorToast(fundPlatformError, { id: toastId });
    }
  }, [
    isFundPlatformPending,
    isDepositConfirming,
    isDepositConfirmed,
    fundPlatformError,
  ]);

  useEffect(() => {
    if (isUSDC && amount && isConnected) {
      checkApproval();
    }
  }, [isUSDC, amount, isConnected]);

  const checkApproval = async () => {
    const { data: allowance } = await checkAllowance(address, amount);
    setNeedsApproval(allowance < parseUnits(amount, 6));
  };

  const DepositFunds = async (payload) => {
    try {
      const { data } = await axiosInstance.post("transactions/deposit-funds", {
        token: payload,
        amount: parseFloat(amount),
      });
      if (data.status === "success") {
        setShowDepositModal(false);
        showToast("Success", `${data.message}`, "success");

        const newBalance = user.balance + data.data.depositAmount;
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        // reloadData();
      }
      return data;
    } catch (error) {
      console.error("Backend error:", error);
      showToast("Error", "There was an error processing your deposit", "error");
      return error.response.data;
    }
  };

  const onToken = async (token) => {
    try {
      const response = await DepositFunds(token);
      if (response.success) {
        showToast("Success", `${response.message}`, "success");
      } else {
        showToast("Error", `${response.message}`, "error");
      }
    } catch (error) {
      console.error("Error in onToken:", error);
      showToast("Error", `${error.message}`, "error");
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (isNaN(value) || parseFloat(value) <= 0) {
      showToast("Error", "Please enter a valid amount greater than $0.50", "error");
      setAmount("");
    } else {
      setAmount(value);
    }
  };

  const handleUSDCDeposit = async () => {
    setIsDepositing(true);
    try {
      if (!address) {
        throw new Error("No wallet address found");
      }

      const approvalTx = await approveUSDC(amount);
      // await approvalTx.wait(); // Wait for the approval transaction to be mined

      // Now that we've approved, we can deposit
      console.log('funding platform')
      await fundPlatform(userId, amount);

      if (isFundPlatformComplete) {
        const newBalance = user.usdcBalance + amount;
        const updatedUser = { ...user, usdcBalance: newBalance };
        setUser(updatedUser);
        // reloadData();
      }
      console.log(userId, amount)
    } catch (error) {
      console.error("Error in handleUSDCDeposit:", error);
      errorToast(error.message || "An error occurred during deposit.");
    } finally {
      setIsDepositing(false);
    }
  };

  useEffect(() => {
    handleGetUserInfo()
  }, [])


  const handleGetUserInfo = async () => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`)
      const data = res.data;
      console.log(data)
      setUsers(data)
    } catch (error) {
      console.error(error);
    }
  }

  console.log(USDCBalance?.toFixed(2))
  return (
    <AlertDialog open={showDepositModal} onOpenChange={setShowDepositModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deposit</AlertDialogTitle>
          <AlertDialogDescription>
            <form layout="vertical">
              <div className="flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Available Balance:
                  </span>
                  <motion.span
                    className="text-lg font-semibold"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    ${isUSDC ? USDCBalance?.toFixed(2) || "0.00" : user?.balance.toFixed(2) || "0.00"}
                  </motion.span>
                </div>
                <div className="mb-4">
                  <Stack spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="blue.300" fontSize="1.2em">
                        $
                      </InputLeftElement>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        required
                      />
                      <InputRightElement>
                        <CheckIcon color="blue.500" />
                      </InputRightElement>
                    </InputGroup>
                  </Stack>
                </div>
                <Flex align="center" justify="space-between" mb={4}>
                  <Text fontWeight="bold">Payment Method:</Text>
                  <Flex align="center">
                    <Text mr={2}>USD</Text>
                    <Switch
                      isChecked={isUSDC}
                      onChange={() => setIsUSDC(!isUSDC)}
                      colorScheme="blue"
                    />
                    <Text ml={2}>USDC</Text>
                  </Flex>
                </Flex>
                <div className="flex justify-end gap-1 mt-4">
                  <Button
                    variant="outline"
                    size={["sm", "md"]}
                    onClick={() => setShowDepositModal(false)}
                  >
                    Cancel
                  </Button>
                  {!isUSDC ? (
                    <StripeCheckout
                      token={onToken}
                      currency="USD"
                      amount={parseFloat(amount) * 100}
                      shippingAddress
                      billingAddress
                      stripeKey={apiKey}
                    >
                      <Button colorScheme="blue" size={["sm", "md"]} isDisabled={!amount}>
                        Deposit with Stripe
                      </Button>
                    </StripeCheckout>
                  ) : isConnected ? (
                    (users?.paymentWallet || users?.paymentWalletRegisterComplete === true ? <Button
                      colorScheme="blue"
                      size={["sm", "md"]}
                      onClick={handleUSDCDeposit}
                      isDisabled={!amount || isDepositing || isFundPlatformPending || isDepositConfirming}
                      isLoading={isDepositing || isFundPlatformPending || isDepositConfirming}
                    >
                      Deposit USDC
                    </Button> : <RegisterUserBtn label={"Register"} />)
                  ) : (
                    <CustomConnectButton className="w-full rounded-md py-3" />
                  )}
                </div>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DepositModal;