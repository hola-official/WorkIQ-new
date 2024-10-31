import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
export const columns = [
	{
		accessorKey: "title",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const title = row.getValue("title");
			return <p className="ml-4">{title}</p>;
		},
	},
	{
		accessorKey: "price",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Amount
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const price = parseFloat(row.getValue("price") || "0");
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(price);
			return <div className="ml-4">{price ? formatted : "Free"}</div>;
		},
	},
	{
		accessorKey: "durationDays",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Duration
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const days = row.getValue("durationDays");
			return <p className="ml-4">{days} d</p>;
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			// const status = row.getValue("order.status");
			const status = row.original.order.status;
			// console.log(row.getValue("status"))
			// console.log(status)
			let statusColor = "text-[#E0BF00]";
			switch (status) {
				case "delivered":
					statusColor = "text-[#7d85f5]";
					break;
				case "completed":
					statusColor = "text-green-700";
					break;
				case "cancelled":
					statusColor = "text-red-700";
					break;
				case "Overdue":
					statusColor = "text-[#E40DC4]";
					break;
			}
			return <p className={`${statusColor} font-medium text-left`}>{status}</p>;
		},
	},
	{
		accessorKey: "date",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.original.order.updatedAt;
			// console.log(row.original)

			return <p className="ml-4">{format(new Date(date), "MMMM d, yyyy")}</p>;
		},
	},
];
