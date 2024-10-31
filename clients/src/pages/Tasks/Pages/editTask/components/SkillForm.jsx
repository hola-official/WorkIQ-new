import { Pencil } from "lucide-react";
import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Alert,
  AlertIcon,
  Icon,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useAxiosInstance } from "../../../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { Badge } from "@/components/ui/badge";

export const SkillForm = ({ initialData, taskId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(initialData.skills || []);
  const [skillInputValue, setSkillInputValue] = useState("");
  const [skillError, setSkillError] = useState("");
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();

  const toggleEdit = () => setIsEditing((current) => !current);

  const handleSkillInputChange = (e) => {
    setSkillInputValue(e.target.value);
  };

  const handleSkillAdd = () => {
    if (skillInputValue.trim() === "") {
      setSkillError("Skill cannot be empty");
      return;
    }
    if (skills.includes(skillInputValue)) {
      setSkillError("Skill already exists");
      return;
    }
    setSkills([...skills, skillInputValue]);
    setSkillInputValue("");
    setSkillError("");
  };

  const handleSkillRemove = (skillToRemove) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
  };

  const onSubmit = async () => {
    try {
      const response = await axiosInstance.put(`/tasks/edit-task/${taskId}`, {
        skills: skills,
      });
      console.log("Task updated successfully:", response.data.task);
      toggleEdit();
      showToast("Success", "Skills updated successfully", "success");
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Error", "Error updating skills", "error");
    }
  };

  return (
    <div className="mt-6 border border-solid border-1 border-blue-300 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Skills
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Skill
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        // (!initialData.taskImage ? (
        // 	<div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
        // 		<ImageIcon className="h-10 w-10 text-slate-500" />
        // 	</div>
        // ) :
        <div className="   mt-2">
          <div className="flex gap-3 flex-wrap">
            {skills.map((skill, index) => (
              // <Tag key={index} borderRadius="lg" color="white" bg="blue.500">
              //   <TagLabel>{skill}</TagLabel>
              // </Tag>

              <Badge
                key={index}
                className="text-[10px] font-medium leading-[13px] bg-light-800 dark:bg-dark-300 text-light-400 dark:text-light-500 flex items-center justify-center gap-1 rounded-md border-none px-4 py-2 capitalize"
              >
                {skill}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-5">Add skill to get related </div>
        </div>
      )}
      {isEditing && (
        <Box gap={10} mt={4}>
          <Flex flexDir="column" gap={2} mt={2}>
            <Input
              value={skillInputValue}
              onChange={handleSkillInputChange}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSkillAdd();
                }
              }}
            />
            {skillError && (
              <Alert status="error">
                <AlertIcon />
                {skillError}
              </Alert>
            )}
            <div className="flex gap-3 flex-wrap">
              {skills.map((skill, index) => (
                // <Tag key={index} borderRadius="lg" color="white" bg="blue.500">
                //   <TagLabel>{skill}</TagLabel>
                //   <TagCloseButton onClick={() => handleSkillRemove(skill)} />
                // </Tag>
                <div>
                  <Badge
                    key={index}
                    className="text-[10px] font-medium leading-[13px] bg-light-800 dark:bg-dark-300 text-light-400 dark:text-light-500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize"
                  >
                    {skill}
                    <Icon
                      as={CloseIcon}
                      cursor={"pointer"}
                      onClick={() => handleSkillRemove(skill)}
                    />
                    {/* <CloseIcon
                    boxSize={6}
                    cursor={"pointer"}
                    onClick={() => handleSkillRemove(skill)}
                  /> */}
                  </Badge>
                </div>
              ))}
            </div>
          </Flex>
          <Button
            mt={2}
            onClick={onSubmit}
            colorScheme="blue"
            size={{ md: "sm" }}
          >
            Save Skills
          </Button>
        </Box>
      )}
    </div>
  );
};
