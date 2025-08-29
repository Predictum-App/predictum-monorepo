"use client";

import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { useSetSearchParams } from "@/app/hooks";
import { FC, useState } from "react";
import { Market_OrderBy, OrderDirection } from "@/__generated__/graphql";

// Custom Dropdown Component
interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-900/90 backdrop-blur-sm glow-border rounded-xl text-white focus:outline-none focus:glow-border-focus transition-all duration-200 flex items-center justify-between"
      >
        <div className="flex items-center justify-center flex-1">
          {selectedOption && (
            <>
              <span className="font-medium text-white text-center">{selectedOption.label}</span>
              {selectedOption.count !== undefined && (
                <span className="text-sei-400 text-sm font-medium ml-2">
                  ({selectedOption.count})
                </span>
              )}
            </>
          )}
          {!selectedOption && (
            <span className="text-gray-400 font-medium text-center">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-all duration-300 ml-3 flex-shrink-0 ${isOpen ? "rotate-180 text-sei-400" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="py-2 max-h-64 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-center transition-all duration-200 flex items-center justify-center ${
                    value === option.value ? "bg-sei-400/20 text-sei-400" : "text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {value === option.value && (
                      <svg
                        className="w-4 h-4 text-sei-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span
                      className={`font-medium ${value === option.value ? "text-sei-400" : "text-gray-300"}`}
                    >
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span
                        className={`text-sm font-medium ${
                          value === option.value ? "text-sei-400" : "text-gray-500"
                        }`}
                      >
                        ({option.count})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const MarketSortDropdown = () => {
  const setSearchParams = useSetSearchParams();
  const searchParams = useSearchParams();

  const handleSort = useDebouncedCallback((sortBy: Market_OrderBy) => {
    const sortDirection =
      sortBy == Market_OrderBy.Question ? OrderDirection.Asc : OrderDirection.Desc;
    setSearchParams({ sortBy, sortDirection });
  }, 300);

  return (
    <CustomDropdown
      options={[
        { value: Market_OrderBy.CreateTime, label: "Most Recent" },
        { value: Market_OrderBy.VolumeUsd, label: "Highest Volume" },
        { value: Market_OrderBy.Question, label: "Alphabetical" },
      ]}
      value={searchParams.get("sortBy") || "volume"}
      onChange={(v) => handleSort(v as Market_OrderBy)}
      placeholder="Sort by"
      className="min-w-[140px]"
    />
  );
};
