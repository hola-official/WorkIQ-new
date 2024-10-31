import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@chakra-ui/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertCircle, CheckCircle2, Loader2, Edit } from "lucide-react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "@/atoms/userAtom";
import { Link } from "react-router-dom";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/CustomConnectButton";
import { Switch, Flex, Text } from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import { formatUnits } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import { Check, Wallet } from "lucide-react";

const Withdraw = ({ showModal, setShowModal }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState(null);
  const [isUSDC, setIsUSDC] = useState(false);
  const axiosInstance = useAxiosInstance();
  const { showToast } = useShowToast();
  const user = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom);
  const [selectedWallet, setSelectedWallet] = useState("");
  const {
    withdrawUserBalance,
    getUserBalance,
    updateUserAddress,
    withdrawUserBalanceHash,
    isWithdrawUserBalancePending,
    withdrawUserBalanceError,
  } = useTaskManagement();
  const [toastId, setToastId] = useState(null);
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: withdrawUserBalanceHash,
  });
  const { loadingToast, successToast, errorToast, dismissToast } = useShowToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { isConnected, address } = useAccount();
  const { _id: userId, connectedWallets, paymentWallet } = useAuth();
  const { data: userUSDCBalance, refetch } = getUserBalance(userId);
  const [dialogContent, setDialogContent] = useState('main');

  const USDCBalance = Number(formatUnits(userUSDCBalance || 0, 6)) || 0;

  const fetchPayoutDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get("transactions/payout-details");
      setPayoutDetails(data);
    } catch (error) {
      console.error("Failed to fetch payout details:", error);
      setError("Failed to fetch payout details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isWithdrawUserBalancePending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
      // console.log("Transaction is pending...");
    }
    if (isConfirming) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast("Waiting for confirmation on the blockchain...");
      setToastId(newToastId);
      console.log("Waiting for confirmation...");
    }
    if (isConfirmed) {
      refetch();
      // console.log("Transaction confirmed!");
      successToast("Withdrawal successful!", { id: toastId });
      // Refetch the user's balance
      setShowModal(false)
    }
    if (withdrawUserBalanceError) {
      errorToast(withdrawUserBalanceError, { id: toastId });
    }
  }, [isWithdrawUserBalancePending, isConfirming, isConfirmed, withdrawUserBalanceError]);

  useEffect(() => {
    fetchPayoutDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > payoutDetails.availableBalance) {
      setError("Withdrawal amount exceeds available balance");
      return;
    }

    if (isUSDC) {
      handleUSDCWithdrawal();
    } else {
      handleStripeWithdrawal();
    }
  };

  const handleStripeWithdrawal = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.post("transactions/withdraw", {
        amount: parseFloat(amount),
      });

      setSuccess("Withdrawal initiated successfully!");
      showToast("Success", "Withdrawal initiated successfully!", "success");
      setAmount("");

      const newBalance = user.balance - parseFloat(amount);
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);

      fetchPayoutDetails();

      console.log(data)
    } catch (error) {
      console.error("Failed to initiate withdrawal:", error);
      setError("Failed to initiate withdrawal. Please try again later.");
      showToast("Error", "Failed to initiate withdrawal", "error");
    } finally {
      setIsLoading(false);
      setShowModal(false)
    }
  };

  const handleUSDCWithdrawal = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to withdraw USDC");
      return;
    }

    try {
      setIsLoading(true);
      const txn = await withdrawUserBalance(userId, amount);
      // setSuccess("USDC withdrawal initiated successfully!");
      // showToast("Success", "USDC withdrawal initiated successfully!", "success");
      // setAmount("");
      // setShowModal(false)
    } catch (error) {
      console.error("Failed to withdraw USDC:", error);
      setError("Failed to withdraw USDC. Please try again later.");
      showToast("Error", "Failed to withdraw USDC", "error");
    } finally {
      setIsLoading(false);
      // setIsWithdrawing(false);
    }
  };

  const handleWalletChange = async () => {
    try {
      await updateUserAddress(userId, selectedWallet);
      setDialogContent('main');
      showToast("Success", "Payment wallet updated successfully!", "success");
    } catch (error) {
      showToast("Error", "Failed to update payment wallet", "error");
    }
  };

  const renderMainContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Initiate Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
              ${isUSDC ? USDCBalance?.toFixed(2) || "0.00" : (payoutDetails?.availableBalance.toFixed(2))}
            </motion.span>
          </div>
          {isUSDC ? (
            <motion.div
              className="text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h3 className="text-lg font-semibold mb-2">Connected Wallets:</motion.h3>
              <motion.ul className="list-disc list-inside">
                {connectedWallets.map((wallet, index) => (
                  <motion.li
                    key={wallet}
                    className="mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {truncateWalletAddress(wallet)}
                    {wallet === paymentWallet && (
                      <motion.span
                        className="text-sm text-blue-600 ml-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        (Current Payment Wallet)
                      </motion.span>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ) : (
            payoutDetails?.bankAccount ? (
              <motion.div
                className="text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Bank Account: **** {payoutDetails?.bankAccount.last4} (
                {payoutDetails.bankAccount.bank_name})
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No bank account set up. Please set up a bank account in
                    your Stripe dashboard.
                  </AlertDescription>
                </Alert>

                <motion.div
                  className="mt-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={'/stripe-connect/refresh'}>
                    <Button className={'w-full'}>
                      Connect to stripe
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )
          )}
          <Flex align="center" justify="space-between" mb={4}>
            <Text fontWeight="bold">Withdrawal Method:</Text>
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
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  max={payoutDetails?.availableBalance}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
            {!isUSDC ? (
              <Button
                type="submit"
                className="w-full"
                colorScheme={'blue'}
                onClick={handleStripeWithdrawal}
                borderRadius={'md'}
                isDisabled={!payoutDetails?.bankAccount || isLoading || !amount}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Initiate Withdrawal"
                )}
              </Button>
            ) : isConnected ? (
              <Button
                type="submit"
                className="w-full"
                colorScheme={'blue'}
                borderRadius={'md'}
                onClick={handleUSDCWithdrawal}
                isDisabled={isLoading || !amount || isWithdrawUserBalancePending || isConfirming}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isWithdrawUserBalancePending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Initiate Withdrawal"
                )}
              </Button>
            ) : (
              <CustomConnectButton className="w-full rounded-md py-3" />
            )}
          </motion.form>
        </motion.div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant="success"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isUSDC ? <Button variant="outline" className="mt-4 w-full" onClick={() => setDialogContent('editWallet')}>
          <Edit className="mr-2 h-4 w-4" /> Update Payment Wallet
        </Button> : ''}
      </motion.div>
    </motion.div>
  );

  const renderEditWalletContent = () => (
    <motion.div
      className="space-y-4 px-4 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AlertDialogHeader>
        <AlertDialogTitle>Update Payment Wallet</AlertDialogTitle>
        <AlertDialogDescription>
          Select from the addresses below linked to your account to receive payments.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-2">
        {connectedWallets.map((wallet) => (
          <div
            key={wallet}
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedWallet === wallet
              ? "bg-blue-100 border border-blue-300"
              : "bg-gray-50 hover:bg-gray-100"
              }`}
            onClick={() => setSelectedWallet(wallet)}
          >
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{truncateWalletAddress(wallet)}</span>
            </div>
            {selectedWallet === wallet && (
              <Check className="h-5 w-5 text-blue-500" />
            )}
          </div>
        ))}
      </div>
      <AlertDialogFooter>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AlertDialogCancel onClick={() => setDialogContent('main')}>Cancel</AlertDialogCancel>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            colorScheme={'blue'}
            onClick={handleWalletChange}
            disabled={!selectedWallet}
          >
            Update
          </Button>
        </motion.div>
      </AlertDialogFooter>
    </motion.div>
  );

  return (
    <>
      <motion.p
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer"
      >
        Withdraw
      </motion.p>
      <AlertDialog
        open={showModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSuccess("");
            setShowModal(false);
            setDialogContent('main');
          }
        }}
      >
        <AlertDialogContent
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="w-full max-w-md"
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {dialogContent === 'main' ? renderMainContent() : renderEditWalletContent()}
            </AnimatePresence>
          </Card>
          {dialogContent === 'main' && (
            <AlertDialogFooter
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant={'outline'} onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </motion.div>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default Withdraw;