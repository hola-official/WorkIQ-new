// "use client";
// import axios from "axios";
import { LuTrash } from "react-icons/lu";
import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import {
// 	openConfetti,
// } from "@/features/confettiSlice";
// import { useDeleteTaskMutation, useToggleTaskPublishMutation } from "@/features/tasks/tasksApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "../../../hooks/useShowToast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export const Actions = ({ disabled, isPublished }) => {
  // const router = useRouter();
  // const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  // const [toggleTaskPublish] = useToggleTaskPublishMutation(); // Ensure you have the appropriate mutation hook
  // const [deleteTask] = useDeleteTaskMutation(); // Ensure you have the appropriate mutation hook
  const navigate = useNavigate();
  const [task, setTask] = useState();
  const axiosInstance = useAxiosInstance();
  const { taskId } = useParams();
  const {showToast} = useShowToast();
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axiosInstance.get(`/tasks/${taskId}`);
        const data = await res.data;
        console.log(data);
        setTask(data);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        showToast("Error", "Something went wrong", "error");
        // navigate("/clients/my-tasks");
      }
    };
    fetchTaskData();
  }, [taskId]);

  const onClick = async () => {
    console.log(taskId)
    try {
      setIsLoading(true);
      await axiosInstance.put(`/tasks/edit-task/${taskId}`);
      showToast("Success", "Task unpublished", "success");
      // router.refresh();
    } catch (error) {
      showToast(
        "Error",
        // error.response.data.message ||
        "Something went wrong",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.delete(`/tasks/${taskId}`);
      const data = await res.data;
      console.log(taskId);
      console.log(data);
      // navigate(`/clients/my-tasks`);
      showToast("Success", "Task deleted", "success");
    } catch (error) {
      console.log(error);
      showToast("Error", "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-x-2">
      {/* <Button
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button> */}


      <FaEdit
        size={25}
        color="blue"
        disabled={disabled || isLoading}
        cursor={"pointer"}
        onClick={onClick}
      />

      <ConfirmModal onConfirm={onDelete}>
        <MdDelete
          size={25}
          disabled={isLoading}
          color="red"
          cursor={"pointer"}
        />
      </ConfirmModal>
    </div>
  );
};
