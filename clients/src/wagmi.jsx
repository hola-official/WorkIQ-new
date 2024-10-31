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


const celoAlfajores = {
	id: 44787,
	name: 'Celo Alfajores',
	network: 'alfajores',
	iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU2dk8Lfcj3vosaen0cFXHBCLPMULaNahY_w&s',
	iconBackground: '#35D07F',
	nativeCurrency: {
		decimals: 18,
		name: 'Celo Alfajores',
		symbol: 'alfajores',
	},
	rpcUrls: {
		public: { http: ['https://alfajores-forno.celo-testnet.org'] },
		default: { http: ['https://alfajores-forno.celo-testnet.org'] },
	},
	blockExplorers: {
		default: { name: 'Celo Explorer', url: 'https://explorer.celo.org/alfajores' },
		etherscan: { name: 'Celo Explorer', url: 'https://explorer.celo.org/alfajores' },
	},
	testnet: true,
}

const celo = {
	id: 42220,
	name: 'Celo',
	network: 'celo',
	iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU2dk8Lfcj3vosaen0cFXHBCLPMULaNahY_w&s",
	iconBackground: '#35D07F',
	nativeCurrency: {
		decimals: 18,
		name: 'Celo',
		symbol: 'CELO',
	},
	rpcUrls: {
		public: { http: ['https://forno.celo.org'] },
		default: { http: ['https://forno.celo.org'] },
	},
	blockExplorers: {
		default: { name: 'Celo Explorer', url: 'https://explorer.celo.org/mainnet' },
		etherscan: { name: 'Celo Explorer', url: 'https://explorer.celo.org/mainnet' },
	},
	testnet: false,
}


const config = getDefaultConfig({
	appName: "WorkIQ",
	projectId: "044601f65212332475a09bc14ceb3c34",
	chains: [mainnet, celo, celoAlfajores],
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
				console.log('Nonce retrieved:', nonce);
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