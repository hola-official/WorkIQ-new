import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { MdDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import { Flex } from "@chakra-ui/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { useState } from "react";

export const columns = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title");

      return <p className="min-w-[350px] ml-4 ">{title}</p>;
    },
  },
  {
    accessorKey: "price",
    header: () => {
      return <Button variant="ghost">Price</Button>;
    },
    cell: ({ row }) => {
      const { totalPrice } = row.original;
      const price = parseFloat(row.getValue("price") || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return (
        <div className="ml-4">
          {row.getValue("price") ? formatted : formatPrice(totalPrice)}
        </div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <Badge
          className={cn(
            "bg-slate-400 text-white",
            isPublished && "bg-blue-700 text-white"
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div>Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const [delAttachId, setDelAttachId] = useState(null);
      const { _id, sections } = row.original;

      const axiosInstance = useAxiosInstance();
      const {showToast} = useShowToast();
      const navigate = useNavigate();
      const onDelete = async (attachment) => {
        try {
          // Assuming sectionId is nested within the sections array
          // const sectionId = sections[0]?._id; // Accessing the first section's _id

          // Delete task data from Firebase Firestore
          await axiosInstance.delete(`/tasks/${_id}`);

          // Get download URL for the task attachment
          // const storage = getStorage();
          // const attachmentRef = ref(
          //   storage,
          //   `Tasks/${_id}/Sections/${sectionId}/Attachments`
          // );
          // const attachmentUrl = await getDownloadURL(attachmentRef);

          // // Delete task attachment from Firebase Storage
          // if (attachmentUrl) {
          //   const attachmentObject = ref(storage, attachmentUrl);
          //   await deleteObject(attachmentObject);
          // }
          setDelAttachId(attachment._id);
          const storage = getStorage(app);
          const fileRef = ref(storage, attachment.url);
          await deleteObject(fileRef);

          console.log(attachment._id);

          // Display success message and reload the page
          navigate(`/clients/my-tasks`);
          showToast("Success", "Task deleted", "success");
          window.location.reload();
        } catch (error) {
          console.log(error);
          showToast("Error", "Something went wrong", "error");
        }
      };

      return (
        <div className="flex gap-2 items-center">
          <Link to={`/clients/edit-task/${_id}`}>
            <Pencil className="h-4 w-4 mr-2" />
          </Link>

          <ConfirmModal onConfirm={onDelete}>
            <MdDelete size={25} color="blue.300" cursor={"pointer"} />
          </ConfirmModal>
          <Link to={`/projects/applicants/${_id}/details`}>
            <IoEyeSharp className="h-4 w-4 mr-2" />
          </Link>
        </div>
      );
    },
  },
];
