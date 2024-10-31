import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useAxiosInstance } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";

const useLogout = () => {
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  const { disconnectAsync } = useDisconnect();

  const logout = async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");

      const data = response.data;

      // console.log(data);
      await disconnectAsync();
      const clearLocalStorageExceptKey = (keyToKeep) => {
        Object.keys(localStorage).forEach((key) => {
          if (key !== keyToKeep) {
            localStorage.removeItem(key);
          }
        });
      };
      // Usage
      clearLocalStorageExceptKey("localPrevPath");

      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };
  return logout;
};

export default useLogout;
