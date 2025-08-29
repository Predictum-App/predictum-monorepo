"use client";

import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon } from "lucide-react";

import { useSetSearchParams } from "@/app/hooks";

export const MarketSearch = () => {
  const setSearchParams = useSetSearchParams();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    setSearchParams({ searchTerm: term });
  }, 300);

  return (
    <div className="flex-1">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          type="text"
          placeholder="Search markets..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("searchTerm")?.toString()}
          className="w-full pl-10 pr-4 py-3 bg-dark-800/60 glow-border rounded-lg text-dark-200 placeholder-dark-400 focus:outline-none focus:glow-border-focus transition-all"
        />
      </div>
    </div>
  );
};
