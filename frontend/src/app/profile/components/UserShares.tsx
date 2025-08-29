"use client";

import { Coins, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

import { useUserShares } from "../../hooks/useProfile";
import { Market, MarketState } from "@/lib/types";
import { nFormatter } from "@/lib/utils";

interface UserSharesProps {
  address: string;
}

export function UserShares({ address }: UserSharesProps) {
  const { shares, loading, error } = useUserShares(address);

  if (loading) {
    return (
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-700/50 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-dark-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <p className="text-red-400">Error loading user shares: {error}</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return format(date, "d MMMM, yyyy, HH:mm");
  };

  const getMarketStatus = (state: MarketState, resolvedOutcome: string | null) => {
    if (state === MarketState.Open) return { text: "Open", color: "text-blue-400" };
    if (state === MarketState.Closed) return { text: "Closed", color: "text-yellow-400" };
    if (state === MarketState.Resolved && resolvedOutcome !== null)
      return { text: "Resolved", color: "text-green-400" };
    return { text: "Unknown", color: "text-gray-400" };
  };

  // Group shares by market
  const groupedShares = shares.reduce<
    Record<
      string,
      {
        market: Market;
        outcomes: Array<{
          index: number;
          shares: string;
          outcomeName: string;
        }>;
        totalShares: number;
      }
    >
  >((acc, share) => {
    const marketAddress = share.market.address;
    if (!acc[marketAddress]) {
      acc[marketAddress] = {
        market: share.market,
        outcomes: [],
        totalShares: 0,
      };
    }

    acc[marketAddress].outcomes.push({
      index: share.index,
      shares: share.shares,
      outcomeName: share.market.outcomes[share.index],
    });

    acc[marketAddress].totalShares += Number(share.shares);

    return acc;
  }, {});

  const groupedSharesArray = Object.values(groupedShares);

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">My Shares</h2>
        <div className="flex items-center space-x-2 text-gray-400">
          <Coins className="h-4 w-4" />
          <span className="text-sm">{groupedSharesArray.length} markets</span>
        </div>
      </div>

      {groupedSharesArray.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No shares owned yet</h3>
          <p className="text-gray-500">Start trading to build your prediction portfolio</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {groupedSharesArray.map((group) => {
            const status = getMarketStatus(
              group.market.state,
              group.market.resolvedOutcomeIndex?.toString() || null,
            );

            return (
              <div
                key={group.market.address}
                className="bg-dark-700/30 border border-dark-600/30 rounded-xl p-4 hover:bg-dark-700/50 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/markets/${group.market.address}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium overflow-hidden text-ellipsis display-webkit-box -webkit-line-clamp-2 -webkit-box-orient-vertical break-words flex-1 min-w-0">
                        {group.market.question}
                      </h3>
                      <span className={`${status.color} text-sm font-medium flex-shrink-0 ml-3`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {group.market.state === MarketState.Resolved && (
                      <>
                        {group.outcomes.some(
                          (outcome) => group.market.resolvedOutcomeIndex === outcome.index,
                        ) ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            group.outcomes.some(
                              (outcome) => group.market.resolvedOutcomeIndex === outcome.index,
                            )
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {group.outcomes.some(
                            (outcome) => group.market.resolvedOutcomeIndex === outcome.index,
                          )
                            ? "Won"
                            : "Lost"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Outcome breakdown */}
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-400 font-medium">Your Positions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.outcomes.map((outcome) => {
                      const isWinning = group.market.resolvedOutcomeIndex === outcome.index;
                      return (
                        <div
                          key={outcome.index}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            group.market.state === MarketState.Resolved
                              ? isWinning
                                ? "bg-green-500/10 border border-green-500/20"
                                : "bg-red-500/10 border border-red-500/20"
                              : "bg-dark-600/30 border border-dark-500/30"
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-sm text-white font-medium truncate">
                              {outcome.outcomeName}
                            </span>
                            {group.market.state === MarketState.Resolved && (
                              <span
                                className={`text-xs flex-shrink-0 ${
                                  isWinning ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {isWinning ? "✓" : "✗"}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-300 flex-shrink-0 ml-2">
                            {nFormatter(outcome.shares, 0, "", true)} shares
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-400 min-w-0">
                    <span className="truncate">Created: {formatDate(group.market.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
