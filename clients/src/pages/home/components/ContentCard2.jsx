import React from "react";

const ContentCard = () => {
	return (
		<div className="rounded-xl h-full w-full bg-white shadow-xl p-10">
			<div>
				<h2 className="text-4xl font-bold mb-12">
					<span className="text-red-600">Learn: </span>Unlock Knowledge, Master
					Skills
				</h2>
				<ul className="list-disc ml-12 text-3xl space-y-6 font-medium text-gray-400">
					<li>Discover a diverse range of courses from top tutors.</li>
					<li>
						Engage in interactive lessons designed to enhance your skills.
					</li>
					<li>
						Enjoy a seamless learning experience with our user-friendly
						platform.
					</li>
				</ul>
			</div>
		</div>
	);
};

export default ContentCard;
