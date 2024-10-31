import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Trash } from "lucide-react";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import useShowToast from "@/hooks/useShowToast";
import useAuth from "@/hooks/useAuth";
import { useAxiosInstance } from "../../../../../../../api/axios";
import { ConfirmPublishModal } from "./ConfirmPublishModal";

export const SectionActions = ({ disabled, taskId, sectionId, isPublished, section, task, onSectionUpdate }) => {
	const [isLoading, setIsLoading] = useState(false);
	const { showToast, dismissToast, loadingToast, successToast, errorToast } = useShowToast();
	const { _id: userId } = useAuth();
	const [toastId, setToastId] = useState(null);
	const axiosInstance = useAxiosInstance();
	const { isConnected } = useAccount();

	const {
		toggleSectionPublicationStatus,
		toggleSectionPublicationStatusHash,
		isToggleSectionPublicationStatusPending,
		toggleSectionPublicationStatusError,
	} = useTaskManagement();

	const { refetch } = toggleSectionPublicationStatus(userId)
	const {
		deleteSection,
		deleteSectionHash,
		isDeleteSectionPending,
		deleteSectionError,
	} = useTaskManagement();

	const { isLoading: isTransactionConfirming, isSuccess: isTransactionConfirmed } =
		useWaitForTransactionReceipt({
			hash: toggleSectionPublicationStatusHash,
		});

	const { isLoading: isDeletingSectionConfirming, isSuccess: isDeletingSectionConfirmed } =
		useWaitForTransactionReceipt({
			hash: deleteSectionHash,
		});

	useEffect(() => {
		if (isToggleSectionPublicationStatusPending) {
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
			successToast(`Section ${isPublished ? 'Section unListed' : 'Section Listed'} successfully!`, { id: toastId });
			// Trigger a refresh of the task data
			onSectionUpdate();
		}
		if (toggleSectionPublicationStatusError) {


			errorToast(toggleSectionPublicationStatusError, { id: toastId });
		}
	}, [
		isToggleSectionPublicationStatusPending,
		isTransactionConfirming,
		isTransactionConfirmed,
		toggleSectionPublicationStatusError,
	]);

	useEffect(() => {
		if (isDeleteSectionPending) {
			const newToastId = loadingToast("Waiting for approval from wallet...");
			setToastId(newToastId);
		}
		if (isDeletingSectionConfirming) {
			if (toastId) dismissToast(toastId);
			const newToastId = loadingToast(
				"Waiting for confirmation on the blockchain..."
			);
			setToastId(newToastId);
		}
		if (isDeletingSectionConfirmed) {
			successToast(`Section deleted successfully!`, { id: toastId });
			// Trigger a refresh of the task data
			onSectionUpdate();
		}
		if (deleteSectionError) {


			errorToast(deleteSectionError, { id: toastId });
		}
	}, [
		isDeleteSectionPending,
		isDeletingSectionConfirming,
		isDeletingSectionConfirmed,
		deleteSectionError,
	]);

	console.log(section)

	const handlePublishUnpublish = async (data) => {
		setIsLoading(true);
		try {
			// const isCrypto = data.paymentMethod === "crypto";

			console.log(task?._id, section?._id, userId)
			if (section.isCryptoPost === true) {
				// Only interact with blockchain for crypto payments
				const result = await toggleSectionPublicationStatus(task?._id, section?._id, userId, section.price.toString());
				console.log('Toggle section publication status result:', result);
				// refetch()
			} else {
				// Handle USD payment method
				await axiosInstance.put(`/tasks/edit-task/${taskId}/section/${sectionId}/toggle-publish`);
				showToast("Success", isPublished ? "Section unListed" : "Section Listed", "successfully!");
			}
		} catch (error) {
			console.error("Error in handlePublishUnpublish:", error);
			errorToast(error.message || "An error occurred during the operation.");
		} finally {
			setIsLoading(false);
		}
	};

	const onDelete = async () => {
		try {
			setIsLoading(true);
			if (section.isCryptoPost === true) {
				// Only interact with blockchain for crypto payments
				const result = await deleteSection(task?._id, section?._id, userId,);
				console.log('Toggle section publication status result:', result);
				// showToast('Success', "Section deleted", 'success');
			} else {
				await axiosInstance.delete(`/tasks/edit-task/${taskId}/section/${sectionId}`);
				showToast('Success', "Section deleted", 'success');
			}
		} catch (error) {
			console.error(error);
			showToast(
				"Error",
				"Something went wrong" ||
				error.response?.data?.message ||
				error.response?.data?.error,
				"error"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-x-2">
			{/* <ConfirmPublishModal price={section.price} onConfirm={handlePublishUnpublish}> */}
			<Button
				isDisabled={disabled || isLoading || isTransactionConfirming}
				isLoading={isLoading || isTransactionConfirming}
				variant="outline"
				onClick={handlePublishUnpublish}
				size="sm"
			>
				{section.isPublished ? "UnList" : "List"}
			</Button>
			{/* </ConfirmPublishModal> */}
			<ConfirmModal onConfirm={onDelete}>
				<Button size="sm" isDisabled={isLoading}>
					<Trash className="h-4 w-4" />
				</Button>
			</ConfirmModal>
		</div>
	);
};