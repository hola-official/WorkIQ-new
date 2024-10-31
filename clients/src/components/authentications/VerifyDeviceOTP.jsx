import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { PinInput, PinInputField, HStack } from "@chakra-ui/react";
import { useAxiosInstance } from "../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import actToken from "@/atoms/activationTokenAtom";
import { useRecoilValue } from "recoil";
import { Spinner } from "@chakra-ui/react";

const VerifyDeviceOTP = ({ email, handleLogin }) => {
	const [otp, setOtp] = useState("");
	const [seconds, setSeconds] = useState(60); // Initial countdown duration in seconds
	const [isLoading, setIsLoading] = useState(false);
	const axiosInstance = useAxiosInstance();
	const {showToast} = useShowToast();
	const activationToken = useRecoilValue(actToken);
	const [isResending, setIsResending] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/dashboard";

	useEffect(() => {
		let countdown = setInterval(() => {
			setSeconds((prevSeconds) => {
				if (prevSeconds === 0) {
					clearInterval(countdown); // Stop the countdown when it reaches 0
				}
				return prevSeconds === 0 ? 0 : prevSeconds - 1;
			});
		}, 1000);

		return () => clearInterval(countdown); // Cleanup function to clear interval
	}, [seconds]); // Run effect only once when the component mounts

	const resendOTP = async (e) => {
		setIsResending(true);
		await handleLogin(e);
		showToast("Success", "OTP resent successfully", "success");
		setSeconds(60); // Reset countdown duration to 60 seconds
		setIsResending(false);
	};

	const verifyOTP = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await axiosInstance.post(
				"/auth/verify-device",
				JSON.stringify({
					activation_code: otp,
					activation_token: activationToken,
				})
			);
			console.log(response);
			if (!response) {
				console.log(response.error);
			}
			const loggedUser = response.data.loggedUser;
			console.log(loggedUser);
			showToast("success", "New device registered successfully", "success");
			// localStorage.setItem("isLogin", "true");
			navigate(from, { replace: true });
		} catch (err) {
			console.log(err);
			if (err.response.data.error === "Invalid activation code") {
				showToast("Error", err.response.data.error, "error");
			}
			if (!err.status) {
				console.log("No Server Response");
			} else if (err.response.data.error === "jwt expired" || err.response.status === 500) {
				// console.log(err.response.status)
				showToast("Error", "OTP expired", "error");
			} else {
				showToast(
					"Error",
					"Failed to verify OTP, please try again later",
					"error"
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!email) {
		return window.location.reload();
	}

	return (
		<div className="flex flex-col items-center sm:justify-center w-full">
			<div className="w-full px-6 py-6 bg-white dark:bg-gray-900 shadow-md rounded-md sm:rounded-lg max-w-sm">
				<div className="text-center text-2xl font-bold mb-3">
					<h1 className=" text-slate-600">
						You are signing in from a new device/IP
					</h1>
				</div>
				<h4 className="text-center mb-6">
					Enter the OTP sent to <strong>{email}</strong> to authorize this
					device
				</h4>
				<form
					onSubmit={verifyOTP}
					className="flex justify-center w-full flex-col"
				>
					<HStack justifyContent="center">
						<PinInput
							otp
							size={{ base: "sm", md: "lg" }}
							value={otp}
							onChange={(value) => setOtp(value)}
						>
							{[...Array(6)].map((_, index) => (
								<PinInputField key={index} />
							))}
						</PinInput>
					</HStack>
					<div className="flex mt-2 justify-between">
						<p>Didn't receive OTP? </p>
						{seconds > 0 ? (
							<div className="text-slate-600">
								Resend OTP in:{" "}
								{Math.floor(seconds / 60)
									.toString()
									.padStart(2, "0")}
								:{(seconds % 60).toString().padStart(2, "0")}
							</div>
						) : (
							<button
								className="text-blue-700 font-medium cursor-pointer hover:underline hover:text-blue-500"
								onClick={(e) => resendOTP(e)}
								disabled={isResending}
							>
								Resend OTP
							</button>
						)}
					</div>
					<Button
						type="submit"
						className="mt-6 rounded"
						color="blue"
						disabled={isLoading}
					>
						{isLoading ? "Verifying ..." : "Verify"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default VerifyDeviceOTP;
