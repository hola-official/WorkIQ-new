import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
// import { Tooltip } from "@material-tailwind/react";
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-tailwind/react";
import Spinner from "@/components/Spinner";

const TaskList = ({ tasks, filter }) => {
  // Apply filters to tasks based on filter criteria
  const filteredTasks = tasks.filter((task) => {
    // Filter by title
    if (
      filter.searchQuery &&
      !task.title.toLowerCase().includes(filter.searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Add more filtering criteria as needed

    return true;
  });

  if(!filteredTasks.length){
    return <Spinner/>
  }

  return (
    <>
      <div>
        {filteredTasks.length ? (
          filteredTasks.map((task) => (
            <div key={task._id} className="border-b border-gray-200 py-4 ">
              <Link to={`/projects/${task._id}/overview`}>
                <h3 className="text-xl md:text-2xl font-semibold text-[#676767] hover:text-blue-500 cursor-pointer active:text-blue-400 duration-75 mb-2">
                  {task.title}
                </h3>
              </Link>
              <div className="text-xs md:text-base  text-gray-400">
                Est. Budget: <span>{formatPrice(task.totalPrice)}</span>
              </div>
              <p className="text-base md:text-xl text-gray-600 mb-2 two-line-truncate">
                {task.description}
              </p>
              <div className="flex gap-3 flex-wrap">
                {task.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    className="text-[10px] font-medium leading-[13px] bg-light-800 dark:bg-dark-300 text-light-400 dark:text-light-500 flex items-center justify-center gap-1 rounded-lg border-none px-4 py-2 capitalize"
                  >
                    <Tooltip
                      content={skill}
                      placement="right"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                      className="hidden md:block"
                    >
                      {skill}
                    </Tooltip>
                  </Badge>
                ))}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                Sections:{" "}
                <span className="text-gray-500">
                  {task.sections.length} Listed
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">No tasks found.</div>
        )}
      </div>
    </>
  );
};

export default TaskList;
