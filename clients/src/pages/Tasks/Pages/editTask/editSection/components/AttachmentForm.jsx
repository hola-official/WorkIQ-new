import * as z from "zod";
// import axios from "axios";
import { PlusCircle, File, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import app from "../../../../../../firebase";
import { Button } from "@chakra-ui/react";
import { Progress } from "@material-tailwind/react";
import { useAxiosInstance } from "../../../../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
// import {
// 	useDeleteSectionAttachmentMutation,
// 	useUpdateSectionAttachmentMutation,
// } from "@/features/tasks/tasksApiSlice";
// import { FileUpload } from "@/components/ui/file-upload";
const formSchema = z.object({
  url: z.string().min(1),
});
export const AttachmentForm = ({ initialData, taskId, sectionId, setRefetchSection }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(""); // New state for file name
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTask, setUploadTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [delAttachId, setDelAttachId] = useState(null);
  const axiosInstance = useAxiosInstance();
  const { showToast } = useShowToast();
  // const [updateSectionAttachment] = useUpdateSectionAttachmentMutation(); // Ensure you have the appropriate mutation hook
  // const [deleteSectionAttachment] = useDeleteSectionAttachmentMutation(); // Ensure you have the appropriate mutation hook

  const toggleEdit = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  // console.log(uploadProgress);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name); // Update file name
  };

  const uploadFile = async () => {
    if (!file) return;

    const storage = getStorage(app);
    const folderPath = `Tasks/${taskId}/Sections/${sectionId}/Attachments`;
    const fileName = file.name;

    const storageRef = ref(storage, `${folderPath}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadTask(uploadTask);
    // setIsUploading(true);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("File available at:", downloadURL);
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setFile(null);
      setFileName(""); // Reset file name
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  // console.log(initialData)

  const onSubmit = async () => {
    try {
      setIsUploading(true);
      const fileUrl = await uploadFile();
      const attachment = {
        name: fileName,
        url: fileUrl,
      };
      console.log(attachment);

      // await updateSectionAttachment({
      //   taskId,
      //   sectionId,
      //   attachment,
      // }).unwrap();
      await axiosInstance.put(
        `tasks/edit-task/${taskId}/section/${sectionId}/attachment`,
        JSON.stringify({ attachment })
      );
      // const data = res.data
      // setUploadTask(data)
      showToast("Success", "File uploaded successfully", "success");
      toggleEdit();
      setRefetchSection(prev => prev + 1)
      // window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error?.code === "storage/canceled") {
        toggleEdit();
        return showToast("Error", "Upload Cancelled", "error");
      }
      showToast("Error", "Error uploading file", "error");
    } finally {
      setFile(null);
      setFileName(""); // Reset file name
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDelete = async (attachment) => {
    // console.log(attachment._id);
    try {
      setDelAttachId(attachment._id);
      const storage = getStorage(app);
      const fileRef = ref(storage, attachment.url);
      await deleteObject(fileRef);

      console.log(attachment._id)
      await axiosInstance.delete(
        `tasks/edit-task/${taskId}/section/${sectionId}/attachment/${attachment._id}`,
      );
      console.log(delAttachId);
      showToast("Success", "Attachment deleted", "success");
      // router.refresh();
    } catch (error) {
      console.log(error);
      showToast("Error", "Something went wrong", "error");
    } finally {
      setDelAttachId(null);
    }
  };
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Attachments
        <Button
          onClick={() => {
            setFile(null);
            toggleEdit();
          }}
          variant="ghost"
        >
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
        {/* <Progress color="red"/> */}
      </div>

      {!isEditing && (
        <>
          {initialData?.attachments?.length === 0 && (
            <p className="text-sm mt-2 text-slate-500 italic">
              No attachments yet
            </p>
          )}
          {initialData?.attachments?.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment._id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1">{attachment.name}</p>
                  {delAttachId === attachment._id && (
                    <div>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {delAttachId !== attachment._id && (
                    <button
                      onClick={() => onDelete(attachment)}
                      className="ml-auto hover:opacity-75 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div>
          <input
            disabled={isUploading}
            type="file"
            name="fileUpload"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full cursor-pointer"
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything that might need to complete this section.
          </div>

          {!isUploading && file && (
            <div className="flex justify-center mt-5 mb-5">
              <Button onClick={onSubmit} colorScheme={"blue"}>
                Upload File
              </Button>
            </div>
          )}
          {isUploading && (
            <div className="flex justify-center mt-5 mb-5">
              <Button
                colorScheme={"red"}
                onClick={cancelUpload}
                // variant="destructive"
                className="mx-auto"
              >
                Cancel
              </Button>
            </div>
          )}
          {isUploading && (
            <div className="flex justify-center mb-5">
              <Progress
                value={uploadProgress}
                color="blue"
                // hasStripe={"true"}
                label=" "
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
