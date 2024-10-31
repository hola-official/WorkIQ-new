"use client";
import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { Pencil } from "lucide-react";
import { LuPencil } from "react-icons/lu";
import { useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Button, Input } from "@chakra-ui/react";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../api/axios";

const formSchema = z.object({
	title: z.string().min(1, {
		message: "Title is required",
	}),
});
export const TitleForm = ({ setTask, initialData, taskId }) => {
	const [isEditing, setIsEditing] = useState(false);
	const {showToast} = useShowToast();
	const axiosInstance = useAxiosInstance();
	const [updating, setUpdating] = useState(false);
	const toggleEdit = () => setIsEditing((current) => !current);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: initialData,
	});
	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values) => {
		if (updating) return;
		setUpdating(true);
		try {
			// console.log(values);
			// await updateTask({ id: taskId, ...values }).unwrap();
			await axiosInstance.put(`/tasks/edit-task/${taskId}`, values);
			// form.reset({ title: '' });
			setTask((prev) => ({ ...prev, title: values.title }));
			showToast("Success", "Task updated", "success");
			toggleEdit();
			// router.refresh();
		} catch (error) {
			if (error) {
				showToast(
					"Error",
					error.response.data.message || error.response.data.error,
					"error"
				);
			}
		} finally {
			setUpdating(false);
		}
	};
	return (
		<div className="mt-6 border shadow-md rounded-md p-4 border-10 border-solid border-1 border-blue-300">
			<div className="font-medium flex items-center justify-between">
				Title
				<Button variant='ghost' onClick={toggleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<LuPencil className="h-4 w-4 mr-2" />
							Edit title
						</>
					)}
				</Button>
			</div>
			{!isEditing && <p className="text-sm mt-2">{initialData.title}</p>}
			{isEditing && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											disabled={isSubmitting}
											placeholder="e.g. 'Advanced web development'"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex items-center gap-x-2">
							<Button
								isDisabled={!isValid || isSubmitting}
								colorScheme="blue"
								type="submit"
							>
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};
