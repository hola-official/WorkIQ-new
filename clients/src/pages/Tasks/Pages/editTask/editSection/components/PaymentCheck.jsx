import { useState } from "react";
import {
  Button,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Flex,
  Text,
} from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/CustomConnectButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../../api/axios";

const schema = z.object({
  paymentMethod: z.enum(["crypto", "fiat"]).default("fiat"),
});

const PaymentCheck = ({ taskId, sectionId, setRefetchSection, initialData }) => {
  const { paymentWallet, stripeOnboardingComplete } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected } = useAccount();
  const axiosInstance = useAxiosInstance();
  const { showToast } = useShowToast();
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: initialData.isCryptoPost ? "crypto" : "fiat",
    },
  });

  const onSubmit = async (data) => {
    if (!isConnected) {
      // Don't submit if wallet needs to be connected
      return;
    }
    try {
      setIsSubmitting(true);
      const updatedData = {
        isCryptoPost: data.paymentMethod === "crypto",
      };
      await axiosInstance.put(
        `tasks/edit-task/${taskId}/section/${sectionId}`,
        JSON.stringify(updatedData)
      );
      showToast("Success", "Task updated successfully", "success");
      setRefetchSection((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showToast(
        "Error",
        "Something went wrong" ||
        error.response.data.message ||
        error.response.data.error,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex-col flex justify-between">
        <Text>Select crypto as payment method for this section.</Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2">
            {isConnected ? (
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
              >
                <FormLabel htmlFor="crypto" mb="0" className="text-lg">
                  {`USDC Payment ${paymentWallet ? `(${truncateWalletAddress(paymentWallet)})` : ""
                    }`}
                </FormLabel>
                <Switch
                  id="crypto"
                  isChecked={getValues("paymentMethod") === "crypto"}
                  isDisabled={initialData.isCryptoPost === true && initialData.isPublished === true || initialData.isPublished === true || !isConnected && !paymentWallet}
                  onChange={(e) => {
                    setValue("paymentMethod", e.target.checked ? "crypto" : "fiat");
                    onSubmit({ paymentMethod: e.target.checked ? "crypto" : "fiat" });
                  }}
                />
              </FormControl>
            ) : (
              <div>
                <p className="text-base mb-2">
                  Please click on connect wallet below to use this feature
                </p>
              </div>
            )}
            {errors.paymentMethod && (
              <FormErrorMessage>{errors.paymentMethod.message}</FormErrorMessage>
            )}
            <Flex justify="end">
              {!isConnected && <CustomConnectButton />}
            </Flex>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentCheck;