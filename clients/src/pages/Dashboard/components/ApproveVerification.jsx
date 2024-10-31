import {
  Box,
  Flex,
  Center,
  Stack,
  Text,
  Button,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAxiosInstance } from "../../../../api/axios";
import axios from "axios";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";

const ApproveVerification = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();

  console.log("I am rendering confirm email");

  useEffect(() => {
    console.log("I am rendering useEffect", "loading:" + loading);
    const source = axios.CancelToken.source();

    const getConfirmation = async () => {
      console.log("I am rendering  getConfirmation function");
      try {
        const response = await axiosInstance.post(
          `users/verify/${token}`,
          { cancelToken: source.token }
        );
        setConfirmed(true);
        console.log(response)
      } catch (error) {
        console.log(error);
        // navigate("/link-expired");
      } finally {
        setLoading(false);
      }
    };

    if (loading && !confirmed) getConfirmation();

    return () => {
      source.cancel();
    };
  }, [loading]);

  if (!confirmed && loading) {
    return <Spinner />
  }

  return (
    <>
      <Flex
        bg={"#EBF5FE"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        py={{ base: 5, md: 10, lg: 20 }}
        px={{ base: 2, md: 5, lg: 8 }}
      >
        <IconButton
          isRound={true}
          variant="solid"
          bg={"#3D843C"}
          color={"#fff"}
          aria-label="Done"
          fontSize="25px"
          icon={<CheckIcon />}
        />

        <Text
          as={"h1"}
          mt={{ base: 2, md: 5 }}
          fontWeight={{ base: 400, md: 600, lg: 800 }}
          fontSize={{ base: "lg", sm: "xl", md: "2xl", lg: "3xl" }}
        >
          The user has been Verified
        </Text>
      </Flex>

      <Center py={6}>
        <Box
          maxW={{ base: "80%", sm: "25rem", md: "35rem" }}
          bg={useColorModeValue("white", "gray.800")}
          boxShadow={"2xl"}
          rounded={"md"}
          overflow={"hidden"}
        >
          <Stack textAlign={"center"} p={8} color={"#3D843C"} align={"center"}>
            <Text
              fontSize={{ base: "md", md: "md", lg: "xl" }}
              fontWeight={800}
              p={2}
              px={3}
              color={"black.500"}
            >
              Activated
            </Text>
          </Stack>

          <Box
            bg={useColorModeValue("gray.50", "gray.900")}
            textAlign={"center"}
            px={6}
            py={4}
          >
            <Text fontSize={{ base: "md", md: "xl", lg: "2xl" }}>
              The user has been verified.
            </Text>
          </Box>
        </Box>
      </Center>
      <Footer />
    </>
  );
};

export default ApproveVerification;
