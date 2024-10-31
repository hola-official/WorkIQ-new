import { useRecoilValue } from "recoil";
import LoginCard from "../../components/authentications/LoginCard";
import SignUpCard from "../../components/authentications/SignUpCard";
import { Box } from "@chakra-ui/react";
import authScreenAtom from "../../atoms/authAtom";
import { useEffect } from "react";
import useLogout from "../../hooks/useLogout";
import { useAccount } from "wagmi";
import { AdditionalInfoDialog } from "@/components/authentications/AdditionalInfoDialog";

const AuthPage = () => {
	const authScreenState = useRecoilValue(authScreenAtom);
	const logout = useLogout();
	const addInfoDialogOpen = useRecoilValue(authScreenAtom);
	const { address } = useAccount()

	useEffect(() => {
		logout();
	}, []);

	return (
		<Box as="section" bg={"#fff"}>
			{authScreenState === "login" ? <LoginCard /> : <SignUpCard />}
			{addInfoDialogOpen && <AdditionalInfoDialog ethAddress={address} />}
		</Box>
	);
};

export default AuthPage;
