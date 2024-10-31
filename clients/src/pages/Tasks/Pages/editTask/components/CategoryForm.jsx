import React, { useState } from "react";
import { EditIcon } from "@chakra-ui/icons";
import { FormControl, FormErrorMessage, FormHelperText, Select, Button } from "@chakra-ui/react";
import { Box } from "@chakra-ui/layout";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../api/axios";

const CategoryForm = ({ initialData, taskId, options, setTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const [selectedCategory, setSelectedCategory] = useState(initialData.categoryId);
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = useAxiosInstance()
  const {showToast} = useShowToast()

  console.log(initialData)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      // setIsLoading(true);
      console.log("first sending...")
      await axiosInstance.put(`/tasks/edit-task/${taskId}/category`, { categoryId: selectedCategory });
      showToast('Success', "Task updated", 'success')
      toggleEdit();
      setTask((prev) => ({ ...prev, categoryId: selectedCategory }));
    } catch (error) {
      console.log(error)
      showToast('Error', 'Something went wrong', 'error')
    }
    // finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className=" mt-6 border border-solid border-1 border-slate-300 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Category
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <EditIcon className="h-4 w-4 mr-2" />
              Edit category
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <Box mt={2} className={!initialData.categoryId && "italic"}>
          {options.find((option) => option.value === initialData.categoryId)?.label || "No category"}
        </Box>
      )}
      {isEditing && (
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <FormControl id="categoryId" isInvalid={!selectedCategory} isRequired>
            <Select
              placeholder="Select category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              isDisabled={isLoading}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FormErrorMessage>Please select a category</FormErrorMessage>
            <FormHelperText>Choose a category for the task</FormHelperText>
          </FormControl>
          <Button colorScheme="blue" isDisabled={!selectedCategory || isLoading} type="submit">
            Save
          </Button>
        </form>
      )}
    </div>
  );
};

export default React.memo(CategoryForm);
