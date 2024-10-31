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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import { useAxiosInstance } from "../../../api/axios";
import actToken from "../../atoms/activationTokenAtom";
import { useRecoilValue } from "recoil";

const VerifyEmailForm = () => {
  const [code, setCode] = useState();
  const axiosInstance = useAxiosInstance();
  const activationToken = useRecoilValue(actToken)
  const {showToast} = useShowToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/auth/reset-password/confirm",
        JSON.stringify({ activation_code: code, activation_token: activationToken })
      );
      console.log(response)
      if (!response) {
        console.log(response.error);
      }
      showToast("success", "Password reset successful", "success");
      navigate("/auth");
    } catch (error) {
      if (error?.response?.status === 400) {
        showToast("Error", "Code does not match", "error");
      } else {
        showToast("Error", "Failed to reset password", "error");
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

export default VerifyEmailForm;
