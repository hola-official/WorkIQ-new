import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, Heading } from "@chakra-ui/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "@/atoms/userAtom";
import useAuth from "@/hooks/useAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const AddPortfolio = ({ userId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [projectUrlError, setProjectUrlError] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [testimonial, setTestimonial] = useState(""); // New state for testimonial
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { _id } = useAuth()
  const {showToast} = useShowToast();
  const axiosInstance = useAxiosInstance();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 5MB limit");
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const validateProjectUrl = (url) => {
    const urlRegex = /^(https?:\/\/|www\.)/i;
    if (url && !urlRegex.test(url)) {
      setProjectUrlError("Project URL must start with http://, https://, or www.");
      return false;
    }
    setProjectUrlError("");
    return true;
  };

  const handleProjectUrlChange = (e) => {
    const url = e.target.value;
    setProjectUrl(url);
    validateProjectUrl(url);
  };
  const handleGithubUrlChange = (e) => {
    const url = e.target.value;
    setGithubUrl(url);
    validateProjectUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) {
      showToast('Error', fileError, 'error');
      return;
    } else if (!validateProjectUrl(projectUrl)) {
      return;
    }
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("projectUrl", projectUrl);
      formData.append("githubUrl", githubUrl);
      formData.append("tags", tags);
      formData.append("file", file);
      formData.append("testimonial", testimonial); // Add testimonial to formData

      const response = await axiosInstance.post(`users/${userId}/portfolios`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast('Success', 'Portfolio item added successfully', 'success');
      setShowModal(false);
      console.log(response)
      // You might want to update the user's portfolio list here
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        showToast('Error', error.response.data.error, 'error');
      } else {
        showToast('Error', "An error occurred", 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  let buttonText = "Add Portfolio Item";

  if (isLoading) {
    buttonText = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between align-center w-full">
        <Heading as="h2" size={['md',"lg", "xl"]} >
          {userId === _id ? "My Portfolio" : "Portfolio"}
        </Heading>
        {userId === _id && (<Button colorScheme={'blue'} float={'right'} size={['sm',"md", "lg"]} mb={1} onClick={() => setShowModal(true)}>Add Portfolio Item</Button>)}
      </div>
      <AlertDialog
        open={showModal}
        onOpenChange={() => setShowModal((prev) => !prev)}
      >
        <AlertDialogContent>
          <ScrollArea className="h-[35rem] w-full py-2">
            <form onSubmit={handleSubmit}>
              <AlertDialogHeader>
                <AlertDialogTitle>Add Portfolio Item</AlertDialogTitle>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Project title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Project description"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectUrl">Project URL</Label>
                    <Input
                      id="projectUrl"
                      type="url"
                      value={projectUrl}
                      onChange={handleProjectUrlChange}
                      placeholder="https://your-project.com"
                    />
                    {projectUrlError && <p className="text-red-500 text-sm mt-1">{projectUrlError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="projectUrl">Github URL</Label>
                    <Input
                      id="projectUrl"
                      type="url"
                      value={githubUrl}
                      onChange={handleGithubUrlChange}
                      placeholder="https://github.com/user/repo"
                    />
                    {projectUrlError && <p className="text-red-500 text-sm mt-1">{projectUrlError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="React, Node.js, MongoDB (comma-separated)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="file">Project Image</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                    {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="testimonial">Experience</Label>
                    <Textarea
                      id="testimonial"
                      value={testimonial}
                      onChange={(e) => setTestimonial(e.target.value)}
                      placeholder="Add a testimonial for your project (optional)"
                    />
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter className={'mt-2'}>
                <AlertDialogCancel type="button" disabled={isLoading}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  colorScheme={'blue'}
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={isLoading || !!fileError}
                >{buttonText}</Button>
              </AlertDialogFooter>
            </form>
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddPortfolio;