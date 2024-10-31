import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";
import Spinner from "@/components/Spinner";

const StripeOnboardingComplete = () => {
	const [status, setStatus] = useState("loading");
	const navigate = useNavigate();
	const axiosInstance = useAxiosInstance();
	const {showToast} = useShowToast();

	useEffect(() => {
		let timeoutId;

		const completeOnboarding = async () => {
			try {
				const { data } = await axiosInstance.post("transactions/complete-stripe-onboarding");
				showToast("Success", "Stripe account setup completed successfully!", "success");
				setStatus("success");
				// Redirect to dashboard after a short delay
				timeoutId = setTimeout(() => navigate("/freelancer/withdraw"), 3000);
			} catch (error) {
				console.error("Failed to complete onboarding:", error);
				showToast("Error", error.response?.data?.message || "Failed to complete Stripe onboarding", "error");
				setStatus("error");
			}
		};

		completeOnboarding();

		// Cleanup function
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [navigate]);

	if (status === "loading") {
		return <Spinner />
	} else if (status === "success") {
		return (
			<div className="h-screen flex justify-center items-center">
				Your Stripe account has been successfully set up! Redirecting to dashboard...
			</div>
		);
	} else {
		return (
			<div className="h-screen flex flex-col justify-center items-center">
				<p className="text-red-500">There was an error setting up your Stripe account.</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Try Again
				</button>
			</div>
		);
	}
};

export default StripeOnboardingComplete;