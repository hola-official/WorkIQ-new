// import { useRecoilValue } from 'recoil';
// import { jwtDecode } from 'jwt-decode';
// import tokenAtom from '../atoms/tokenAtom'; // Assuming you define atoms in a separate file

// const useAuth = () => {
//   const token = useRecoilValue(tokenAtom);
//   let isClient = false;
//   let isAdmin = false;
//   let status = 'Freelancer';

//   if (token) {
//     const decoded = jwtDecode(token);
//     const { _id, username, roles } = decoded.UserInfo;
//     console.log(_id)

//     isClient = roles.includes('Client');
//     isAdmin = roles.includes('Admin');

//     if (isClient) status = 'Client';
//     if (isAdmin) status = 'Admin';

//     return { _id, username, roles, status, isClient, isAdmin };
//   }

//   return { _id: '', username: '', roles: [], isClient, isAdmin, status };
// };

// export default useAuth;

import { useRecoilValue } from "recoil";
import { jwtDecode } from "jwt-decode";
import tokenAtom from "../atoms/tokenAtom"; // Assuming you define atoms in a separate file

const useAuth = () => {
  const token = useRecoilValue(tokenAtom);
  let isClient = false;
  let isAdmin = false;
  let status = "Freelancer";

  if (token) {
    const decoded = jwtDecode(token);
    const {
      _id,
      username,
      roles,
      fullName,
      image,
      streamToken,
      stripeOnboardingComplete,
      connectedWallets,
      paymentWallet,
    } = decoded.UserInfo;

    // console.log(decoded.UserInfo);
    isClient = roles.includes("Client");
    isAdmin = roles.includes("Admin");

    if (isClient) status = "Client";
    if (isAdmin) status = "Admin";

    return {
      _id,
      username,
      roles,
      status,
      isClient,
      isAdmin,
      fullName,
      image,
      streamToken,
      stripeOnboardingComplete,
      connectedWallets,
      paymentWallet,
    };
  }

  return {
    _id: "",
    username: "",
    roles: [],
    isClient,
    isAdmin,
    status,
    fullName: "",
    image: "",
    streamToken: "",
    connectedWallets: [],
    paymentWallet: "",
    stripeOnboardingComplete: "",
  };
};
export default useAuth;
