"use client";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useAxiosInstance } from "../../../../../../api/axios";
import { useEffect, useState } from "react";

export const PriceForm = ({ initialData, taskId }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const axiosInstance = useAxiosInstance();

  console.log(initialData.sections)

  useEffect(() => {
    // if (initialData.isPublished) {
      // Calculate and update totalPrice whenever initialData changes and the task is published
      const calculateTotalPrice = () => {
        const arrayOfObjects = initialData.sections;
        let totalPrice = 0;

        arrayOfObjects.forEach((obj) => {
          if (obj.isPublished) {
            // Only consider published sections
            totalPrice += obj.price;
          }
          console.log(obj)
        });


        setTotalPrice(totalPrice);

        // Update totalPrice in the backend
        updateTotalPriceInBackend(totalPrice);
      };

      calculateTotalPrice();
    // }
  }, [initialData]); // Run this effect whenever initialData changes

  const updateTotalPriceInBackend = async (totalPrice) => {
    try {
      await axiosInstance.put(`/tasks/edit-task/${taskId}`, {
        totalPrice: totalPrice,
      });
    } catch (error) {
      console.error("Error updating total price:", error);
    }
  };
  console.log(totalPrice)

  return (
    <div className="mt-6 border border-solid shadow-md border-1 border-blue-300 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Task Total Price
      </div>
      {/* {!isEditing && ( */}
      <p className={cn("text-sm mt-2", !totalPrice && "text-slate-500 italic")}>
        {totalPrice ? formatPrice(totalPrice) : "0"}
      </p>
      <div className="text-xs text-muted-foreground mt-3">
        Total price of Listed sections.
      </div>
    </div>
  );
};
