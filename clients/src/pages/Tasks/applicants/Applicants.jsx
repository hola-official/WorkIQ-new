import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  // Avatar,
  Breadcrumbs,
} from "@material-tailwind/react";
import parse from "html-react-parser";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  // Avatar,
  Typography,
} from "@material-tailwind/react";
import { formatDistanceToNow } from "date-fns";
import { useAxiosInstance } from "../../../../api/axios";
import SectionCard from "./SectionCard";
import { getTimestamp } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Image, Tooltip } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import {
  Container,
  Box,
  HStack,
  VStack,
  Stack,
  Link as ChakraLink,
  Text,
  Icon,
  Tag,
  Avatar,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  // Icon,
} from "@chakra-ui/react";
// Here we have used react-icons package for the icons
import { GoChevronRight } from "react-icons/go";
import { IoTimeOutline, IoDocumentAttachOutline } from "react-icons/io5";

import { formatPrice } from "@/lib/format";
import Footer from "@/components/Footer";
import Proposal from "./components/Proposal";
import Spinner from "@/components/Spinner";

const Applicants = () => {
  const { taskId } = useParams();
  const axiosInstance = useAxiosInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // console.log(freelancer)

  useEffect(() => {
    handleGetTaskInfo();
  }, []);

  useEffect(() => {
    handleClientInfo();
  }, [task]);
  // useEffect(() => {
  //   handleFreelancerInfo();
  // }, [task]);

  const handleGetTaskInfo = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`tasks/${taskId}`);
      const data = await res.data;
      setTask(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientInfo = async () => {
    try {
      const res = await axiosInstance.get(`users/${task.client}`);
      const data = await res.data;
      console.log(data);
      setUserInfo(data);
    } catch (error) {
      console.error(error);
    }
  };

  // const handleFreelancerInfo = async () => {
  //   try {
  //     const res = await axiosInstance.get(
  //       `users/${task.sections[0].proposal[0].freelancer}`
  //     );
  //     const data = await res.data;
  //     console.log(data);
  //     setFreelancer(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const user = userInfo;
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  if (isLoading) {
    return <Spinner />
  }

  if (!task) {
    return <p>Task not found</p>;
  }
  console.log(taskId);
  console.log(task);
  console.log(user);
  // console.log(freelancer);

  const renderAttachments = () => {
    return (
      <ul className="list-none list-inside mb-2">
        {task.sections[0].attachments.map((attachment, index) => (
          <li key={index} className="flex items-center">
            <IoDocumentAttachOutline
              className="text-blue-400 mr-1 cursor-pointer"
              onClick={() => downloadFile(attachment.url, attachment.name)}
            />
            {attachment.name}
          </li>
        ))}
      </ul>
    );
  };

  // if (user && freelancer) {
  return (
    <>
      <div className="px-6 pt-6">
        <Breadcrumbs separator=">">
          <Link to="/dashboard" className="opacity-60">
            Dashboard
          </Link>
          <Link to="/projects" className="opacity-60">
            All Tasks
          </Link>
          <Link href="#">Task Info</Link>
        </Breadcrumbs>
      </div>
      <div className=" overflow-hidden">
        <div className="w-full  h-full overflow-y-auto p-6 pr-8 z-9">
          <div className="h-full w-full">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {task.title}
            </h2>
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2">
                {/* <p className="text-md font-bold "> User: {user.username}</p> */}
              </div>
              {/* <p className="text-md text-gray-600">
                <strong>Category: </strong>
                {task.categoryId}
              </p> */}
              <p className="text-md text-gray-600">
                <strong>Posted: </strong>
                {getTimestamp(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <hr className="border-gray-200 mb-8" />
            <div>
              <Tabs id="custom-animation" value={activeTab}>
                <TabsHeader>
                  <Tab
                    value="overview"
                    onClick={() => setActiveTab("overview")}
                    className={
                      activeTab === "overview"
                        ? "text-gray-900"
                        : "text-gray-600"
                    }
                  >
                    Overview
                  </Tab>
                  <Tab
                    value="sections"
                    onClick={() => setActiveTab("sections")}
                    className={
                      activeTab === "sections"
                        ? "text-gray-900"
                        : "text-gray-600"
                    }
                  >
                    Sections
                  </Tab>
                  <Tab
                    value="applicants"
                    onClick={() => setActiveTab("applicants")}
                    className={
                      activeTab === "applicants"
                        ? "text-gray-900"
                        : "text-gray-600"
                    }
                  >
                    Review Proposal
                  </Tab>
                  <Tab
                    value="hire"
                    onClick={() => setActiveTab("hire")}
                    className={
                      activeTab === "hire" ? "text-gray-900" : "text-gray-600"
                    }
                  >
                    Hire
                  </Tab>
                </TabsHeader>
                <TabsBody>
                  <TabPanel value="overview">
                    <div className=" flex justify-between border-b-2 border-gray-200 py-6">
                      {parse(task.description)}
                    </div>
                    <div className=" flex justify-between mt-4 gap-2">
                      <div>
                        <h1 className="text-xl">Skills and Expertise</h1>
                        <div className="flex gap-3 flex-wrap md:w-[45%]">
                          {task.skills.map((skill, index) => (
                            <Tooltip
                              label={skill}
                              placement="top"
                              animate={{
                                mount: { scale: 1, y: 0 },
                                unmount: { scale: 0, y: 25 },
                              }}
                              className="hidden md:block"
                            >
                              <Badge
                                key={index}
                                className="text-[12px] font-medium leading-[13px] bg-light-800 dark:bg-dark-300 text-light-400 dark:text-light-500 flex items-center justify-center gap-1 rounded-lg border-none px-4 py-2 capitalize"
                              >
                                {skill}
                              </Badge>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div className="border-solid border-gray-200 rounded">
                        <div className="flex gap-1 text-base">
                          <p className="w-5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              role="img"
                            >
                              <path
                                vectorEffect="non-scaling-stroke"
                                stroke="var(--icon-color, #001e00)"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M13.17 3H21v7.83L10.83 21 3 13.17 13.17 3z"
                              ></path>
                              <path
                                vectorEffect="non-scaling-stroke"
                                stroke="var(--icon-color, #001e00)"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M9.63 11.51a1.86 1.86 0 00.3 2.56 1.86 1.86 0 002.56.3 1.51 1.51 0 00.27-1.68c-.25-.54-.87-1.56-1.08-2.12A1.4 1.4 0 0112 9.12a1.84 1.84 0 012.55.31 1.84 1.84 0 01.33 2.57m-.31-2.57l.81-.81m-6.26 6.26l.81-.81m7.94-7.39a.55.55 0 100-1.1.55.55 0 000 1.1z"
                              ></path>
                            </svg>
                          </p>
                          {formatPrice(task.totalPrice)}
                        </div>
                        <p className="text-sm">Budget</p>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value="sections">
                    <div className="flex gap-2 flex-col">
                      {task.sections.map((section) => (
                        <Card className="hover:bg-gray-100 transition overflow-hidden">
                          {/* Card Header */}
                          <CardHeader
                            floated={false}
                            shadow={true}
                            color="transparent"
                            className="m-0 h-50 md:h-50 rounded-none"
                          ></CardHeader>
                          {/* Card Body */}
                          <CardBody className="p-3">
                            {/* Section Title */}
                            <Typography
                              variant="h6"
                              className="text-lg md:text-2xl two-line-truncate"
                              color="blue-gray"
                            >
                              {section.title}
                            </Typography>
                            <div className="text-base md:text-lg">
                              {section.description}
                            </div>
                            {/* Attachments */}
                            {section.attachments &&
                              section.attachments.length > 0 && (
                                <div className="mt-2 ">
                                  {section.attachments.length > 1 ? (
                                    <>
                                      {/* <Button onClick={toggleModal}>See More</Button>
                                       */}
                                      <div
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={toggleModal}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          color="gray"
                                        >
                                          Attachments:
                                        </Typography>
                                        <Icon as={AttachmentIcon} />
                                      </div>

                                      <Modal
                                        isOpen={isOpen}
                                        onClose={toggleModal}
                                      >
                                        <ModalOverlay />
                                        <ModalContent>
                                          <ModalHeader>Attachments</ModalHeader>
                                          <ModalCloseButton />
                                          <ModalBody>
                                            {renderAttachments()}
                                          </ModalBody>
                                          <ModalFooter>
                                            <Button
                                              colorScheme="blue"
                                              onClick={toggleModal}
                                            >
                                              Close
                                            </Button>
                                          </ModalFooter>
                                        </ModalContent>
                                      </Modal>
                                    </>
                                  ) : (
                                    renderAttachments()
                                  )}
                                </div>
                              )}
                          </CardBody>
                          {/* Card Footer */}
                          <CardFooter className="p-3">
                            <div className="my-2 flex items-center gap-x-2 text-sm md:text-xs">
                              <div className="flex items-center gap-x-1 text-slate-500">
                                {/* Proposals Length */}
                                {/* You can replace proposalsLength with any relevant information */}
                                {/* <IconBadge size="sm" icon={BookOpen} /> */}
                                <span>
                                  {section.proposal.length}{" "}
                                  {section.proposal.lengthh === 1
                                    ? "Proposals"
                                    : "Proposal"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <div className="flex gap-1 items-center">
                                {/* Ratings */}
                                {/* You can replace the ratings with any relevant information */}
                                <IoTimeOutline className="text-blue-400" />
                                <p className="text-xs text-muted-foreground">
                                  {section.durationDays} Days
                                </p>
                              </div>
                              {/* Section Price */}
                              <p className="text-lg md:text-md font-medium text-slate-700">
                                {section.price
                                  ? formatPrice(section.price)
                                  : "Free"}
                              </p>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel value="applicants">
                    <div className="flex gap-2 flex-col">
                      {task.sections
                        .filter((section) => section.proposal.length > 0)
                        .map((section) => (
                          <>
                            {section.proposal.map((proposal, proposalIndex) => (
                              <Proposal
                                key={proposalIndex}
                                task={task}
                                section={section}
                                proposal={proposal}
                              />
                            ))}
                          </>
                        ))}
                    </div>
                  </TabPanel>
                  <TabPanel value="hire">
                    <div className="flex items-center flex-col justify-center">
                      <Image
                        boxSize={["100px", "150px", "200px"]}
                        src="/hire.svg"
                        alt="freelance"
                      />
                      <div className="flex flex-col items-center font-bold ">
                        <h1 className="text-base md:text-xl text-gray-500">
                          You don't have any hires yet
                        </h1>
                        <h1 className="text-sm md:text-base text-gray-500">
                          Interview promising talent and make them an offer.
                        </h1>
                      </div>
                    </div>
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
// };

export default Applicants;
