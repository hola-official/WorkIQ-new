import { React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Link,
  Box,
  Checkbox,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CheckIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { useRecoilState, useSetRecoilState } from "recoil";
import authScreenAtom from "../../atoms/authAtom";
import { useState } from "react";
import userAtom from "../../atoms/userAtom";
import { prevPathAtom } from "../../atoms/prevPathAtom";
import useShowToast from "../../hooks/useShowToast";
import { useAxiosInstance } from "/api/axios";
import { getFingerprint } from "@/lib/fingerprint";
import tokenAtom from "@/atoms/tokenAtom";
import activationToken from "@/atoms/activationTokenAtom";
import VerifyDeviceOTP from "./VerifyDeviceOTP";
import CustomConnectButton from "../CustomConnectButton";

export default function SplitScreen() {
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [showPassword, setShowPassword] = useState(false);
  const setUsers = useSetRecoilState(userAtom);
  const [user, setUser] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showVerifyDevice, setShowVerifyDevice] = useState(false);
  const setActivationToken = useSetRecoilState(activationToken)
  const navigate = useNavigate();
  const [prevPath, setPrevPath] = useRecoilState(prevPathAtom);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useRecoilState(tokenAtom);
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();

  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/auth/login",
        JSON.stringify({ user, password, fingerprint })
      );
      const loggedUser = response.data.loggedUser;
      const data = response.data
      const token = response.data.accessToken;
      if (data.activationToken) {
        setEmail(data.email);
        setActivationToken(data.activationToken);

        return setShowVerifyDevice(true);
      }

      // console.log(data)
      // console.log(loggedUser)
      localStorage.setItem("user-workiq", JSON.stringify(loggedUser));
      localStorage.setItem("token", token);

      setToken(token);
      setUsers(loggedUser);
      // console.log(loggedUser)
      const localStoragePrevPath = localStorage?.getItem("localPrevPath");
      // Redirect to the originally requested route (or a default route)
      if (localStoragePrevPath) {
        localStorage.removeItem("localPrevPath");
        navigate(localStoragePrevPath);
      } else if (prevPath) {
        setPrevPath(null); // Clear the stored path
        navigate(prevPath);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        showToast(
          "Error",
          "This user registered with Google authentication, continue with google and create password",
          "error"
        );
      }
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };


  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

  const handleGoogleAuth = () => {
    window.location.href = `${baseUrl}/auth/googleauth`;
  }

  return (
    <Stack
      minH={"100vh"}
      overflowX={"hidden"}
      direction={{ base: "column", md: "row" }}
      className="loginSignup"
    >
      {!showVerifyDevice ? (
        <>
          <Flex p={8} flex={1} align={"center"} justify={"center"} bg={"#f6f6f6"}>
            <Stack
              spacing={4}
              w={{ base: "full", md: "md" }}
              maxW={"md"}
            // align={"center"}
            >
              <Heading >
                <Text fontSize={"4xl"}>Sign in</Text>
                <Text fontSize={"lg"} color={'#969696'}>Please login to continue to your account.</Text>
              </Heading>

              <Stack spacing={4}>
                <form onSubmit={handleSubmit}>
                  <Box
                    w={{ base: "100%", md: "80%", lg: "100%" }}
                    maxW="500px"
                    mx="auto"
                  >
                    <FormControl
                      isRequired
                      w={{ base: "l", md: "400px", lg: "500px" }}
                      maxW="500px"
                      mx="auto"
                      my={5}
                    >
                      <FormLabel>Email or username</FormLabel>
                      <Input
                        type={'text'}
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        placeholder="example@mail.com"
                        border={"1px solid black"}
                        required
                      />
                    </FormControl>

                    <FormControl
                      isRequired
                      w={{ base: "l", md: "400px", lg: "500px" }}
                      maxW="500px"
                      mx="auto"
                      my={5}
                    >
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? "text" : "password"}
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          placeholder="Enter password"
                          border={"1px solid black"}
                          required
                        />
                        <InputRightElement h={"full"}>
                          <Button
                            variant={"ghost"}
                            onClick={() =>
                              setShowPassword((showPassword) => !showPassword)
                            }
                          >
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Stack spacing={10}>
                      <Stack
                        direction={{ base: 'column', sm: 'row' }}
                        align={'start'}
                        justify={'space-between'}>
                        <Checkbox>Remember me</Checkbox>
                        <Text color={'blue.400'}><Link href="/forget-password">Forgot password?</Link></Text>
                      </Stack>
                      <Button
                        loadingText="Signing in"
                        w={{ base: "full", md: "400px", lg: "500px" }}
                        // size={{ base: "lg", md: "md" }}
                        bg={"blue.500"}
                        color={"white"}
                        _hover={{
                          bg: "blue.400",
                        }}
                        type="submit"
                        isLoading={loading}
                        mx="auto"
                      >
                        Sign In
                      </Button>
                    </Stack>
                    <Stack pt={6}>
                      <Text align={"center"}>
                        Don&apos;t have an account?{" "}
                        <Link
                          color={"blue.400"}
                          onClick={() => setAuthScreen("signup")}
                        >
                          Sign Up
                        </Link>
                      </Text>
                    </Stack>
                  </Box>
                </form>
              </Stack>
              <Flex align={'center'} flexDir={'column'} gap={2}>
                <Flex fontWeight={"3000"} gap={4}>
                  <Button
                    // bg={"#3B82F6"}
                    border={'1px solid black'}
                    _hover={{ bg: "white" }}
                    size={{ base: "sm", md: "md" }}
                    leftIcon={<FcGoogle size={24} />}
                    color={"black"}
                    onClick={handleGoogleAuth}
                  >
                    Continue with Google
                  </Button>

                </Flex>
                <CustomConnectButton className="w-full rounded-md py-3" />
              </Flex>

            </Stack>


          </Flex>
          <Flex
            flexDir={{ base: "column-reverse", md: "column" }}
            w={{ base: "full", md: "40%" }}
          >
            <Box
              position="relative"
              bgImage="url('/authImg.png')"
              bgPosition="center"
              bgRepeat="no-repeat"
              bgSize="cover"
              h={"100vh"}
              display={{ base: "none", md: "block" }}
            >
              <Box
                pos={"absolute"}
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                fontWeight={{ base: "3xl", md: "4xl", lg: "5xl" }}
                color="#fff"
                py={3}
                px={{ base: 4, md: 18 }}
                display={{ base: "none", md: "block" }}
              >
                <Text
                  as={"h2"}
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  fontWeight={{ base: "3xl", md: "4xl", lg: "5xl" }}
                >
                  Success starts here
                </Text>
                <Flex gap={1} alignItems={'center'}>
                  <CheckIcon boxSize={4} />
                  <Text as={"h2"}>Pay per project, not per hour</Text>
                </Flex>
                <Flex gap={1} alignItems={'center'}>
                  <CheckIcon boxSize={4} />
                  <Text as={"h2"}>
                    Access to talent and businesses
                  </Text>
                </Flex>
                <Text as={'h2'} textAlign={'center'}>across the global</Text>
              </Box>
            </Box>
          </Flex>
        </>
      ) : (
        <VerifyDeviceOTP email={email} handleLogin={handleSubmit} />
      )
      }
    </Stack>
  );
}
