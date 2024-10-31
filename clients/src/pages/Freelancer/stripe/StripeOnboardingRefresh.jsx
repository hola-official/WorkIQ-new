import React, { useEffect, useState } from "react";
import { useAxiosInstance } from "../../../../api/axios";
import useShowToast from "@/hooks/useShowToast";

const StripeOnboardingRefresh = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const axiosInstance = useAxiosInstance();
	const showToast = useShowToast();

	useEffect(() => {
		const refreshOnboarding = async () => {
			try {
				const { data } = await axiosInstance.post("transactions/create-stripe-connect");
				if (data.url) {
					window.location.href = data.url;
				} else {
					throw new Error("No URL returned from the server");
				}
			} catch (error) {
				console.error("Failed to refresh onboarding link:", error);
				setError(error.response?.data?.message || "Failed to refresh onboarding link");
				showToast("Error", "Failed to refresh onboarding link", "error");
				setIsLoading(false);
			}
		};

		refreshOnboarding();
	}, []);

	if (error) {
		return (
			<div className="h-screen flex flex-col justify-center items-center">
				<p className="text-red-500">Error: {error}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="h-screen flex justify-center items-center">
			{isLoading ? "Refreshing your onboarding link..." : "Redirecting..."}
		</div>
	);
};

export default StripeOnboardingRefresh;