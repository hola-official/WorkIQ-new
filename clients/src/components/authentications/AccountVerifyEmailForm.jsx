import { Center, Heading } from "@chakra-ui/react";
import {
  Button,
  FormControl,
  Flex,
  Input,
  Stack,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { PinInput, PinInputField } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import { useAxiosInstance } from "../../../api/axios";
import { useRecoilValue } from "recoil";
import actToken from "../../atoms/activationTokenAtom";
import { useAccount, useDisconnect } from "wagmi";

const AccountVerifyEmailForm = () => {
  const [code, setCode] = useState();
  const [seconds, setSeconds] = useState(60); // Initial countdown duration in seconds
  const activationToken = useRecoilValue(actToken)
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

  useEffect(() => {
    const disconectWallet = async () => {
      try {
        await disconnectAsync();
      } catch (error) {
        toast.error("Error disconnecting wallet");
      }
    };
    if (isConnected) disconectWallet();
  }, [isConnected]);

  useEffect(() => {
    let countdown = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          clearInterval(countdown); // Stop the countdown when it reaches 0
        }
        return prevSeconds === 0 ? 0 : prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(countdown); // Cleanup function to clear interval
  }, [seconds]); // Run effect only once when the component mounts

  const resetCountdown = () => {
    setSeconds(60); // Reset countdown duration to 60 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/auth/activate-account",
        JSON.stringify({ activation_code: code, activation_token: activationToken })
      );
      const { user } = response.data;
      await localStorage.setItem("user-workiq", JSON.stringify(user));

      console.log(response.data);
      if (response.status === 201) {
        showToast("success", "Account activated successfully", "success");
        navigate("/auth");
      } else {
        showToast("error", "Failed to activate account", "error");
        console.log(response.data.error); // Log the error message received from the server
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        showToast("error", error.response.data.error, "error");
      } else {
        showToast("error", error.response.data.error, "error");
      }
      console.log(error.response);
    }
  };



  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"sm"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={10}
      >
        <Center>
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
            Verify your Email
          </Heading>
        </Center>
        <Center
          fontSize={{ base: "sm", sm: "md" }}
          color={useColorModeValue("gray.800", "gray.400")}
        >
          We have sent code to your email
        </Center>
        <FormControl>
          <Center>
            <HStack>
              <PinInput otp size={{ base: "sm", md: "lg" }} value={code} onChange={(value) => setCode(value)}>
                {[...Array(6)].map((_, index) => (
                  <PinInputField key={index} />
                ))}
              </PinInput>

            </HStack>
          </Center>
        </FormControl>
        <Stack spacing={6}>
          <div className="flex mt-2 justify-between">
            <p>Didn&apos;t receive OTP? </p>

            {seconds > 0 ? (
              <div className="text-slate-600">
                Resend OTP in:{" "}
                {Math.floor(seconds / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(seconds % 60).toString().padStart(2, "0")}
              </div>
            ) : (
              <button
                className="text-blue-700 font-medium cursor-pointer hover:underline hover:text-blue-500"
                onClick={resetCountdown}
              >
                Resend OTP
              </button>
            )}
          </div>
          <Button
            bg={"blue.400"}
            size={{ base: 'md', md: 'lg' }}
            color={"white"}
            onClick={handleSubmit}
            _hover={{
              bg: "blue.500",
            }}
          >
            Verify
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default AccountVerifyEmailForm;
