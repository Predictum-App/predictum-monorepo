"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { useSetSearchParams } from "@/app/hooks";
import { getFavorites } from "@/lib/favorites";

export const MarketFilterCategories = () => {
  const setSearchParams = useSetSearchParams();
  const searchParams = useSearchParams();

  // Mock categories for demonstration
  const filters = useMemo(() => {
    return [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
      { value: "resolved", label: "Resolved" },
      { value: "favorites", label: "Favorites" },
    ];
  }, []);

  const handleCategoryFilter = useDebouncedCallback((value: string) => {
    const params: { [key: string]: string } = { filter: value };

    if (value == "favorites") {
      const storedFavorites = getFavorites();
      params.addresses = storedFavorites.join(",");
    } else if (searchParams.get("addresses")) {
      params.addresses = "";
    }
    setSearchParams(params);
  }, 300);

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {filters.map((category) => (
        <button
          key={category.value}
          onClick={() => handleCategoryFilter(category.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            (searchParams.get("filter") || "open") === category.value
              ? "bg-sei-400 text-dark-950"
              : "bg-dark-800/60 text-dark-300 hover:bg-dark-700/60 glow-border"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
