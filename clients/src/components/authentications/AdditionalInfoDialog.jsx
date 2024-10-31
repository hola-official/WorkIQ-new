import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@chakra-ui/react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDisconnect } from "wagmi";
import { useAxiosInstance } from "../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import activationTokenAtom from "@/atoms/activationTokenAtom";
import userAtom from "@/atoms/userAtom";
import { ScrollArea } from "../ui/scroll-area";
import { Select } from "@chakra-ui/react";

export const AdditionalInfoDialog = ({ ethAddress, addInfoDialogOpen, setAddInfoDialogOpen }) => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [fullname, setFullname] = useState("");
	const [location, setLocation] = useState("");
	const [countries, setCountries] = useState([]);
	const { disconnectAsync } = useDisconnect();
	const navigate = useNavigate();
	const axiosInstance = useAxiosInstance();
	const {showToast} = useShowToast();
	const setActivationToken = useSetRecoilState(activationTokenAtom);
	const setUser = useSetRecoilState(userAtom);
	const [loading, setLoading] = useState(false);
	// const setAuthScreen = useSetRecoilState(authScreenAtom);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await fetch('https://restcountries.com/v3.1/all');
				const data = await response.json();
				const sortedCountries = data
					.map(country => country.name.common)
					.sort((a, b) => a.localeCompare(b));
				setCountries(sortedCountries);
			} catch (error) {
				console.error("Error fetching countries:", error);
				showToast("Error", "Failed to load countries list", "error");
			}
		};

		fetchCountries();
	}, []);

	const handleCancel = async () => {
		// onClose();
		setAddInfoDialogOpen(false)
		await disconnectAsync();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const data = {
			name: fullname,
			email: email,
			username: username,
			location: location,
			ethAddress,
		};
		try {
			const response = await axiosInstance.post("auth/additional-info", JSON.stringify(data));
			const responseData = response.data;

			if (responseData.message) {
				showToast("Success", responseData.message, "success");
			}
			setUser(responseData.user);
			setActivationToken(responseData.activationToken);

			// onClose();
			setAddInfoDialogOpen(false)
			navigate("/activate-verify");
		} catch (error) {
			console.log(error);
			if (!error.response) {
				console.log("No Server Response");
			} else if (error.response.status === 400) {
				showToast("Error", error.response.data.error, "error");
			} else if (error.response.status === 401) {
				console.log("Unauthorized");
			} else {
				console.log(error.response.data?.message);
			}
			await disconnectAsync();
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog open={addInfoDialogOpen}>
			<AlertDialogContent className="z-[99214748364699]">
				<ScrollArea className="w-full  py-2">
					<AlertDialogHeader>
						<AlertDialogTitle>
							No account connected to this wallet address. Additional Information
							Required
						</AlertDialogTitle>
						<AlertDialogDescription>
							Please provide the following details to create account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label>Fullname</Label>
							<Input
								placeholder="Fullname"
								value={fullname}
								required
								onChange={(e) => setFullname(e.target.value)}
							/>
						</div>
						<div>
							<Label>Email</Label>
							<Input
								placeholder="Email"
								value={email}
								type="email"
								required
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<Label>Username</Label>
							<Input
								placeholder="Username"
								value={username}
								required
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div>
							<Label>Location</Label>
							<Select
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								required
							>
								<option value="">Select a country</option>
								{countries.map((country) => (
									<option key={country} value={country}>
										{country}
									</option>
								))}
							</Select>
						</div>
						<div className="flex justify-between gap-5">
							<Button type="submit" className="mx-auto w-full" colorScheme={'blue'} borderRadius={'md'} disabled={loading}>
								{loading ? "Submitting..." : "Submit"}
							</Button>
							<Button
								type="button"

								onClick={handleCancel}
								variant="outline"
								className="mx-auto w-full"
								disabled={loading}
							>
								Cancel
							</Button>
						</div>
					</form>
				</ScrollArea>
			</AlertDialogContent>
		</AlertDialog>
	);
};