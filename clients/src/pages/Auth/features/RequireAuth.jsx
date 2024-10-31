import React, { useState } from "react";
import { useLocation, Navigate, Outlet, json } from "react-router-dom";
import useAuth from "../../../hooks/useAuth"; // Assuming this is your Recoil-based hook
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
    const axiosInstance = useAxiosInstance();
    const showToast = useShowToast()
  const { roles, username, _id } = useAuth(); // Assuming these are available from your Recoil-based hook
  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(
        "auth/username",
        JSON.stringify({ newUsername })
        );
        showToast('Success', "Username created successfully", 'success')
      toast.success();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to create username");
    } finally {
      setIsLoading(false);
    }
  };

  let buttonText = isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
    </>
  ) : (
    "Continue"
  );

  const content =
    !username && _id ? (
      <AlertDialog open={showModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a username</AlertDialogTitle>
            <AlertDialogDescription>
              Please create a unique username to gain access to this platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <Button onClick={handleSubmit}>{buttonText}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : roles.some((role) => allowedRoles.includes(role)) ? (
      <Outlet />
    ) : (
      <Navigate to="/dashboard" state={{ from: location }} replace />
    );

  return content;
};

export default React.memo(RequireAuth);
