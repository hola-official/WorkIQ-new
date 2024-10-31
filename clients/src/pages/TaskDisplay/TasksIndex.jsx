import React, { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import TaskFilter from "./components/TaskFilter";
import { useAxiosInstance } from "../../../api/axios";
import SidebarWithHeader from "@/SidebarWithHeader";
import useAuth from "@/hooks/useAuth";
import { useRecoilValue } from "recoil";
import userAtom from "@/atoms/userAtom";
import Footer from "@/components/Footer";

const TasksIndex = () => {
  const [tasks, setTasks] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [hasSkills, setHasSkills] = useState(true); // Default to true, assuming the freelancer has skills
  const [userId, setUserId] = useState(null);
  const user = useRecoilValue(userAtom);
  const [message, setMessage] = useState("");
  const axiosInstance = useAxiosInstance();

  // Initialize filter state
  const [filter, setFilter] = useState({
    searchQuery: "", // Initialize search query to an empty string
    filter: "", // Initialize filter to an empty string
  });

  useEffect(() => {
    fetchTasks();
  }, [filterOptions, userId]);

  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams(filterOptions).toString();
      let url = "/projects/search";
      if (userId) {
        url += `/${userId}?${queryParams}`;
      } else {
        url += `?${queryParams}`;
      }
      const res = await axiosInstance.get(url);
      const data = await res.data;
      setTasks(data);
      setMessage(""); // Reset message on successful fetch
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setMessage("Error fetching tasks. Please try again later.");
    }
  };

  const handleFilter = (newFilterOptions) => {
    if (
      newFilterOptions.filter === "bestMatch" &&
      (!userId || !skillsExist())
    ) {
      setMessage("You don't have any skills listed in your profile.");
    } else {
      setMessage("");
      setFilter(newFilterOptions); // Update filter state
      setFilterOptions(newFilterOptions); // Update filter options state
    }
  };

  const skillsExist = () => {
    return user.skills && user.skills.length > 0;
  };

  return (
    <SidebarWithHeader>
      <>
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-semibold mb-8">Freelance Tasks</h1>
          <TaskFilter onFilter={handleFilter} />
          {message && <p className="text-red-500 mb-4">{message}</p>}
          <TaskList tasks={tasks} filter={filter} />{" "}
          {/* Pass filter object to TaskList */}
        </div>
        <Footer />
      </>
    </SidebarWithHeader>
  );
};

export default React.memo(TasksIndex);
