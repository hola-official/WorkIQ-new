import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Switch, FormControl, FormLabel, FormErrorMessage, Box, Flex, Text } from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/CustomConnectButton";

export const ConfirmPublishModal = ({ children, onConfirm, price }) => {
  const { _id, status, paymentWallet, stripeOnboardingComplete } = useAuth();
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();

  const FormSchema = z.object({
    paymentMethod: z.enum(["usd", "crypto"]).optional(),
  }).refine((data) => data.paymentMethod !== undefined, {
    message: "You have to select at least one payment method.",
    path: ["paymentMethod"],
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentMethod: undefined,
    },
  });

  const items = [
    { id: "usd", label: "USD Payment" },
    {
      id: "crypto",
      label: `USDC Payment ${paymentWallet ? `(${truncateWalletAddress(paymentWallet)})` : ""}`,
    },
  ];

  const { isSubmitting, isValid, errors } = form.formState;
  const watchedPaymentMethod = form.watch("paymentMethod");

  const showConnectWallet = watchedPaymentMethod === "crypto" && !isConnected;

  const handleSubmit = (data) => {
    if (showConnectWallet) {
      // Don't submit if wallet needs to be connected
      return;
    }
    onConfirm({ paymentMethod: data.paymentMethod });
    setOpen(false);
  };

  const handleSwitchChange = (itemId) => {
    form.setValue("paymentMethod", itemId === watchedPaymentMethod ? undefined : itemId, {
      shouldValidate: true,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment Option</AlertDialogTitle>
          <AlertDialogDescription>
            Select the mode of payment you want for this section.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {items.map((item) => (
            <FormControl
              key={item.id}
              isInvalid={!!errors.paymentMethod}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={4}
            >
              <FormLabel htmlFor={item.id} mb="0">
                {item.label}
              </FormLabel>
              <Switch
                id={item.id}
                isChecked={watchedPaymentMethod === item.id}
                isDisabled={
                  (item.id === "crypto" && !paymentWallet) ||
                  (item.id === "usd" && !stripeOnboardingComplete) ||
                  !price
                }
                onChange={() => handleSwitchChange(item.id)}
              />
            </FormControl>
          ))}
          {errors.paymentMethod && (
            <FormErrorMessage>
              {errors.paymentMethod.message}
            </FormErrorMessage>
          )}
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {showConnectWallet ? (
              <CustomConnectButton />
            ) : (
              <Button
                colorScheme="blue"
                isLoading={isSubmitting}
                type="submit"
                isDisabled={(!isValid && price) || isSubmitting}
              >
                Submit
              </Button>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};