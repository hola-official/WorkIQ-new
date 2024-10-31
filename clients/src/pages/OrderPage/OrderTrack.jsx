import React, { useEffect, useState } from "react";
import SidebarWithHeader from "@/SidebarWithHeader";
import { columns } from "../OrderPage/components/Columns";
import { DataTable } from "../OrderPage/components/DataTable";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../api/axios";

const OrderTrack = () => {
  const axiosInstance = useAxiosInstance();
  const [tasks, setTasks] = useState();
  const [loading, setLoading] = useState(true);
  const {showToast} = useShowToast();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await axiosInstance.get(`order/get-all-orders`);
        const data = res.data;

        console.log(data.ordersWithSections)

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        const allTasks = data.ordersWithSections.map((ordersWithSection) => {
          return {
            id: ordersWithSection.order._id,
            title: ordersWithSection.section.title,
            status: ordersWithSection.order.status,
            price: ordersWithSection.order.sectionPrice,
            createdAt: ordersWithSection.order.createdAt,
          };
        });
        console.log(allTasks);

        setTasks(allTasks);
      } catch (error) {
        console.log(error);
        showToast("Error", error.response.data.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [showToast]);

  // if (loading) return ;

  return (
    <SidebarWithHeader>
      <div>
        <h1 className="text-2xl md:text-4xl font-medium">My Orders</h1>
      </div>
      <div className="p-6">
        <DataTable columns={columns} loading={loading} data={tasks} />
      </div>
    </SidebarWithHeader>
  );
};

export default OrderTrack;
