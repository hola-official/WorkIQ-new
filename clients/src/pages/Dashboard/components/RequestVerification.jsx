"use client";
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
import { Button } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
// import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
// import axios from "axios";
// import Web3Context from "@/context/Web3Context";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "@/atoms/userAtom";
import { ScrollArea } from "../../../components/ui/scroll-area"
import usePreviewImg from "@/hooks/usePreviewImg";

const RequestVerification = () => {
  // const { selectedAccount } = useContext(Web3Context);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState("");
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userInfo = useRecoilValue(userAtom)
  const user = userInfo;
  const {showToast} = useShowToast()
  const axiosInstance = useAxiosInstance()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // const formData = new FormData();
      // formData.append("name", name);
      // formData.append("username", username);
      // formData.append("address", address);
      // // formData.append("role", role);
      // formData.append("email", email);
      // formData.append("message", message);
      // // formData.append("file", file);
      const formData = {
        name: name,
        username: username,
        address: address,
        email: email,
        message: message,
        file: file,
      };
      console.log(formData)

      const response = await axiosInstance.post("users/verify", formData);

      // const tx = await requestVerificationContract.requestVerification();
      showToast('Success', 'Your request has been submitted successfully', 'success')

      setShowModal(false);
      console.log(response)
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        showToast('Error', error.response.data.error, 'error')
        // toast.error();
      } else {
        showToast('Error', "An error occurred", 'error')
        // toast.error();
      }
    } finally {
      setIsLoading(false);
    }
  };

  let buttonText = "Request Verification";

  if (isLoading) {
    buttonText = (
      <>
        <Loader2 key="loader" className="mr-2 h-4 w-4 animate-spin" /> Please
        wait
      </>
    );
  }

  return (
    <>
      <p onClick={() => setShowModal(true)}>Become a freelancer</p>
      <div>
        <AlertDialog
          open={showModal}
          onOpenChange={() => setShowModal((prev) => !prev)}
        >
          <AlertDialogContent>
            <ScrollArea className="h-[35rem] w-full  py-2">
              <form onSubmit={handleSubmit}>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Fill in the details to become a freelancer
                  </AlertDialogTitle>
                  <div className="flex flex-col gap-8">
                    <div className="flex gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          type="text"
                          value={user?.name || name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="name"
                          type="text"
                          value={user?.username || username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Your username"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <Label htmlFor="message">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={user?.location || address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Country"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-4 ">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        type="text"
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your message"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <Label htmlFor="file">Selfie with ID</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                      />
                      <div className="text-sm ">
                        <p>Provide a self-portrait photo ("selfie") while holding government-approved photo identification. Make sure your selfie is not blurry and text is legible.</p>
                        <br />
                        <p>To prevent fraudulent verification requests from people impersonating others, we need to verify the identity of the person on whose behalf the request is made (you or the relevant person, organization, or entity). Please obscure parts of the document (e.g. national ID number or other national identifier) as long as the remaining information identifies the relevant individual. WorkIQ will use this information solely to help us assess and document the authenticity of your request and will delete the document within 15 days of verifying your application.</p>
                      </div>
                    </div>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button" disabled={isLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <Button colorScheme={'blue'} borderRadius={'md'} type="submit" disabled={isLoading}>{buttonText}</Button>
                </AlertDialogFooter>
              </form>
            </ScrollArea>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </>
  );
};

export default RequestVerification;
