import {
  Avatar,
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  useDisclosure,
  Button,
  Textarea,
  Grid,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Center,
  Hide,
  Show,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { MdLocationOn } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import useShowToast from "../../../hooks/useShowToast";
// import userAtom from "../../../atoms/userAtom";
// import { useRecoilState } from "recoil";
import usePreviewImg from "../../../hooks/usePreviewImg";
import useGetUserProfile from "../../../hooks/useGetProfile";
import { useAxiosInstance } from "../../../../api/axios";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { useParams } from "react-router-dom";
import Loading from "@/components/ui/Loading";
import useAuth from "@/hooks/useAuth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "@/atoms/userAtom";
import StatsCard from "./StatsCard";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { Tooltip } from "@material-tailwind/react";
import { Badge } from "@/components/ui/badge";
import Portfolio from "./Portfolio";
import AddPortfolio from "./AddPortfolio";
import Spinner from "@/components/Spinner";

const Profile = () => {
  const { _id, username } = useAuth();
  const axiosInstance = useAxiosInstance();
  const { loading, userInfo } = useGetUserProfile();
  const [users, setUsers] = useRecoilState(userAtom);
  // const setUsers = useSetRecoilState(userAtom);
  const userslocal = useRecoilValue(userAtom)
  const fileRef = useRef(null);
  const { handleImageChange, imgUrl } = usePreviewImg();
  const { userId } = useParams();
  const [updating, setUpdating] = useState(false);
  const [socialMedia, setSocialMedia] = useState({});
  const [skills, setSkills] = useState(users.skills || []);
  const [skillInputValue, setSkillInputValue] = useState("");
  const [skillError, setSkillError] = useState("");
  // const [bioError, setBioError] = useState("");
  const errorHandler = useErrorHandler();
  const {showToast} = useShowToast();
  console.log(_id, username)
  // const [user, setUser] = useRecoilState(null);
  const [inputs, setInputs] = useState({
    name: users?.name,
    email: users?.email,
    username: users?.username,
    password: "",
    bio: users?.bio,
    location: users?.location,
    website: users?.website,
    // skills: skills || users?.skills,
    category: users?.category,
    avatar: "", // If you allow userInfo to update their avatar
    socialMedia: users?.socialMedia || "",
  });

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  console.log(users)
  const handleSkillInputChange = (e) => {
    setSkillInputValue(e.target.value);
  };

  const handleSkillAdd = () => {
    const trimmedSkill = skillInputValue.trim();

    if (trimmedSkill === "") {
      setSkillError("Skill cannot be empty");
      return;
    }

    if (trimmedSkill.length > 15) {
      setSkillError("Skill must be 15 characters or less");
      return;
    }

    if (skills.some(skill => skill.toLowerCase() === trimmedSkill.toLowerCase())) {
      setSkillError("Skill already exists");
      return;
    }

    if (skills.length >= 10) {
      setSkillError("You can add a maximum of 10 skills");
      return;
    }

    setSkills(prevSkills => [...prevSkills, trimmedSkill]);
    setSkillInputValue("");
    setSkillError("");
  };

  const handleSkillRemove = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  console.log(userInfo);
  const handleSocialMediaInput = (property, value) => {
    setSocialMedia((prevSocialMedia) => {
      return {
        ...prevSocialMedia,
        [property]: value,
      };
    });
  };
  // console.log(setUsers())

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (updating) return;
    setUpdating(true);

    try {
      const res = await axiosInstance.put(
        `users/update/${_id}`,
        JSON.stringify({
          ...inputs,
          profilePic: imgUrl,
          socialMedia: socialMedia,
          skills: skills,
        })
      );
      const data = res.data;

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      // if (error?.response?.status === 404) {

      showToast("Success", "Profile updated successfully", "success");

      // Update user state or perform any necessary actions
      // setUsers(data);
      setUsers(prev => {
        return { ...prev, ...data }
      })
      onModalClose()
      localStorage.setItem("user-workiq", JSON.stringify(data));
      console.log(data)
      // console.log(data);
    } catch (error) {
      // showToast("Error", error.message, "error");
      if (error.response.message) {
        showToast("Error", error.response.message, "error");
      } else {
        errorHandler(error);
      }

      if (error.response.status === 400) {
        showToast("Error", error.response.data.error, "error");
      }
      console.log(error);
    } finally {
      setUpdating(false);
    }
  };

  if (!userInfo?.user && loading) {
    return <Spinner />
  }

  console.log(userInfo)
  console.log(userslocal)
  if (userInfo) {
    return (
      <HStack align={"center"} w={'full'}>
        <Flex justify={"space-between"} flexDir={{ base: "column", md: "row" }} w={'full'} gap={{ base: 4 }}>
          <Flex flexDir={"column"} gap={6} w={{ base: "full", md: "50%" }}>
            <Flex
              border={"solid #D1D5DB 1px"}
              borderRadius={"md"}
              justify={"center"}
              align={"center"}
              py={4}
              px={6}
            >
              <Flex
                align={"center"}
                borderRadius={"md"}
                flexDir={"column"}
                border={"solid #D1D5DB 1px"}
                px={8}
                py={2}
                w={"full"}
              >
                <Wrap>
                  <WrapItem>
                    <Avatar
                      src={userInfo?.avatar}
                      size={{ base: "xl", lg: "2xl" }}
                      name={userInfo?.name}
                    />
                  </WrapItem>
                </Wrap>
                <Text as={"h2"} fontSize={['sm', "md"]}>
                  {userInfo?.username}
                </Text>
                <Box>
                  <Flex align={'center'} justify={'center'} gap={1}>
                    <Text as={"h1"} fontWeight={600} fontSize={['sm', 'md', "lg"]}>
                      {userInfo?.name}
                    </Text>
                    {userInfo?.isVerified === true && (<Tooltip
                      className={'border border-blue-gray-50 bg-white px-4 py-2 shadow-xl shadow-black/10'}
                      content={
                        <div className="text-xs text-black">
                          At WorkIQ, <br /> we're constantly working to make your order experience more secure. <br /> This freelancer has passed a photo and passport verification so that you know exactly who you're working with.
                        </div>
                      }
                      placement="bottom"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm7 10c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11 7 3.11V11zm-11.59.59L6 13l4 4 8-8-1.41-1.42L10 14.17z"></path></svg>
                    </Tooltip>)}
                  </Flex>
                  {userInfo?.totalPoints > 0 && <Text
                    as={"h1"}
                    color={"#4B5563"}
                    fontWeight={400}
                    fontSize={['sm', "md"]}
                  >
                    {userInfo?.totalPoints}+ point earned
                  </Text>}
                </Box>

                <Flex flexDir={"column"} gap={2} w={"full"}>
                  {userInfo?.isVerified === true && (<Tooltip
                    className={'border border-blue-gray-50 bg-white px-4 py-2 shadow-xl shadow-black/10'}
                    content={
                      <div className="text-xs text-black">
                        At WorkIQ, <br /> we're constantly working to make your order experience more secure. <br /> This freelancer has passed a photo and passport verification so that you know exactly who you're working with.
                      </div>
                    }
                    placement="bottom"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Flex align={"center"} gap={1}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm7 10c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11 7 3.11V11zm-11.59.59L6 13l4 4 8-8-1.41-1.42L10 14.17z"></path></svg>
                      <Text fontSize={["sm", 'md']}>Identity Verified</Text>
                    </Flex>
                  </Tooltip >)}
                  <Flex justify={"space-between"} align={"center"}>
                    <Box gap={1} display={"flex"} alignItems={"center"}>
                      <MdLocationOn size={20} />
                      <Text fontSize={['sm', 'md']}>From</Text>
                    </Box>
                    <Text fontSize={['sm', 'md', "lg"]}>Nigeria</Text>
                  </Flex>

                  <Flex justify={"space-between"} align={"center"}>
                    <Box gap={1} display={"flex"} alignItems={"center"}>
                      <FaUser size={20} />
                      <Text fontSize={['sm', 'md']}>
                        Member since
                      </Text>
                    </Box>
                    <Text fontSize={['sm', 'md']}>
                      {new Date(userInfo?.createdAt).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </Flex>

                  <Box>
                    {userInfo?.totalPoints >= 5000 && (
                      <StatsCard
                        imgUrl="/assets/icons/gold-medal.svg"
                        value={userInfo?.badges?.GOLD}
                        title="Gold Badge"
                      />
                    )}
                    {userInfo?.totalPoints >= 1000 && (
                      <StatsCard
                        imgUrl="/assets/icons/silver-medal.svg"
                        value={userInfo?.badges?.SILVER}
                        title="Silver Badge"
                      />
                    )}
                    {userInfo?.totalPoints >= 400 && (
                      <StatsCard
                        imgUrl="/assets/icons/bronze-medal.svg"
                        value={userInfo?.badges?.BRONZE}
                        title="Bronze Badge"
                      />
                    )}
                  </Box>
                  {/* <Box display={!username != user.username ?'none' : 'block'} > */}
                  {userInfo?._id === _id && (
                    <Button
                      color="white"
                      size={{ base: "md", md: "lg" }}
                      bg="blue.500"
                      _hover={{ bg: "blue.400" }}
                      cursor="pointer"
                      rightIcon={<EditIcon />}
                      onClick={onModalOpen}
                    >
                      Edit my data
                    </Button>
                  )}

                  {/* </Box> */}

                  <Modal isOpen={isModalOpen} onClose={onModalClose}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>User Profile Edit</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        {/* <form onSubmit={handleSubmit}> */}
                        <Flex align={"center"} justify={"center"} my={6}>
                          <Stack
                            spacing={4}
                            w={"full"}
                            maxW={"md"}
                            // bg={useColorModeValue('white', 'gray.dark')}
                            rounded={"xl"}
                            boxShadow={"lg"}
                            p={6}
                          >
                            <Heading
                              lineHeight={1.1}
                              fontSize={{ base: "2xl", sm: "3xl" }}
                            >
                              User Profile Edit
                            </Heading>
                            <FormControl>
                              <Stack direction={["column", "row"]} spacing={6}>
                                <Center>
                                  <Avatar
                                    size="xl"
                                    boxShadow={"md"}
                                    src={imgUrl || userInfo?.avatar}
                                  />
                                </Center>
                                <Center w="full">
                                  <Button
                                    onClick={() => fileRef.current.click()}
                                    w="full"
                                  >
                                    Change Avatar
                                  </Button>
                                  <Input
                                    type="file"
                                    hidden
                                    ref={fileRef}
                                    onChange={handleImageChange}
                                  />
                                </Center>
                              </Stack>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Full name</FormLabel>
                              <Input
                                placeholder="John Doe"
                                _placeholder={{ color: "gray.500" }}
                                type="text"
                                onChange={(e) =>
                                  setInputs({ ...inputs, name: e.target.value })
                                }
                                value={inputs.name}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Username</FormLabel>
                              <Input
                                disabled
                                placeholder="Username"
                                _placeholder={{ color: "gray.500" }}
                                type="text"
                                onChange={(e) =>
                                  setInputs({
                                    ...inputs,
                                    username: e.target.value,
                                  })
                                }
                                value={inputs.username}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Email address</FormLabel>
                              <Input
                                placeholder="your-email@example.com"
                                _placeholder={{ color: "gray.500" }}
                                type="email"
                                disabled
                                onChange={(e) =>
                                  setInputs({
                                    ...inputs,
                                    email: e.target.value,
                                  })
                                }
                                value={inputs.email}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Bio</FormLabel>
                              <Textarea
                                placeholder="Your bio..."
                                _placeholder={{ color: "gray.500" }}
                                size={"lg"}
                                onChange={(e) =>
                                  setInputs({
                                    ...inputs,
                                    bio: e.target.value,
                                  })
                                }
                                value={inputs.bio}
                                maxLength={350} // Set the maximum character length
                              />
                              <Box>
                                <Text
                                  as="span"
                                  fontSize="sm"
                                  color={inputs.bio && inputs.bio.length > 350 ? "red.500" : "gray.500"} // Change color if exceeded max length
                                >
                                  {inputs.bio ? inputs.bio.length : 0}/350 characters
                                </Text>
                              </Box>

                            </FormControl>
                            <FormControl>
                              <FormLabel>Skill</FormLabel>
                              <Input
                                value={skillInputValue}
                                onChange={handleSkillInputChange}
                                maxLength={15}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault(); // Prevent form submission
                                    handleSkillAdd();
                                  }
                                }}
                                placeholder="Add a skill (max 15 characters)"
                              />
                              {skillError && (
                                <Text color="red.500" fontSize="sm" mt={1}>
                                  {skillError}
                                </Text>
                              )}
                              <HStack spacing={2} mt={2} flexWrap="wrap">
                                {skills.length > 0 ? (
                                  skills.map((skill, index) => (
                                    <Tag key={index} borderRadius="full" colorScheme="blue">
                                      <TagLabel>{skill}</TagLabel>
                                      <TagCloseButton onClick={() => handleSkillRemove(skill)} />
                                    </Tag>
                                  ))
                                ) : (
                                  <Text fontSize="sm" color="gray.500">No skills added yet</Text>
                                )}
                              </HStack>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Password</FormLabel>
                              <Input
                                placeholder="password"
                                _placeholder={{ color: "gray.500" }}
                                type="password"
                                onChange={(e) =>
                                  setInputs({
                                    ...inputs,
                                    password: e.target.value,
                                  })
                                }
                                value={inputs.password}
                              />
                            </FormControl>
                            <Flex flexDir={"column"} gap={2} mt={2}>
                              <Input
                                value={inputs.socialMedia?.twitter}
                                onChange={(e) =>
                                  handleSocialMediaInput(
                                    "twitter",
                                    e.target.value
                                  )
                                }
                                placeholder="Twitter link"
                              />
                              <Input
                                value={inputs.socialMedia?.linkedin}
                                onChange={(e) =>
                                  handleSocialMediaInput(
                                    "linkedin",
                                    e.target.value
                                  )
                                }
                                placeholder="LinkedIn link"
                              />
                              <Input
                                value={inputs.socialMedia?.github}
                                onChange={(e) =>
                                  handleSocialMediaInput(
                                    "github",
                                    e.target.value
                                  )
                                }
                                placeholder="GitHub link"
                              />
                            </Flex>
                          </Stack>
                        </Flex>
                        {/* </form> */}
                      </ModalBody>
                      <Stack px={5} direction={["column", "row"]}>
                        <Button
                          bg={"red.500"}
                          color={"white"}
                          w="80%"
                          isDisabled={updating}
                          size={{ base: "md", md: "md" }}
                          onClick={onModalClose}
                          _hover={{
                            bg: "red.400",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          bg={"blue.500"}
                          color={"white"}
                          w="full"
                          size={{ base: "md", md: "md" }}
                          _hover={{
                            bg: "blue.400",
                          }}
                          onClick={handleSubmit}
                          type="submit"
                          isLoading={updating}
                        >
                          Submit
                        </Button>
                      </Stack>
                      <ModalFooter gap={2}></ModalFooter>
                    </ModalContent>
                  </Modal>
                </Flex>
              </Flex>
            </Flex>

            <Flex
              border={"solid #D1D5DB 1px"}
              borderRadius={"md"}
              justify={"center"}
              flexDir={"column"}
              w={"full"}
              py={4}
              px={6}
            >
              <Flex
                align={"center"}
                borderRadius={"md"}
                flexDir={"column"}
                border={"solid #D1D5DB 1px"}
                w={"full"}
                px={8}
                py={2}
              >
                <Flex
                  justify="space-between"
                  // align="center"
                  flexDir={"row"}
                  w="full"
                  mb={4}
                >
                  <Text
                    as="h2"
                    fontSize={{ base: "md", md: "1xl" }}
                    fontWeight={600}
                  >
                    Description
                  </Text>
                </Flex>

                <Text textAlign={"start"} as="h2" color="#6B7280" fontSize={['sm', "md"]}>
                  {userInfo?.bio || "No bio provided."}
                </Text>
              </Flex>
              <Box gap={10} mt={4}>
                <Text
                  as={"h2"}
                  fontSize={{ base: "md", md: "1xl" }}
                  fontWeight={600}
                >
                  Skills
                </Text>

                <Flex flexDir="column" gap={2} mt={2}>
                  <HStack spacing={2} className="flex gap-2 flex-wrap">
                    {userInfo?.skills.length > 0 ? (
                      userInfo?.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-[10px] font-medium leading-[13px] bg-light-800 dark:bg-dark-300 text-light-400 dark:text-light-500 flex items-center justify-center gap-1 rounded-lg border-none px-4 py-2 capitalize"
                        >
                          {skill}
                          {/* <Tag key={index} borderRadius="full" color="white" bg="blue.500"> */}
                          {/* <TagLabel>{skill}</TagLabel> */}
                          {/* </Tag> */}
                        </Badge>
                      ))
                    ) : (
                      <Text>No skills to show</Text>
                    )}
                  </HStack>
                </Flex>
              </Box>

              <Box gap={10} mt={4}>
                {/* <form onSubmit={handleSubmit}> */}
                <Text
                  as={"h2"}
                  fontSize={{ base: "md", md: "1xl" }}
                  fontWeight={600}
                >
                  Linked accounts
                </Text>

                <Flex flexDir={"column"} gap={2} mt={2}>
                  {userInfo?.socialMedia ? (
                    <div className="flex gap-2">
                      {userInfo?.socialMedia?.twitter && (<a href={userInfo?.socialMedia?.twitter} title="Twitter"> <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333333 333333" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd"><path d="M166667 0c92048 0 166667 74619 166667 166667s-74619 166667-166667 166667S0 258715 0 166667 74619 0 166667 0zm90493 110539c-6654 2976-13822 4953-21307 5835 7669-4593 13533-11870 16333-20535-7168 4239-15133 7348-23574 9011-6787-7211-16426-11694-27105-11694-20504 0-37104 16610-37104 37101 0 2893 320 5722 949 8450-30852-1564-58204-16333-76513-38806-3285 5666-5022 12109-5022 18661v4c0 12866 6532 24246 16500 30882-6083-180-11804-1876-16828-4626v464c0 17993 12789 33007 29783 36400-3113 845-6400 1313-9786 1313-2398 0-4709-247-7007-665 4746 14736 18448 25478 34673 25791-12722 9967-28700 15902-46120 15902-3006 0-5935-184-8860-534 16466 10565 35972 16684 56928 16684 68271 0 105636-56577 105636-105632 0-1630-36-3209-104-4806 7251-5187 13538-11733 18514-19185l17-17-3 2z" fill="#1da1f2"></path></svg>
                      </a>)}
                      {userInfo?.socialMedia?.linkedin && (<a href={userInfo?.socialMedia?.linkedin} title="LinkedIn">
                        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333333 333333" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd"><path d="M166667 0c92048 0 166667 74619 166667 166667s-74619 166667-166667 166667S0 258715 0 166667 74619 0 166667 0zm-18220 138885h28897v14814l418 1c4024-7220 13865-14814 28538-14814 30514-1 36157 18989 36157 43691v50320l-30136 1v-44607c0-10634-221-24322-15670-24322-15691 0-18096 11575-18096 23548v45382h-30109v-94013zm-20892-26114c0 8650-7020 15670-15670 15670s-15672-7020-15672-15670 7022-15670 15672-15670 15670 7020 15670 15670zm-31342 26114h31342v94013H96213v-94013z" fill="#0077b5"></path></svg>
                      </a>)}
                      {userInfo?.socialMedia?.github && (<a href={userInfo?.socialMedia?.github} title="Github">
                        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="0" height="0" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 640 640"><path d="M319.988 7.973C143.293 7.973 0 151.242 0 327.96c0 141.392 91.678 261.298 218.826 303.63 16.004 2.964 21.886-6.957 21.886-15.414 0-7.63-.319-32.835-.449-59.552-89.032 19.359-107.8-37.772-107.8-37.772-14.552-36.993-35.529-46.831-35.529-46.831-29.032-19.879 2.209-19.442 2.209-19.442 32.126 2.245 49.04 32.954 49.04 32.954 28.56 48.922 74.883 34.76 93.131 26.598 2.882-20.681 11.15-34.807 20.315-42.803-71.08-8.067-145.797-35.516-145.797-158.14 0-34.926 12.52-63.485 32.965-85.88-3.33-8.078-14.291-40.606 3.083-84.674 0 0 26.87-8.61 88.029 32.8 25.512-7.075 52.878-10.642 80.056-10.76 27.2.118 54.614 3.673 80.162 10.76 61.076-41.386 87.922-32.8 87.922-32.8 17.398 44.08 6.485 76.631 3.154 84.675 20.516 22.394 32.93 50.953 32.93 85.879 0 122.907-74.883 149.93-146.117 157.856 11.481 9.921 21.733 29.398 21.733 59.233 0 42.792-.366 77.28-.366 87.804 0 8.516 5.764 18.473 21.992 15.354 127.076-42.354 218.637-162.274 218.637-303.582 0-176.695-143.269-319.988-320-319.988l-.023.107z"></path></svg>
                      </a>)}

                    </div>
                  ) : (
                    <Text>No linked account</Text>
                  )
                  }
                </Flex>
                {/* {userInfo?._id === _id && <Button bg={"blue.300"} type="submit">
                  Submit
                </Button>} */}
                {/* </form> */}
              </Box>
            </Flex>
          </Flex>
          {/* Portfolio section */}
          <div className="w-full">
            {/* <Flex flexDirection="column" w="full" mt={8}> */}
            {/* <Heading as="h2" size="xl" >
              {userInfo._id === _id ? "My Portfolio" : "Portfolio"}
            </Heading> */}
            <AddPortfolio userId={userInfo._id} user={userInfo} />
            <Portfolio userId={userInfo._id} user={userInfo} />
          </div>
        </Flex >
      </HStack >
    );
  }
};

export default Profile;
