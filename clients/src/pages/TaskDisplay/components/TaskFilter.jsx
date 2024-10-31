import React, { useState } from "react";

const TaskFilter = ({ onFilter }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState(""); // Set initial state for filter

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilter(value); // Set the filter value directly without using e.target.value
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call onFilter only if the filter is set and "Filter" button is clicked
    if (filter && (filter === "newest" || filter === "bestMatch")) {
      onFilter({ searchQuery, filter });
    }
  };

  return (
    <div className="flex justify-between">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-4 w-full"
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
          className="border border-gray-200 rounded-md px-3 py-2 w-48"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Filter
        </button>
      </form>
      {/* <div className="flex flex-wrap">
        <button
          type="button"
          onClick={() => handleFilterChange("newest")}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md mr-2 ${
            filter === "newest" ? "bg-blue-600" : ""
          }`}
        >
          Newest
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange("bestMatch")}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
            filter === "bestMatch" ? "bg-blue-600" : ""
          }`}
        >
          Best Match
        </button>
      </div> */}
    </div>
  );
};

export default TaskFilter;
