import { Box, Flex, Text } from "@chakra-ui/react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { Banner } from "@/components/ui/banner";
import { Actions } from "./components/Actions";
import { IconBadge } from "@/components/ui/icon-badge";
import { LuLayoutDashboard } from "react-icons/lu";
import { SkillForm } from "./components/SkillForm";
import { CircleDollarSign, File, ListChecks } from "lucide-react";
import { useAxiosInstance } from "../../../../../api/axios";
import useShowToast from "../../../../hooks/useShowToast";
import { SectionForm } from "./components/SectionForm";
import { PriceForm } from "./components/PriceForm";
import CategoryForm from "./components/CategoryForm";
import { TitleForm } from "./components/TitleForm";
import { DescriptionForm } from "./components/DescriptionForm";
import Spinner from "@/components/Spinner";
// import { PriceForm } from "./components/PriceForm";
// import { SectionForm } from "./components/SectionForm";

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { username, isClient, isAdmin, _id } = useAuth();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [taskCategoriesData, setTaskCategoriesData] = useState(null);
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axiosInstance.get(`/tasks/${taskId}`);
        const data = await res.data;
        console.log(data);
        setTask(data);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        showToast("Error", "Something went wrong", "error");
        navigate("/clients/my-tasks");
      }
    };

    const fetchTaskCategories = async () => {
      try {
        const categoriesResponse = await axiosInstance.get(
          `/tasks/task-categories`
        );
        const data = categoriesResponse.data;
        setCategories(data);
        // setTaskCategoriesData(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch task categories:", error);
      }
    };

    fetchTaskData();
    fetchTaskCategories();
  }, [taskId]);

  // useEffect(() => {
  //   if (taskCategoriesData) {
  //     const categories = taskCategoriesData.ids.map(
  //       (id) => taskCategoriesData.entities[id]
  //     );
  //     setCategories(categories);
  //   }
  // }, [taskCategoriesData]);

  let requiredFields;

  if (isError) {
    return <Navigate to={"/dashboard"} />;
  }

  if (task) {
    requiredFields = [
      task.title,
      task.description,
      task.categoryId,
      task.skills,
      task.sections?.some((section) => section.isPublished),
    ];
  }
  // console.log(task);

  const totalFields = requiredFields?.length;
  const completedFields = requiredFields?.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields?.every(Boolean);

  if (isLoading) {
    return <Spinner />
  } else if (!task) {
    console.log("error error error");
    return <Navigate to={"/dashboard"} />;
  } else if (task?.client !== _id) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      {!task.isPublished && (
        <Banner label="This task is unpublished. It will not be visible to the Freelancers." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Task setup</h1>
            <span className="text-sm text-slate-700">
              Complete all required fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            taskId={taskId}
            isPublished={task.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LuLayoutDashboard} />
              <h2 className="text-xl">Customize your task</h2>
            </div>
            <TitleForm setTask={setTask} initialData={task} taskId={task._id} />
            <CategoryForm
              initialData={task}
              setTask={setTask}
              taskId={task._id}
              options={categories.map((category) => ({
                label: category.name,
                value: category._id,
              }))}
            />
            <DescriptionForm
              setTask={setTask}
              initialData={task}
              taskId={task._id}
            />
            <SkillForm initialData={task} taskId={task._id} />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Task sections</h2>
              </div>
              <SectionForm
                setTask={setTask}
                initialData={task}
                taskId={task._id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your task</h2>
              </div>
              <PriceForm initialData={task} taskId={task._id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTask;
