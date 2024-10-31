import { useCallback } from 'react';
import { useReadContract, useWriteContract, useTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { FREELANCE_ESCROW_CA, FREELANCE_ESCROW_ABI } from '../contract/freelanceEscrow';

export function useFreelanceEscrow() {
  // Register Freelancer
  const { writeContract: registerFreelancer } = useWriteContract();

  // Update Freelancer Address
  const { writeContract: updateFreelancerAddress } = useWriteContract();

  // Withdraw Freelancer Balance
  const { writeContract: withdrawFreelancerBalance } = useWriteContract();

  // Create Order
  const { writeContract: createOrder, data: createOrderData } = useWriteContract();

  const { isLoading: isOrderProcessing, isSuccess: isOrderComplete } = useTransaction({
    hash: createOrderData?.hash,
  });

  // Add Funds to Platform
  const { writeContract: addFundsToPlatform } = useWriteContract();

  // Refund Payment
  const { writeContract: refundPayment } = useWriteContract();

  // Release Payment
  const { writeContract: releasePayment } = useWriteContract();

  // Withdraw User Balance
  const { writeContract: withdrawUserBalance } = useWriteContract();

  // Emergency Withdraw
  const { writeContract: emergencyWithdraw } = useWriteContract();

  // Get Freelancer Balance
  const getFreelancerBalance = useCallback((freelancerId) => {
    return useReadContract({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'getFreelancerBalance',
      args: [freelancerId],
    });
  }, []);

  // Get Platform Fees
  const { data: platformFees, isError: isPlatformFeesError, isLoading: isPlatformFeesLoading } = useReadContract({
    address: FREELANCE_ESCROW_CA,
    abi: FREELANCE_ESCROW_ABI,
    functionName: 'getPlatformFees',
  });

  // Get Contract Balance
  const { data: contractBalance, isError: isContractBalanceError, isLoading: isContractBalanceLoading } = useReadContract({
    address: FREELANCE_ESCROW_CA,
    abi: FREELANCE_ESCROW_ABI,
    functionName: 'getContractBalance',
  });

  // Format Units
  const formattedPlatformFees = platformFees ? formatUnits(platformFees, 6) : '0';
  const formattedContractBalance = contractBalance ? formatUnits(contractBalance, 6) : '0';

  return {
    registerFreelancer: (freelancerId) => registerFreelancer({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'registerFreelancer',
      args: [freelancerId],
    }),
    updateFreelancerAddress: (freelancerId, newAddress) => updateFreelancerAddress({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'updateFreelancerAddress',
      args: [freelancerId, newAddress],
    }),
    withdrawFreelancerBalance: (freelancerId, amount) => withdrawFreelancerBalance({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'withdrawFreelancerBalance',
      args: [freelancerId, parseUnits(amount, 6)],
    }),
    createOrder: (freelancerId, amount) => createOrder({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'createOrder',
      args: [freelancerId, parseUnits(amount, 6)],
    }),
    addFundsToPlatform: (amount) => addFundsToPlatform({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'addFundsToPlatform',
      args: [parseUnits(amount, 6)],
    }),
    refundPayment: (orderId) => refundPayment({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'refundPayment',
      args: [orderId],
    }),
    releasePayment: (orderId) => releasePayment({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'releasePayment',
      args: [orderId],
    }),
    withdrawUserBalance: (amount) => withdrawUserBalance({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'withdrawUserBalance',
      args: [parseUnits(amount, 6)],
    }),
    emergencyWithdraw: () => emergencyWithdraw({
      address: FREELANCE_ESCROW_CA,
      abi: FREELANCE_ESCROW_ABI,
      functionName: 'emergencyWithdraw',
      args: [],
    }),
    getFreelancerBalance,
    platformFees: formattedPlatformFees,
    contractBalance: formattedContractBalance,
    isOrderProcessing,
    isOrderComplete,
    isPlatformFeesError,
    isPlatformFeesLoading,
    isContractBalanceError,
    isContractBalanceLoading,
  };
}
