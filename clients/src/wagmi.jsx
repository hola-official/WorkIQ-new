import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	getDefaultConfig,
	RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import useAuth from "./hooks/useAuth";
import { useAxiosInstance } from "../api/axios";
import useShowToast from "./hooks/useShowToast";
import { AuthCheck } from "./components/authentications/AuthCheck";
import { AdditionalInfoDialog } from "./components/authentications/AdditionalInfoDialog";
import activationToken from "./atoms/activationTokenAtom";
import { useRecoilState, useSetRecoilState } from "recoil";
import userAtom from "./atoms/userAtom";
import tokenAtom from "./atoms/tokenAtom";


const crossFiTestnet = {
  id: 4157,
  name: "CrossFi Testnet",
  network: "XFI",
  iconUrl:
    "https://res.cloudinary.com/dlldg3xxz/image/upload/b_rgb:333B4C/c_crop,w_590,h_590,ar_1:1,e_improve,e_sharpen/v1742464608/Icon-version-_-Color-CROSSFI-CHAIN_omwgp3.png",
  iconBackground: "#35D07F",
  nativeCurrency: {
    decimals: 6,
    name: "CrossFi Testnet",
    symbol: "XFI",
  },
  rpcUrls: {
    public: { http: ["https://crossfi-testnet.g.alchemy.com/v2/HC6Ga3Il6VWwi6eIz-yTFMer7YZkw_vZ"] },
    default: { http: ["https://crossfi-testnet.g.alchemy.com/v2/HC6Ga3Il6VWwi6eIz-yTFMer7YZkw_vZ"] },
  },
  blockExplorers: {
    default: { name: "CrossFi Explorer", url: "https://test.xfiscan.com/" },
    etherscan: { name: "CrossFi Explorer", url: "https://test.xfiscan.com/" },
  },
  testnet: true,
};

const crossFi = {
  id: 4158,
  name: "CrossFi",
  network: "crossFi",
  iconUrl:
    "https://res.cloudinary.com/dlldg3xxz/image/upload/b_rgb:333B4C/c_crop,w_590,h_590,ar_1:1,e_improve,e_sharpen/v1742464608/Icon-version-_-Color-CROSSFI-CHAIN_omwgp3.png",
  iconBackground: "#35D07F",
  nativeCurrency: {
    decimals: 18,
    name: "CrossFi Mainet",
    symbol: "XFI",
  },
  rpcUrls: {
    public: { http: ["https://rpc.mainnet.ms"] },
    default: { http: ["https://rpc.mainnet.ms"] },
  },
  blockExplorers: {
    default: {
      name: "CrossFi Explorer",
      url: "https://xfiscan.com/",
    },
    etherscan: {
      name: "CrossFi Explorer",
      url: "https://xfiscan.com/",
    },
  },
  testnet: false,
};


const config = getDefaultConfig({
	appName: "WorkIQ",
	projectId: "044601f65212332475a09bc14ceb3c34",
	chains: [mainnet, crossFi, crossFiTestnet],
});

const queryClient = new QueryClient();
const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export const WagmiConfigProvider = ({ children }) => {
	const { _id: userId } = useAuth();
	const [walletAuthStatus, setWalletAuthStatus] = useState("unauthenticated");
	const [token, setToken] = useRecoilState(tokenAtom);
	const setUsers = useSetRecoilState(userAtom);
	const navigate = useNavigate();
	const location = useLocation();
	const axiosInstance = useAxiosInstance()
	const { showToast } = useShowToast()
	const [addInfoDialogOpen, setAddInfoDialogOpen] = useState(false)

	const handleVerify = async ({ message, signature }) => {
		try {
			// console.log('Verifying with:', { message, signature, userId });
			const response = await axiosInstance.post("nonce/verify", {
				message,
				signature,
				userId
			});
			console.log('Verification response:', response.data);
			const data = response.data;
			const loggedUser = data.loggedUser;
			const token = data.accessToken;

			if (response.data.requireAdditionalInfo) {
				setWalletAuthStatus("authenticated");
				// Handle additional info dialog here
				setAddInfoDialogOpen(true)
			} else {
				setWalletAuthStatus("authenticated");
				if (location.pathname.includes("auth")) {
					localStorage.setItem("user-workiq", JSON.stringify(loggedUser));
					localStorage.setItem("token", token);

					setToken(token);
					setUsers(loggedUser);
					navigate("/dashboard");
				}
				// await refresh()
			}
		} catch (error) {
			console.error('Verification error:', error);
			setWalletAuthStatus("unauthenticated");
			showToast(error?.response?.data?.error ?? "Failed to sign message", "error");
		}
	};

	const authenticationAdapter = createAuthenticationAdapter({
		getNonce: async () => {
			try {
				const response = await fetch(`${baseUrl}/nonce`);
				const { nonce } = await response.json();
				console.log('Nonce retrieved: ', nonce);
				return nonce;
			} catch (error) {
				console.error('Error retrieving nonce:', error);
				throw error;
			}
		},
		createMessage: ({ nonce, address, chainId }) => {
			try {
				return new SiweMessage({
					domain: window.location.host,
					address,
					statement:
						"Verify your account. To finish connecting to WorkIQ, you must sign this message to verify that you are the owner of this account.",
					uri: window.location.origin,
					version: "1",
					chainId,
					nonce,
				});
			} catch (error) {
				console.error('Error creating SIWE message:', error);
				throw error;
			}
		},
		getMessageBody: ({ message }) => {
			return message.prepareMessage();
		},
		verify: handleVerify,
		signOut: async () => {
			setWalletAuthStatus("unauthenticated");
		},
	});

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitAuthenticationProvider
					adapter={authenticationAdapter}
					status={walletAuthStatus}
				>
					<RainbowKitProvider
						appInfo={{
							appName: "WorkIQ",
						}}
					>
						<AuthCheck walletAuthStatus={walletAuthStatus} />
						<AdditionalInfoDialog addInfoDialogOpen={addInfoDialogOpen} setAddInfoDialogOpen={setAddInfoDialogOpen} />
						{children}
					</RainbowKitProvider>
				</RainbowKitAuthenticationProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};