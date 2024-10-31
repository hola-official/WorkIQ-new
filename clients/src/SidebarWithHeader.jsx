import {
  Image,
  Button,
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuGroup,
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import useLogout from "./hooks/useLogout";
import React, { useState } from "react";
import { GoHome } from "react-icons/go";
import { PiSuitcase } from "react-icons/pi";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import { HiLogout } from "react-icons/hi";
import { FaRegMessage } from "react-icons/fa6";
import useAuth from "./hooks/useAuth";
import DepositModal from "./pages/Dashboard/components/DepositModal";
import { FaListUl } from "react-icons/fa";
import { FiBriefcase } from "react-icons/fi";
import RequestVerification from "./pages/Dashboard/components/RequestVerification";
import Withdraw from "./pages/Freelancer/withdraw/Withdraw";
import CustomConnectButton from "./components/CustomConnectButton";
import { WalletCards, WalletMinimal } from "lucide-react";

const SidebarContent = ({ onClose, ...rest }) => {
  const logout = useLogout();
  const userInfo = useRecoilValue(userAtom);
  const user = userInfo;

  console.log(user)

  return (
    <Box
      transition="3s ease"
      bg={"gray.200"}
      boxShadow="1px 0px 2px 1px rgba(0,0,0,0.6)"
      zIndex={99}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      color={"#000"} ///////////////////////////////////////////////////For the sidebar
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="6" justifyContent="space-between">
        {/* <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
						Logo
					</Text> */}
        <Image src="/SidebarLogo.svg" />

        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      <NavItem
        as={NavLink}
        to={"/dashboard"}
        style={({ isActive }) => ({
          color: isActive ? "#1F2937" : "",
          background: isActive ? "#FFFFFF" : "",
        })}
        icon={GoHome}
      >
        Dashboard
      </NavItem>

      {user?.roles?.Freelancer === "Freelancer" && user?.isVerified === true && (<NavItem
        as={NavLink}
        to={"/projects"}
        style={({ isActive }) => ({
          color: isActive ? "#1F2937" : "",
          background: isActive ? "#FFFFFF" : "",
        })}
        icon={PiSuitcase}
      >
        Project
      </NavItem>)}

      <NavItem
        as={NavLink}
        to={"/messages"}
        style={({ isActive }) => ({
          color: isActive ? "#1F2937" : "",
          background: isActive ? "#FFFFFF" : "",
        })}
        icon={FaRegMessage}
      >
        Message
      </NavItem>

      <NavItem
        as={NavLink}
        to={"/manage-orders"}
        style={({ isActive }) => ({
          color: isActive ? "#1F2937" : "",
          background: isActive ? "#FFFFFF" : "",
        })}
        icon={FaListUl}
      >
        Orders
      </NavItem>
      {user?.roles?.Client === "Client" && (
        <NavItem
          as={NavLink}
          to={"/clients/my-tasks"}
          style={({ isActive }) => ({
            color: isActive ? "#1F2937" : "",
            background: isActive ? "#FFFFFF" : "",
          })}
          icon={FiBriefcase}
        >
          My Tasks
        </NavItem>)}

      <div className="flex w-[80%] items-center mx-auto">
        <Button
          cursor={"pointer"}
          leftIcon={<HiLogout />}
          colorScheme={"gray"}
          variant="outline"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </Box>
  );
};

const NavItem = ({ icon, children, ...rest }) => {
  return (
    <Box>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "blue.400",
          color: "white",
        }}
        {...rest}
      >
        {icon && <Icon mr="4" fontSize="16" as={icon} />}
        {children}
      </Flex>
    </Box>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const logout = useLogout();
  const userInfo = useRecoilValue(userAtom);
  const user = userInfo;
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = React.useState(false);
  const [showModal, setShowModal] = useState(false);
  // console.log(user)
  console.log(userInfo)
  return (
    <Flex
      pos={"sticky"}
      top={0}
      zIndex={9}
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={"#ECF1F6"}
      boxShadow="base"
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Image boxSize='100px' display={{ base: "flex", md: "none" }} src="/assets/images/WorkIqshort.png" />

      <HStack spacing={{ base: "0", md: "6" }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          color="gray.600"
          icon={<FiBell />}
        />
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar size={"sm"} src={userInfo?.avatar} />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm" color="gray.600">
                    {userInfo?.name}
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem onClick={() => navigate(`/profile/${userInfo?.username}`)}>
                Profile
              </MenuItem>
              {user?.isVerified === false && (<MenuItem ><RequestVerification /></MenuItem>)}
              <MenuDivider />
              <MenuGroup title='Settings'>
                <MenuDivider />
                <Text px="3" py="1" fontWeight="bold" fontSize="sm">Wallet</Text>
                <MenuItem onClick={() => setShowDepositModal(true)} icon={<WalletCards />}>
                  Deposit
                </MenuItem>
                <MenuItem onClick={() => setShowModal(true)} icon={<WalletMinimal />}>
                  <Withdraw
                    showModal={showModal}
                    setShowModal={setShowModal}
                  // reloadData={getData}
                  />
                </MenuItem>
                <MenuDivider />
                <MenuItem>
                  <CustomConnectButton className="rounded-md" />
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
      {showDepositModal && (
        <DepositModal
          showDepositModal={showDepositModal}
          setShowDepositModal={setShowDepositModal}
        // reloadData={getData}
        />
      )}
      {/* {showModal && (
        <Withdraw
          showModal={showModal}
          setShowModal={setShowModal}
        // reloadData={getData}
        />
      )} */}
    </Flex>
  );
};

const SidebarWithHeader = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      minH="100vh"
      bg={"#fff"} ///////////////////////////////////////////////////////////For the whole box
    >
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} minH={"100%"} p="2">
        {children}
      </Box>
    </Box>
  );
};

export default SidebarWithHeader;
