"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@chakra-ui/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SectionList } from "./SectionList";
import { useNavigate } from "react-router-dom";
import useShowToast from "../../../../../hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../api/axios";

const formSchema = z.object({
	title: z.string().min(1),
});
export const SectionForm = ({ setTask, initialData, taskId }) => {
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const navigate = useNavigate()
	const {showToast} = useShowToast()
	const axiosInstance = useAxiosInstance()
	const toggleCreating = () => {
		setIsCreating((current) => !current);
	};
	// const router = useRouter();
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
		},
	});
	const { isSubmitting, isValid } = form.formState;
	const onSubmit = async (values) => {
		console.log(values)
		try {
			// await createSection({
			// 	id: taskId,
			// 	...values,
			// }).unwrap();
			await axiosInstance.put(`/tasks/edit-task/${taskId}/create-section`, values);
			const res = await axiosInstance.get(`/tasks/${taskId}`);
			const data = await res.data;


			setTask((prev) => ({ ...prev, ...data }));
			showToast('Success', 'Section created', 'success')
			toggleCreating();
			form.reset();
			// router.refresh();
		} catch(error) {
			// showToast('Error', 'Something went wrong', 'error')
			if (error) {
        showToast(
          "Error",
          error.response.data.message || error.response.data.error,
          "error"
        );
      }
		}
	};
	const onReorder = async (updateData) => {
		console.log(updateData)
		try {
			setIsUpdating(true);
			await axiosInstance.put(`/tasks/edit-task/${taskId}/reorder-sections`, {
			    list: updateData
			});
			showToast('Success', 'Section reordered', 'success')
		} catch(error) {
			if (error) {
        showToast(
          "Error",
          error.response.data.message || error.response.data.error,
          "error"
        );
      }
		} finally {
			setIsUpdating(false);
		}
	};
	const onEdit = (id) => {
		navigate(`/clients/edit-task/${taskId}/section/${id}`)
		console.log(id)
	};
	return (
		
		<div className="relative mt-6 border shadow-md border-solid border-1 border-blue-300 rounded-md p-4">
			{isUpdating && (
				<div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
					<Loader2 className="animate-spin h-6 w-6 text-sky-700" />
				</div>
			)}
			<div className="font-medium flex items-center justify-between">
				Section
				<Button onClick={toggleCreating} variant="ghost">
					{isCreating ? (
						<>Cancel</>
					) : (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add a section
						</>
					)}
				</Button>
			</div>
			
			{isCreating && (
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
											placeholder="e.g. 'Introduction to the task'"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button colorScheme="blue" isDisabled={!isValid || isSubmitting} type="submit">
							Create
						</Button>
					</form>
				</Form>
			)}
				
			{!isCreating && (
				<div
					className={cn(
						"text-sm mt-2",
						!initialData.sections && "text-slate-500 italic"
					)}
				>
					{!initialData.sections && "No section"}
					<SectionList
						onEdit={onEdit}
						onReorder={onReorder}
						items={initialData.sections || []}
					/>
				</div>
			)}
			{!isCreating && (
				<p className="text-xs text-muted-foreground mt-4">
					Drag and drop to reorder the section
				</p>
			)}
		</div>
	);
};
