// "use client";
// import axios from "axios";
import { LuTrash } from "react-icons/lu";
import { useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../../../components/ui/confirm-modal";
// import {
// 	openConfetti,
// } from "@/features/confettiSlice";
// import { useDeleteTaskMutation, useToggleTaskPublishMutation } from "@/features/tasks/tasksApiSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { useAxiosInstance } from "../../../../../../api/axios";
import useShowToast from "../../../../../hooks/useShowToast";

export const Actions = ({ disabled, taskId, isPublished }) => {
  console.log(disabled);
  // const router = useRouter();
  // const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  // const [toggleTaskPublish] = useToggleTaskPublishMutation(); // Ensure you have the appropriate mutation hook
  // const [deleteTask] = useDeleteTaskMutation(); // Ensure you have the appropriate mutation hook
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();

  // const deleteFolderAndContents = async (folderPath) => {
  // 	const storage = getStorage();
  // 	const folderRef = ref(storage, folderPath);

  // 	try {
  // 		// List all items in the folder
  // 		const { items, prefixes } = await listAll(folderRef);
  // 		// console.log(items)
  // 		// console.log(prefixes)

  // 		// Delete items in the folder if any
  // 		if (items.length > 0) {
  // 			await Promise.all(
  // 				items.map(async (itemRef) => {
  // 					// Delete individual file
  // 					await deleteObject(itemRef);
  // 				})
  // 			);
  // 		}

  // 		// Recursively delete subdirectories if any
  // 		if (prefixes.length > 0) {
  // 			await Promise.all(
  // 				prefixes.map(async (prefix) => {
  // 					await deleteFolderAndContents(prefix._location.path_);
  // 				})
  // 			);
  // 		}

  // 		console.log("Folder and its contents deleted successfully");
  // 	} catch (error) {
  // 		showToast("Error", "Something went wrong", 'error')
  // 		// toast.error("Something went wrong");
  // 		console.error("Error deleting folder and its contents:", error);
  // 	}
  // };

  const onClick = async () => {
    console.log(isPublished);
    try {
      setIsLoading(true);
      if (isPublished) {
        // await toggleTaskPublish({
        // 	id: taskId,
        // }).unwrap();
        await axiosInstance.put(`/tasks/edit-task/${taskId}/toggle-publish`);
        showToast("Success", "Task unpublished", "success");
      } else {
        // await toggleTaskPublish({
        // 	id: taskId,
        // }).unwrap();
        await axiosInstance.put(`/tasks/edit-task/${taskId}/toggle-publish`);
        showToast("Success", "Task published", "success");
        // confetti.onOpen();
        // dispatch(openConfetti());
        navigate(`/clients/my-tasks`);
      }
      // router.refresh();
    } catch (error) {
      showToast(
        "Error",
        error.response.data.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      // const folderPath = `Tasks/${taskId}`;
      // await deleteFolderAndContents(folderPath);

      // await deleteTask({
      // 	id: taskId,
      // }).unwrap(); //     toast.success("Chapter deleted");
      await axiosInstance.delete(`/tasks/${taskId}`);
      navigate(`/clients/my-tasks`);
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
      <Button
        onClick={onClick}
        isDisabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <LuTrash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
