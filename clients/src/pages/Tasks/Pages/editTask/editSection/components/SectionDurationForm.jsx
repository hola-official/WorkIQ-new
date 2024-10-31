"use-client";
import * as z from "zod";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Select } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAxiosInstance } from "../../../../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";

const formSchema = z.object({
  durationDays: z.number().min(3),
});

export const SectionDurationForm = ({
  initialData,
  taskId,
  setRefetchSection,
  sectionId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();
  const [value, setValue] = useState(initialData.durationDays);
  // const [durationDays, setDurationDays] = useState(initialData.durationDays || 2);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `/tasks/edit-task/${taskId}/section/${sectionId}`,
        JSON.stringify({ durationDays: value })
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
  // console.log(isValid);
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Duration
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.durationDays && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add duration
            </>
          )}
          {!isEditing && initialData.durationDays && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit duration
            </>
          )}
        </Button>
      </div>
      {!isEditing && initialData.durationDays && (
        <div className="mt-2">
          <span>Duration: {initialData.durationDays} days</span>
          <div className="text-xs text-muted-foreground mt-4">
            You can adjust the duration as per your requirement.
          </div>
        </div>
      )}
      {isEditing && (
        <div>
          {/* <Form {...form}> */}
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            {/* <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormControl> */}
            <Select
              colorScheme={"blue"}
              defaultValue={value}
              icon={<ChevronDownIcon />}
              onChange={(e) => setValue(e.target.value)}
              isDisabled={isSubmitting}
              // {...field}
              className="input"
            >
              {[...Array(35).keys()].map((index) => (
                <option key={index + 3} value={index + 3}>
                  {index + 3} days
                </option>
              ))}
            </Select>
            {/* </FormControl>
                  </FormItem>
                )}
              /> */}

            <div className="flex items-center gap-x-2">
              <Button
                colorScheme="blue"
                isDisabled={isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
          {/* </Form> */}
        </div>
      )}
    </div>
  );
};
