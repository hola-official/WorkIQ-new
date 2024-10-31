import React, { useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { formatPrice } from "@/lib/format";
import { useAxiosInstance } from "../../../../api/axios";
import useAuth from "@/hooks/useAuth";

const Dashboard = () => {
  const { _id } = useAuth();
  const [user, setUser] = useState();
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    handleUserInfo();
  }, []);

  const handleUserInfo = async () => {
    try {
      const res = await axiosInstance.get(`/users/${_id}`);
      const data = await res.data;
      setUser(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  if (user) {
    return (
      <div className="flex flex-col px-4 py-4 gap-4">
        <div>
          <h2 className="text-2xl text-gray-600">Hello {user?.username} 👋</h2>
          <p className="text-sm text-gray-600 font-semibold">
            Let&apos;s learn something new today!
          </p>
        </div>
        <div className="flex justify-between items-center ">
          <div className="flex justify-center py-8 items-center gap-2 w-[250px] rounded-md shadow-lg px-4">
            <div className="flex flex-col gap-1">
              <p className="text-xl"> {formatPrice(user?.balance)}</p>
              <p className="text-sm text-gray-600 font-semibold">Balance</p>
            </div>
            <IoMdCheckmarkCircleOutline className="w-12 h-12 text-blue-500" />
          </div>

          <div className="flex justify-center py-8 items-center w-[250px] rounded-md shadow-lg px-4">
            <div className="flex flex-col gap-1">
              <p className="text-xl">{formatPrice(user?.escrowBalance)}</p>
              <p className="text-sm text-gray-600 font-semibold">Freezed</p>
            </div>
            <IoMdCheckmarkCircleOutline className="w-12 h-12 text-blue-500" />
          </div>

          <div className="flex justify-center py-8 items-center w-[250px] rounded-md shadow-lg px-4">
            <div className="flex flex-col gap-1">
              <p className="text-xl">10</p>
              <p className="text-sm text-gray-600 font-semibold">Balance</p>
            </div>
            <IoMdCheckmarkCircleOutline className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
