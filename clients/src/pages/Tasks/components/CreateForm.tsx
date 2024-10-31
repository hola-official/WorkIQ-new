import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Center,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "./../../../hooks/useShowToast";
import { useNavigate } from "react-router-dom";

const CreateForm = () => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Validation logic
    if (title.trim().length < 1) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Submit logic
    try {
      // Your submit logic here
      const res = await axiosInstance.post(
        "/tasks/create-title",
        JSON.stringify({ title })
      );
      const data = res.data;
      const task = data.task

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Task created successfully!", "success");
      console.log(data.task);
      setIsSubmitting(false);

      navigate(`/clients/edit-task/${task._id}`);
    } catch (error) {
      if (error) {
        showToast(
          "Error",
          error.response.data.message || error.response.data.error,
          "error"
        );
      }
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      h={"100vh"}
      pos={{ md: "fixed" }}
      px={30}
    >
      <Stack spacing={8} direction={{ base: "column", md: "row" }}>
        <Flex flexDir="column" w={{ base: "100%", md: "50%" }}>
          <Text
            fontSize={{ base: "2xl", lg: "4xl" }}
            fontWeight={500}
          >
            Let's start with a strong title.
          </Text>
          <Text fontSize="md" color="gray.600">
            This helps your task post stand out to the right candidates. It's
            the first thing they'll see, so make it count!
          </Text>
        </Flex>

        <Flex flexDir="column">
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Write a title for your task post</FormLabel>
                <Input
                  isDisabled={isSubmitting}
                  placeholder="e.g. 'Advanced web development'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Button as="a" href="/clients/my-tasks" variant="ghost">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme={"blue"}
                  isDisabled={
                    !isValid || isSubmitting
                    // ? 'true' : 'false'
                  }
                >
                  Continue
                </Button>
              </Stack>
            </Stack>
          </form>
          <Flex flexDir={"column"} mt={4}>
            <Box>
              <Text fontSize={{ base: "md", md: "xl" }} fontWeight={500}>
                Example titles
              </Text>
            </Box>
            <UnorderedList mt={2}>
              <ListItem>
                Build responsive WordPress site with booking/payment
                functionality
              </ListItem>
              <ListItem>
                Graphic designer needed to design ad creative for multiple
                campaigns
              </ListItem>
              <ListItem>
                Facebook ad specialist needed for product launch
              </ListItem>
            </UnorderedList>
          </Flex>
        </Flex>
      </Stack>
    </Flex>
  );
};

export default CreateForm;
