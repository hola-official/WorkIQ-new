import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

const useShowToast = () => {
  const toast = useToast();

  const showToast = useCallback(
    (title, description, status = "info", options = {}) => {
      toast({
        title,
        description,
        status,
        duration: status === "info" ? null : 2000,
        isClosable: true,
        position: "top",
        ...options,
      });
    },
    [toast]
  );

  const dismissToast = useCallback(
    (id) => {
      toast.close(id);
    },
    [toast]
  );

  const loadingToast = useCallback(
    (description, options = {}) => {
      return toast({
        title: "Loading",
        description,
        status: "info",
        duration: null,
        isClosable: true,
        position: "top",
        ...options,
      });
    },
    [toast]
  );

  const successToast = useCallback(
    (description, options = {}) => {
      return toast({
        title: "Success",
        description,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
        ...options,
      });
    },
    [toast]
  );

  const errorToast = useCallback(
    (description, options = {}) => {
      return toast({
        title: "Error",
        description,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
        ...options,
      });
    },
    [toast]
  );

  return {
    showToast,
    dismissToast,
    loadingToast,
    successToast,
    errorToast,
  };
};

export default useShowToast;
