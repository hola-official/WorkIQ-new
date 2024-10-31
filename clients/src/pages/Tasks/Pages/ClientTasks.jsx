import React, { useEffect, useState } from "react";
import SidebarWithHeader from "../../../SidebarWithHeader";
import { DataTable } from "../components/DataTable";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { columns } from "../components/Columns";

const ClientTasks = () => {

  const axiosInstance = useAxiosInstance();
  const [tasks, setTasks] = useState();
  const [loading, setLoading] = useState(true);
  const {showToast} = useShowToast();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axiosInstance.get(`tasks/all-tasks`);
        const data = res.data;

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);

        setTasks(data);
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [showToast]);

  return (
    <SidebarWithHeader>
      <div className="p-6">
        <DataTable columns={columns} loading={loading} data={tasks} />
      </div>
    </SidebarWithHeader>
  );
};

export default ClientTasks;
