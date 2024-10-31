import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillGithub, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Tag,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  IconButton,
} from "@chakra-ui/react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import useAuth from "@/hooks/useAuth";

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);
const MotionModalContent = motion(ModalContent);

const Portfolio = ({ userId }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 });
  const [portfolios, setPortfolios] = useState([]);
  const [filterPortfolios, setFilterPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPortfolio, setEditedPortfolio] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();
  const { _id } = useAuth();

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axiosInstance.get(`users/${userId}/portfolios`);
        setPortfolios(response.data);
        setFilterPortfolios(response.data);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };
    fetchPortfolios();
  }, [userId]);

  const handleEdit = (portfolio) => {
    setEditedPortfolio({ ...portfolio });
    setIsEditing(true);
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.put(`users/${userId}/portfolios/${editedPortfolio._id}`, editedPortfolio);
      const updatedPortfolio = response.data;

      if (response.status === 200 && response.data.message === "No changes detected") {
        showToast('Info', "No changes were made", 'info');
      } else {
        setPortfolios(portfolios.map(p => p._id === updatedPortfolio._id ? updatedPortfolio : p));
        setFilterPortfolios(filterPortfolios.map(p => p._id === updatedPortfolio._id ? updatedPortfolio : p));
        showToast('Success', "Portfolio updated", 'success');
      }

      setIsEditing(false);
      onClose();
      console.log(response);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      if (error.response.status === 400) {
        showToast('Error', error.response.data.message, 'error');
      }
    }
  };

  const handleDelete = async (portfolioId) => {
    try {
      await axiosInstance.delete(`users/${userId}/portfolios/${portfolioId}`);
      setPortfolios(portfolios.filter(p => p._id !== portfolioId));
      setFilterPortfolios(filterPortfolios.filter(p => p._id !== portfolioId));
      showToast('Success', "Portfolio deleted", 'success');
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      showToast('Error', "Error deleting portfolio", 'error');
    }
  };

  const handlePortfolioFilter = (item) => {
    setActiveFilter(item);
    setAnimateCard({ y: 100, opacity: 0 });

    setTimeout(() => {
      setAnimateCard({ y: 0, opacity: 1 });
      if (item === "All") {
        setFilterPortfolios(portfolios);
      } else {
        setFilterPortfolios(portfolios.filter((portfolio) => portfolio.tags.includes(item)));
      }
    }, 500);
  };

  const handlePortfolioClick = (portfolio) => {
    setSelectedPortfolio(portfolio);
    onOpen();
  };

  const truncateTitle = (title, maxLength = 25) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 500 } },
    exit: { y: "100vh", opacity: 0 },
  };

  return (
    <HStack align={"center"} w="full">
      <Flex flexDirection="column" w="full" mt={2}>
        <Flex justify="center" mb={6} overflow={'auto'}>
          <AnimatePresence>
            {["All", ...Array.from(new Set(portfolios.flatMap(p => p.tags)))].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Tag
                  mr={2}
                  cursor="pointer"
                  onClick={() => handlePortfolioFilter(item)}
                  colorScheme={activeFilter === item ? "blue" : "gray"}
                >
                  {item}
                </Tag>
              </motion.div>
            ))}
          </AnimatePresence>
        </Flex>

        <motion.div
          animate={animateCard}
          transition={{ duration: 0.5, delayChildren: 0.5 }}
        >
          <MotionSimpleGrid
            spacing={4}
            templateColumns="repeat(auto-fill, minmax(215px, 1fr))"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {filterPortfolios.map((portfolio, index) => (
              <MotionBox
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.05, boxShadow: "lg" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                as={Card}
                onClick={() => handlePortfolioClick(portfolio)}
                cursor="pointer"
              >
                <Image src={portfolio.imageUrl} alt={portfolio.title} borderTopRadius="lg" />
                <CardBody>
                  <Heading size={['sm', "md"]} mb={2}>{truncateTitle(portfolio.title)}</Heading>
                  <Text fontSize={['sm', 'md', 'lg']} mb={4}>{truncateDescription(portfolio.description)}</Text>
                  <Flex justify="space-between" flexDir={{ base: "column", md: 'row' }} gap={{ base: 2, md: 0 }}>
                    <motion.div
                      initial={{ opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeInOut", staggerChildren: 0.5 }}
                    >
                      <div className="flex justify-between gap-4">
                        {portfolio.projectUrl && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.25 }}
                          >
                            <Button
                              as="a"
                              href={portfolio.projectUrl}
                              target="_blank"
                              leftIcon={<TbWorld />}
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Button>
                          </motion.div>
                        )}
                        {portfolio.githubUrl && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.25 }}
                          >
                            <Button
                              as="a"
                              href={portfolio.githubUrl}
                              target="_blank"
                              leftIcon={<AiFillGithub />}
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Code
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    {userId === _id &&
                      <div className="flex justify-between gap-4">
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <IconButton
                            icon={<AiFillEdit />}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(portfolio);
                            }}
                          />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <IconButton
                            icon={<AiFillDelete />}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(portfolio._id);
                            }}
                          />
                        </motion.div>
                      </div>
                    }
                  </Flex>
                </CardBody>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </motion.div>
      </Flex>

      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={onClose} size={['md','lg',"xl"]}>
            <ModalOverlay />
            <MotionModalContent
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ModalHeader fontSize={['md', 'lg']}>{isEditing ? "Edit Portfolio" : selectedPortfolio?.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Input
                      value={editedPortfolio.title}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, title: e.target.value })}
                      placeholder="Title"
                      mb={4}
                    />
                    <Textarea
                      value={editedPortfolio.description}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, description: e.target.value })}
                      placeholder="Description"
                      mb={4}
                    />
                    <Input
                      value={editedPortfolio.projectUrl}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, projectUrl: e.target.value })}
                      placeholder="Project URL"
                      mb={4}
                    />
                    <Input
                      value={editedPortfolio.githubUrl}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, githubUrl: e.target.value })}
                      placeholder="Github URL"
                      mb={4}
                    />
                    <Input
                      value={editedPortfolio.tags.join(', ')}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                      placeholder="Tags (comma-separated)"
                      mb={4}
                    />
                    <Textarea
                      value={editedPortfolio.testimonial}
                      onChange={(e) => setEditedPortfolio({ ...editedPortfolio, testimonial: e.target.value })}
                      placeholder="Experience"
                      mb={4}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Image src={selectedPortfolio?.imageUrl} alt={selectedPortfolio?.title} mb={4} />
                    <Text fontSize={['sm', 'md']} mb={4}>{selectedPortfolio?.description}</Text>
                    <Text fontWeight="bold" mb={2}>Tags:</Text>
                    <Flex flexWrap="wrap" mb={4}>
                      {selectedPortfolio?.tags.map((tag, index) => (
                        <Tag className="capitalize" key={index} mr={2} mb={2}>{tag}</Tag>
                      ))}
                    </Flex>
                    {selectedPortfolio?.testimonial && (
                      <>
                        <Text fontWeight="bold" mb={2}>Experience:</Text>
                        <Text fontSize={['sm', 'md']}>{selectedPortfolio.testimonial}</Text>
                      </>
                    )}
                  </motion.div>
                )}
              </ModalBody>
              <ModalFooter>
                {isEditing ? (
                  <>
                    <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
                      Save
                    </Button>
                    <Button onClick={() => {
                      setIsEditing(false);
                      onClose();
                    }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                      Close
                    </Button>
                    {selectedPortfolio?.projectUrl && (
                      <Button
                        as="a"
                        href={selectedPortfolio?.projectUrl}
                        target="_blank"
                        leftIcon={<TbWorld />}
                      >
                        View Project
                      </Button>
                    )}
                  </>
                )}
              </ModalFooter>
            </MotionModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </HStack>
  );
}

export default Portfolio;