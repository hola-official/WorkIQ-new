import React, { useEffect, useState } from "react";
import {
	DollarSign,
	LayoutList,
	Users,
} from "lucide-react";
import FreelancerEarningsChart from "./components/FreelancerEarningChart";
import { useAxiosInstance } from "../../../../api/axios";
import { DataTable } from "./components/DataTable";
import { columns } from "./components/Columns";
import userAtom from "@/atoms/userAtom";
import { useRecoilValue } from "recoil";
import PieChart from "./components/PieChart";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Avatar } from "@chakra-ui/react";
import { formatPrice } from "@/lib/format";
import { motion } from 'framer-motion';
import { CheckboxReactHookFormMultiple } from "@/components/FormCustom";
import RegisterUserBtn from "@/components/web3/RegisterUserBtn";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import useAuth from "@/hooks/useAuth";

const BADGE_CRITERIA = {
	TOTAL_POINTS: {
		BRONZE: 600,
		SILVER: 1000,
		GOLD: 5000,
	},
};

const calculateBadgeProgress = (totalPoints) => {
	const bronzeThreshold = BADGE_CRITERIA.TOTAL_POINTS.BRONZE;
	const silverThreshold = BADGE_CRITERIA.TOTAL_POINTS.SILVER;
	const goldThreshold = BADGE_CRITERIA.TOTAL_POINTS.GOLD;

	let bronzeProgress, silverProgress, goldProgress;

	if (totalPoints >= goldThreshold) {
		bronzeProgress = 100;
		silverProgress = 100;
		goldProgress = 100;
	} else if (totalPoints >= silverThreshold) {
		bronzeProgress = 100;
		silverProgress = 100;
		goldProgress = ((totalPoints - silverThreshold) / (goldThreshold - silverThreshold)) * 100;
	} else if (totalPoints >= bronzeThreshold) {
		bronzeProgress = 100;
		silverProgress = ((totalPoints - bronzeThreshold) / (silverThreshold - bronzeThreshold)) * 100;
		goldProgress = 0;
	} else {
		bronzeProgress = (totalPoints / bronzeThreshold) * 100;
		silverProgress = 0;
		goldProgress = 0;
	}

	return [
		{ name: "Bronze", value: parseFloat(bronzeProgress.toFixed(2)) },
		{ name: "Silver", value: parseFloat(silverProgress.toFixed(2)) },
		{ name: "Gold", value: parseFloat(goldProgress.toFixed(2)) }
	];
};

const FreelancerDashboard = () => {
	const { _id: userId } = useAuth();
	const { getUserBalance } = useTaskManagement();
	const { data: userUSDCBalance, refetch } = getUserBalance(userId);
	const userInfo = useRecoilValue(userAtom);
	const axiosInstance = useAxiosInstance();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { status, address } = useAccount();
	const USDCBalance = Number(formatUnits(userUSDCBalance || 0, 6)) || 0;
	refetch()
	// console.log(address)


	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await axiosInstance.get("users/freelancer-stats");
				setStats(response.data);
				setLoading(false);
			} catch (err) {
				setError("Error fetching freelancer stats");
				setLoading(false);
				console.error(err);
			}
		};

		fetchStats();
		const intervalId = setInterval(fetchStats, 5000); // Poll every 5 seconds

		return () => clearInterval(intervalId); // Cleanup on unmount
	}, [axiosInstance]);

	if (loading) return <Spinner />;
	if (error) return <ErrorMessage message="Error fetching data stats" />;

	const pieChartData = [
		...calculateBadgeProgress(stats?.totalPoints || 0),
		// ...stats?.pieChartData?.earningRate.map(earning => ({
		// 	name: earning.name,
		// 	value: earning.value,
		// 	color: earning.color || '#000000',
		// })),
		{
			name: "Avg",
			value: stats?.avgCompletionTime?.value || 100,
			color: '#4CAF50',
		},
		// {
		// 	name: "Cancellation Impact",
		// 	value: 100 - (stats?.avgCompletionTime?.value || 100),
		// 	color: '#FF5722',
		// }
	];

	return (
		<div className="flex-1 space-y-6">
			{/* <CheckboxReactHookFormMultiple /> */}
			{/* <RegisterUserBtn className={'float-right mb-4'} label={"Just register"} /> */}
			<motion.div
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.5, type: "spring", stiffness: 70 }}
			>
				<HeaderSection
					userInfo={userInfo}
					stats={stats}
					balance={stats?.currentBalance}
					totalEarnings={stats?.totalEarnings}
					isVerified={userInfo?.isVerified}
				/>
			</motion.div>
			<motion.div
				initial={{ x: 100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<StatCards
					stats={stats}
					userInfo={userInfo}
					USDCBalance={USDCBalance}
				/>
			</motion.div>
			<motion.div
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<MainContent
					stats={stats}
					pieChartData={pieChartData}
					recentWithdrawals={stats?.pieChartData?.recentWithdrawals}
					recentDeposits={stats?.pieChartData?.totalDeposits}
					userInfo={userInfo}
				/>
			</motion.div>
		</div>
	);
};

const HeaderSection = React.memo(({ userInfo, balance, totalEarnings, isVerified }) => (
	<div
		style={{
			backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.05)), url(/freelancer-bg.webp)`,
			backgroundSize: "cover",
			backgroundPosition: "center",
		}}
		className="bg-slate-300 p-8 lg:p-14 rounded-3xl space-y-2 lg:space-y-5 flex justify-between items-center xl:flex-col-reverse xl:items-stretch"
	>
		<div className="xl:w-full xl:flex xl:justify-start">
			<div>
				<div className="flex gap-1">
					<Avatar size={['md', 'lg']} src={userInfo?.avatar} />
					<h1 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white">
						Welcome, {userInfo?.username}
					</h1>
				</div>
				<h1 className="text-xs md:text-lg text-white/60 xl:text-xl">
					See what happened with your tasks and earnings
				</h1>
			</div>
		</div>
		<div className="flex flex-col gap-2 xl:w-full xl:flex xl:justify-end xl:mb-4">
			<h1 className="text-base md:text-2xl xl:text-3xl font-semibold text-white text-right max-md:hidden">
				{isVerified === true ? "Total Earnings" : "Balance"}
			</h1>
			<h1 className="text-base md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-right">
				$ {isVerified === true ? `${totalEarnings?.toFixed(2)}` ?? 0 : balance?.toFixed(2)}
			</h1>
		</div>
	</div>
));

const StatCards = React.memo(({ stats, userInfo, USDCBalance }) => {
	const statCardItems = [
		{
			icon: <DollarSign />,
			title: userInfo?.isVerified === true ? "Balance" : "Freezed",
			value: userInfo?.isVerified === true ? `$${stats?.currentBalance?.toFixed(2) ?? 0}` : `${formatPrice(userInfo?.escrowBalance)}`
		},
		{
			icon: <DollarSign />,
			title: "USDC",
			value:`$${USDCBalance?.toFixed(2) || "0.00"}`
		},
		{
			icon: <LayoutList />,
			title: userInfo?.isVerified === true ? "Completed Tasks" : "Task Created",
			value: userInfo?.isVerified === true ? `${stats?.totalTasksCompleted ?? 0} Tasks` : `${userInfo?.tasksCreated.length} Created`
		},
		// {
		// 	icon: <LayoutList />,
		// 	title: "Success Rate",
		// 	value: `${stats?.successRate?.toFixed(2) ?? 0}%`
		// },
		userInfo?.isVerified === true && {
			icon: <Users />,
			title: "Total Points",
			value: `${stats?.totalPoints ?? 0} pts`
		},
		{
			icon: <DollarSign />,
			title: "Total Withdrawals",
			value: `${formatPrice(stats?.totalWithdrawals) ?? 0}`
		},
		{
			icon: <DollarSign />,
			title: "Total Deposits",
			value: `$${stats?.totalDeposits ?? 0}`
		}
	];

	return (
		<motion.div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-5">
			{statCardItems.map((item, index) => (
				item && (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
					>
						<StatCard icon={item.icon} title={item.title} value={item.value} />
					</motion.div>
				)
			))}
		</motion.div>
	);
});

const MainContent = React.memo(({ stats, pieChartData, recentWithdrawals, recentDeposits, userInfo }) => (
	<div className="flex flex-wrap w-full gap-6">
		{userInfo?.isVerified === false && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-lg w-full border-gray-300/55"><FreelancerEarningsChart stats={stats} /></motion.div>}
		{userInfo?.isVerified === true && <div className="grid grid-cols-1 lg:grid-cols-2 xl:col-span-2 items-center border w-full">
			<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-lg border-gray-300/55"><FreelancerEarningsChart stats={stats} /></motion.div>
			<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-lg border-gray-300/55 bg-white">{pieChartData.length > 0 && <PieChart data={pieChartData} />}</motion.div>
		</div>}
		<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="col-span-1 w-full">
			<div className="border rounded-lg border-gray-300/55 p-4">
				<DataTable
					data={stats?.allOrders ?? []}
					columns={columns}
				/>
			</div>
		</motion.div>
	</div>
));

const StatCard = React.memo(({ icon, title, value }) => (
	<div className="p-5 col-span-1 bg-gray-50 shadow-lg rounded-lg space-y-4">
		<div className="flex gap-2 items-center">
			<div className="p-2 shadow rounded-full">
				{icon}
			</div>
			<h3 className="text-lg md:text-2xl xl:text-3xl">{value}</h3>
		</div>
		<div>
			<p className="text-sm md:text-base lg:text-lg text-gray-400">{title}</p>
		</div>
	</div>
));

export default FreelancerDashboard;
