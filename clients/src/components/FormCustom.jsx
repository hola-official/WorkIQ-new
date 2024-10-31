"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
// import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import useShowToast from "@/hooks/useShowToast";
// import { toast } from "@/components/ui/use-toast";

const FormSchema = z.object({
	items: z.array(z.string()).refine((value) => value.some((item) => item), {
		message: "You have to select at least one item.",
	}),
});

export function CheckboxReactHookFormMultiple() {
	const { _id, status, paymentWallet } = useAuth();
	const {showToast} = useShowToast()
	// const status = "Tutor";
	// const paymentWallet = "";
	console.log(paymentWallet);
	const stripeOnboardingComp = true;

	const form = useForm({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			items: stripeOnboardingComp ? ["usd"] : [""],
		},
	});

	const items = [
		{ id: "usd", label: "USD Payment" },
		{
			id: "crypto",
			label: `USDC Payment ${paymentWallet ? `(${truncateWalletAddress(paymentWallet)})` : ""
				}`,
		},
	];

	const { isSubmitting, isValid } = form.formState;

	function onSubmit(data) {
		showToast.custom(
			<div className="p-2">
				<h1 className="text-lg">You submitted the following values:</h1>
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="items"
					render={() => (
						<FormItem>
							<div className="mb-4">
								<FormLabel className="text-base">Payment Option</FormLabel>
								<FormDescription>
									Select the mode of payment you want for this section.
								</FormDescription>
							</div>
							{items.map((item) => (
								<FormField
									key={item.id}
									control={form.control}
									name="items"
									render={({ field }) => (
										<FormItem
											key={item.id}
											className="flex flex-row items-start space-x-3 space-y-0"
										>
											<FormControl>
												<Checkbox
													checked={field?.value?.includes(item.id)}
													disabled={
														(item.id === "crypto" && !paymentWallet) ||
														(item.id === "usd" && !stripeOnboardingComp)
													}
													onCheckedChange={(checked) => {
														return checked
															? field.onChange([...field.value, item.id])
															: field.onChange(
																field.value?.filter(
																	(value) => value !== item.id
																)
															);
													}}
												/>
											</FormControl>
											<FormLabel className="font-normal">
												{item.label}
											</FormLabel>
										</FormItem>
									)}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button disabled={!isValid || isSubmitting} type="submit">
					Submit
				</Button>
			</form>
		</Form>
	);
}
