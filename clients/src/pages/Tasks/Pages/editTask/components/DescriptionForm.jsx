import { LuPencil } from "react-icons/lu";
import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
// import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Button } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { useUpdateTaskMutation } from "@/features/tasks/tasksApiSlice";
import { cn } from "@/lib/utils";
import Editor from "@/components/ui/editor";
import { Textarea } from "@/components/ui/textarea";
import { useAxiosInstance } from "../../../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { Input } from "@/components/ui/input";
// import DOMPurify from "dompurify";

const formSchema = z.object({
	description: z.string().min(1, {
		message: "Description is required",
	}),
});

export const DescriptionForm = ({ initialData, taskId, setTask }) => {
	const [isEditing, setIsEditing] = useState(false);
	const toggleEdit = () => setIsEditing((current) => !current);
	const [value, setValue] = useState(initialData.description);
	// const [isSubmitting, setIsSubmitting] = useState(false);
	const axiosInstance = useAxiosInstance()
	const {showToast} = useShowToast()

	// useEffect(() => {
	// 	// Validation logic
	// 	if (description.trim().length < 1) {
	// 		setIsValid(false);
	// 	} else {
	// 		setIsValid(true);
	// 	}
	// }, [title]);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: initialData,
	});
	const { isSubmitting, isValid, } = form.formState;

	const onSubmit = async (values) => {
		try {
			await axiosInstance.put(`/tasks/edit-task/${taskId}`, values);
			console.log(value)
			setTask((prev) => ({ ...prev, description: values.description }));
			showToast('Success', 'Task updated successfully', 'success')
			setIsEditing(false);
		} catch (error) {
			if (error) {
        showToast(
          "Error",
          error.response.data.message || error.response.data.error,
          "error"
        );
      }
		}
	};
	return (
		<div className="mt-6 border border-solid border-1 border-blue-300 rounded-md p-4">
			<div className="font-medium flex items-center justify-between">
				Task description
				<Button onClick={toggleEdit} variant="ghost">
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<LuPencil className="h-4 w-4 mr-2" />
							Edit description
						</>
					)}
				</Button>
			</div>
			{!isEditing && (
				<div
					className={cn(
						"text-sm mt-2 no-tailwindcss-base max-h-50 overflow-y-hidden",
						!initialData.description && "text-slate-500 italic"
					)}
				>
					{!initialData.description && "No description"}
					{initialData.description && parse(initialData.description)}
				</div>
			)}
			{isEditing && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-4">
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
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
							<Button colorScheme="blue" disabled={!value || isSubmitting} type="submit">
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};
