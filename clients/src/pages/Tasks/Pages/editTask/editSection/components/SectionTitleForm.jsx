import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@chakra-ui/react";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../../api/axios";

const formSchema = z.object({
  title: z.string().min(1),
});
export const SectionTitleForm = ({
  initialData,
  taskId,
  sectionId,
  setRefetchSection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const {showToast} = useShowToast();
  const axiosInstance = useAxiosInstance();
  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  const { isSubmitting, isValid } = form.formState;

  console.log(initialData)
  const onSubmit = async (values) => {
    try {
      await axiosInstance.put(
        `/tasks/edit-task/${taskId}/section/${sectionId}`,
        values
      );
      showToast("Success", "Task updated successfully", "success");
      toggleEdit();
      setRefetchSection(prev => prev + 1)
      // router.refresh();
    } catch (error) {
      console.log(error);
      showToast(
        "Error",
        "Something went wrong" ||
          error.response.data.message ||
          error.response.data.error,
        "error"
      );
    }
  };
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Title
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
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
                      placeholder="e.g. 'Introduction to the task'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                colorScheme="blue"
                isDisabled={!isValid || isSubmitting}
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
