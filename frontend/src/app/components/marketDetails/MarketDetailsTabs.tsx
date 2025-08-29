"use client";

import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Market, TopHoldersResult } from "@/lib/types";

type Props = {
  market: Market;
};

export const MarketDetailsTabs: FC<Props> = ({ market }) => {
  const [activeTab, setActiveTab] = useState<"top-holders">("top-holders");

  // Fetch top holders data
  const {
    data: topHolders,
    isLoading,
    error,
  } = useQuery<TopHoldersResult>({
    queryKey: ["top-holders", market.address],
    queryFn: async () => {
      const result = await axios.get<TopHoldersResult>(
        `/api/get-top-holders?address=${market.address}`,
        { headers: { cache: "no-store" } },
      );
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
        <div className="flex space-x-6 mb-6 border-b border-dark-700/50">
          <button
            onClick={() => setActiveTab("top-holders")}
            className={`pb-2 font-medium flex items-center space-x-2 transition-colors ${
              activeTab === "top-holders"
                ? "text-sei-400 border-b-2 border-sei-400"
                : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>Top Holders</span>
          </button>
        </div>
        <div className="text-center py-8">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading top holders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
        <div className="flex space-x-6 mb-6 border-b border-dark-700/50">
          <button
            onClick={() => setActiveTab("top-holders")}
            className={`pb-2 font-medium flex items-center space-x-2 transition-colors ${
              activeTab === "top-holders"
                ? "text-sei-400 border-b-2 border-sei-400"
                : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>Top Holders</span>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Error loading top holders</p>
          <p className="text-gray-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!topHolders) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
        <div className="flex space-x-6 mb-6 border-b border-dark-700/50">
          <button
            onClick={() => setActiveTab("top-holders")}
            className={`pb-2 font-medium flex items-center space-x-2 transition-colors ${
              activeTab === "top-holders"
                ? "text-sei-400 border-b-2 border-sei-400"
                : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>Top Holders</span>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No top holders data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-6 mb-6 border-b border-dark-700/50">
        <button
          onClick={() => setActiveTab("top-holders")}
          className={`pb-2 font-medium flex items-center space-x-2 transition-colors ${
            activeTab === "top-holders"
              ? "text-sei-400 border-b-2 border-sei-400"
              : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span>Top Holders</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "top-holders" && (
        <div className="flex flex-wrap gap-x-6 w-full mt-2">
          {/* YES Outcomes Table */}
          {topHolders.outcome0 && topHolders.outcome0.length > 0 && (
            <div className="flex-[40%_1_1] sm:min-w-[250px] max-w-full">
              <table className="[&_td]:py-4 [&_td]:px-2 text-sm w-full [&_td]:border-b [&_td]:border-b-stroke-soft-200 holders-users-table table-fixed">
                <thead>
                  <tr>
                    <td className="first-letter-uppercase font-semibold w-2/3 truncate">
                      {market.outcomes[0]}
                    </td>
                    <td className="text-right text-text-sub-600 w-1/3">Shares</td>
                  </tr>
                </thead>
                <tbody>
                  {topHolders.outcome0.map((holder) => (
                    <tr key={`${holder.address}-0`}>
                      <td className="sm:flex sm:items-center min-w-0 overflow-hidden">
                        <span
                          className="leading-6 font-semibold sm:hidden truncate block max-w-full"
                          title={holder.address}
                        >
                          {holder.address?.slice(0, 6)}...{holder.address?.slice(-4)}
                        </span>
                        <div className="hidden sm:flex items-center min-w-0">
                          <span
                            className="leading-6 font-semibold truncate max-w-full"
                            title={holder.address}
                          >
                            {holder.address?.slice(0, 6)}...{holder.address?.slice(-4)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-medium text-xs sm:text-sm min-w-0 overflow-hidden">
                        <span className="truncate block max-w-full">{holder.shares}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Outcome 1 Table */}
          {topHolders.outcome1 && topHolders.outcome1.length > 0 && (
            <div className="flex-[40%_1_1] sm:min-w-[250px] max-w-full">
              <table className="[&_td]:py-4 [&_td]:px-2 text-sm w-full [&_td]:border-b [&_td]:border-b-stroke-soft-200 holders-users-table table-fixed">
                <thead>
                  <tr>
                    <td className="first-letter-uppercase font-semibold w-2/3 truncate">
                      {market.outcomes[1]}
                    </td>
                    <td className="text-right text-text-sub-600 w-1/3">Shares</td>
                  </tr>
                </thead>
                <tbody>
                  {topHolders.outcome1.map((holder) => (
                    <tr key={`${holder.address}-1`}>
                      <td className="sm:flex sm:items-center min-w-0 overflow-hidden">
                        <span
                          className="leading-6 font-semibold sm:hidden truncate block max-w-full"
                          title={holder.address}
                        >
                          {holder.address?.slice(0, 6)}...{holder.address?.slice(-4)}
                        </span>
                        <div className="hidden sm:flex items-center min-w-0">
                          <span
                            className="leading-6 font-semibold truncate max-w-full"
                            title={holder.address}
                          >
                            {holder.address?.slice(0, 6)}...{holder.address?.slice(-4)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-medium text-xs sm:text-sm min-w-0 overflow-hidden">
                        <span className="truncate block max-w-full">{holder.shares}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
