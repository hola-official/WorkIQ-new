import React, { useState, useEffect } from "react";
import SidebarWithHeader from "@/SidebarWithHeader";
import { Breadcrumbs, Tooltip } from "@material-tailwind/react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Card, Typography } from "@material-tailwind/react";
import {
  Button,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAxiosInstance } from "../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { formatPrice } from "@/lib/format";
import useAuth from "@/hooks/useAuth";
import { ConfirmModal } from "@/ui/confirm-modal";
import Spinner from "@/components/Spinner";
import CompleteSection from "./components/CompleteSection";
import { useRecoilValue } from "recoil";
import userAtom from "@/atoms/userAtom";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { useWaitForTransactionReceipt } from "wagmi";

const TABLE_HEAD = ["Section", "Delivery", "Amount"];

const TABLE_ROWS = [
  {
    title: "timestamp as input and returns a formatted",
    date: "5d",
    amount: "$50",
  },
];

const OrderTrackPage = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { orderId } = useParams();
  const axiosInstance = useAxiosInstance();
  const { _id } = useAuth();
  const [task, setTask] = useState({});
  const [order, setOrder] = useState({});
  const user = useRecoilValue(userAtom)
  const [section, setSection] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const { showToast, dismissToast, loadingToast, successToast, errorToast } = useShowToast();
  const [toastId, setToastId] = useState(null);
  const {
    completeSection,
    completeSectionHash,
    isCompleteSectionPending,
    completeSectionError,
    approveSection,
    approveSectionHash,
    isApproveSectionPending,
    approveSectionError,
    cancelOrder,
    cancelOrderHash,
    isCancelOrderPending,
    cancelOrderError
  } = useTaskManagement();

  const { isLoading: isTransactionConfirming, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      hash: completeSectionHash,
    });

  useEffect(() => {
    if (isCompleteSectionPending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
    }
    if (isTransactionConfirming) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast(
        "Waiting for confirmation on the blockchain..."
      );
      setToastId(newToastId);
    }
    if (isTransactionConfirmed) {
      successToast(`Order delivered successfully!`, { id: toastId });
    }
    if (completeSectionError) {
      errorToast(completeSectionError, { id: toastId });
    }
  }, [
    isCompleteSectionPending,
    isTransactionConfirming,
    isTransactionConfirmed,
    completeSectionError,
  ]);

  const { isLoading: isApproving, isSuccess: isApproved } =
    useWaitForTransactionReceipt({
      hash: approveSectionHash,
    });

  useEffect(() => {
    if (isApproveSectionPending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
    }
    if (isApproving) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast(
        "Waiting for confirmation on the blockchain..."
      );
      setToastId(newToastId);
    }
    if (isApproved) {
      successToast(`Order delivery approved successfully!`, { id: toastId });
    }
    if (approveSectionError) {
      errorToast(approveSectionError, { id: toastId });
    }
  }, [
    isApproveSectionPending,
    isApproving,
    isApproved,
    approveSectionError,
  ]);

  const { isLoading: isCancelling, isSuccess: isCancelled } =
    useWaitForTransactionReceipt({
      hash: cancelOrderHash,
    });

  useEffect(() => {
    if (isCancelOrderPending) {
      const newToastId = loadingToast("Waiting for approval from wallet...");
      setToastId(newToastId);
    }
    if (isCancelling) {
      if (toastId) dismissToast(toastId);
      const newToastId = loadingToast(
        "Waiting for confirmation on the blockchain..."
      );
      setToastId(newToastId);
    }
    if (isCancelled) {
      successToast(`Order cancelled successfully!`, { id: toastId });
    }
    if (cancelOrderError) {
      errorToast(cancelOrderError, { id: toastId });
    }
  }, [
    isCancelOrderPending,
    isCancelling,
    isCancelled,
    cancelOrderError,
  ]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await axiosInstance.get(`order/track/${orderId}`);
        const data = res.data;

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setOrder(data.order);
        setTask(data.task)
        setSection(data.section);
        setIsOrderCompleted(data.order.status === "completed");
      } catch (error) {
        console.log(error);
        showToast("Error", error.response.data.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [showToast, orderId]);

  useEffect(() => {
    const calculateCountdown = () => {
      if (!order.createdAt) return;

      const createdAtDate = new Date(order.createdAt);
      const currentDate = new Date();

      const difference = currentDate - createdAtDate;

      let remaining = section.durationDays * 24 * 60 * 60 * 1000 - difference;

      if (remaining <= 0 && !isOrderCompleted) {
        setIsCountdownComplete(true);
        if (_id === order.freelancer) {
          setErrorMessage("Time's up! The section duration has ended. Please contact the client for an extension or to discuss next steps.");
        } else if (_id === order.client) {
          setErrorMessage("The deadline for this section has passed. You may want to contact the freelancer or consider your options.");
        }
        remaining = 0;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      remaining -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      remaining -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(remaining / (1000 * 60));
      remaining -= minutes * 1000 * 60;
      const seconds = Math.floor(remaining / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    const interval = setInterval(calculateCountdown, 1000);

    if (isOrderCompleted || (isCountdownComplete && !isOrderCompleted)) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [order, section, _id, isCountdownComplete, isOrderCompleted]);
  
  console.log(section)

  const handleMarkCompleted = async () => {
    try {
      if (section.isCryptoPost === true) {
        const result = await approveSection(task?._id, section?._id, _id, section?.assignTo);
        console.log('Toggle section publication status result:', result);
      } else {
        const res = await axiosInstance.put(`order/${orderId}/approve`);
        const data = await res.data;
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        showToast("Success", data.message, "success");
      }

      setOrder({ ...order, status: "completed" });
      setIsOrderCompleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelOrder = async () => {
    try {
      if (section?.isCryptoPost === true) {
        const result = await cancelOrder(task?._id, section?._id, _id);
        console.log('Toggle section publication status result:', result);
      } else {
        const res = await axiosInstance.put(`order/cancel/${orderId}`);
        const data = await res.data;
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        showToast("Success", data.message, "success");
      }
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      if (section.isCryptoPost === true) {
        const result = await completeSection(task?._id, section?._id, _id);
        console.log('Toggle section publication status result:', result);
      } else {
        const res = await axiosInstance.put(`order/${orderId}/deliver`);
        const data = await res.data;
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        showToast("Success", data.message, "success");
      }

      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = (action) => {
    setModalAction(action);
    setShowModal(true);
  };

  if (loading) return <Spinner />;

  const countdownClass = isCountdownComplete ? "text-red-500" : "text-blue-500";
  const classes = "p-4 border-b border-blue-gray-50";

  const status = order.status;
  let statusColor = "text-[#E0BF00]";
  switch (status) {
    case "delivered":
      statusColor = "text-[#7d85f5]";
      break;
    case "completed":
      statusColor = "text-green-700";
      break;
    case "cancelled":
      statusColor = "text-red-700";
      break;
    case "Overdue":
      statusColor = "text-[#E40DC4]";
      break;
  }

  return (
    <SidebarWithHeader>
      <div className="flex px-10 sm:px-24 md:px-20 lg:px-0 lg:py-4 lg:flex-row flex-col justify-center">
        <div className="flex flex-col items-center gap-2 py-8 px-4">
          <div className="flex w-full justify-center bg-gray-200 rounded-md shadow-inner">
            <div className="px-4 py-4">
              <div>
                <div className="flex gap-2 items-center justify-center">
                  <Avatar src={"/mm avatar.jpg"} alt="freelancer" size={"xl"} />
                  <h1 className="text-lg lg:text-xl">{section?.title}</h1>
                </div>
                <div className="flex justify-between items-center">
                  <div className="hidden md:block">
                    <Breadcrumbs separator=">">
                      <Link to="/dashboard" className="opacity-60">
                        Dashboard
                      </Link>
                      <Link to="/manage-orders" className="opacity-60">
                        My Orders
                      </Link>
                    </Breadcrumbs>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(order?.createdAt).toLocaleString()}
                  </p>
                </div>

                <Card className="h-full w-full shadow mt-2">
                  <table className="w-full table-auto text-left rounded">
                    <thead>
                      <tr>
                        {TABLE_HEAD.map((head) => (
                          <th
                            key={head}
                            className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                          >
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal leading-none opacity-70"
                            >
                              {head}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-sm lg:text-base"
                          >
                            {section.title}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {section.durationDays}d
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatPrice(order.sectionPrice)}
                          </Typography>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center bg-gray-200 rounded-md shadow-inner">
            <div className="px-4 py-4">
              {isCountdownComplete && !isOrderCompleted ? (
                <div className="text-red-500 text-center font-bold mb-4">
                  {errorMessage}
                </div>
              ) : (
                <div className={`grid grid-flow-col gap-5 text-center auto-cols-max ${isOrderCompleted ? 'text-green-500' : countdownClass}`}>
                  <div className="flex flex-col p-2 bg-neutral rounded-box">
                    <span className="countdown font-mono text-5xl">
                      <span style={{ "--value": countdown.days }}></span>
                    </span>
                    days
                  </div>
                  <div className="flex flex-col p-2 bg-neutral rounded-box">
                    <span className="countdown font-mono text-5xl">
                      <span style={{ "--value": countdown.hours }}></span>
                    </span>
                    hours
                  </div>
                  <div className="flex flex-col p-2 bg-neutral rounded-box">
                    <span className="countdown font-mono text-5xl">
                      <span style={{ "--value": countdown.minutes }}></span>
                    </span>
                    min
                  </div>
                  <div className="flex flex-col p-2 bg-neutral rounded-box">
                    <span className="countdown font-mono text-5xl">
                      <span style={{ "--value": countdown.seconds }}></span>
                    </span>
                    sec
                  </div>
                </div>
              )}

              {isOrderCompleted && (
                <div className="text-green-500 text-center font-bold mt-4">
                  Order completed successfully!
                </div>
              )}

              <div className="flex items-center justify-center mt-4 gap-2">
                <Badge className={`${statusColor} uppercase`} variant="outline">
                  {order.status}
                </Badge>
              </div>

              <div className="flex items-center justify-center mt-4 gap-2">
                {_id === order.client ? (
                  <>
                    <Button
                      variant="solid"
                      colorScheme="green"
                      onClick={handleMarkCompleted}
                      isDisabled={order.status === "completed"}
                    >
                      Mark Completed
                    </Button>

                    <Button
                      variant="solid"
                      colorScheme="red"
                      onClick={() => handleOpenModal("cancel")}
                      isDisabled={order.status === "completed"}
                    >
                      Cancel Order
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    onClick={() => handleOpenModal("deliver")}
                    isDisabled={order.status === "completed"}
                  >
                    Deliver
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to{" "}
            {modalAction === "deliver" ? "deliver this order" : "cancel this order"}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              colorScheme={modalAction === "deliver" ? "blue" : "red"}
              onClick={modalAction === "deliver" ? handleConfirmDelivery : handleCancelOrder}
            >
              {modalAction === "deliver" ? "Deliver Order" : "Cancel Order"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarWithHeader>
  );
};

export default OrderTrackPage;