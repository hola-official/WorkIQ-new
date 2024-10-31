import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "query-string";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";

const SearchInput = () => {
	const [value, setValue] = useState("");
	const debouncedValue = useDebounce(value);
	const location = useLocation();
	const searchParams = qs.parse(location.search);
	const currentCategoryId = searchParams.categoryId;
	  const navigate = useNavigate();

	useEffect(() => {
		const url = qs.stringifyUrl(
			{
				url: location.pathname,
				query: {
					categoryId: currentCategoryId,
					title: debouncedValue,
				},
			},
			{ skipEmptyString: true, skipNull: true }
		);
		navigate(url);
	}, [debouncedValue]);

	const handleInputChange = (e) => {
		setValue(e.target.value);
	};

	return (
		<div className="relative">
			<Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
			<Input
				onChange={handleInputChange}
				value={value}
				className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
				placeholder="Search for a task"
			/>
		</div>
	);
};

export default SearchInput;
