"use client";

import { format } from "date-fns";
import { Plus, Minus, Droplets } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { nFormatter } from "@/lib/utils";

interface LiquidityHistoryProps {
  profile: UserProfile;
}

export function LiquidityHistory({ profile }: LiquidityHistoryProps) {
  const addedEvents = profile.liquidityAddedEvents || [];
  const removedEvents = profile.liquidityRemovedEvents || [];

  // Combine and sort all liquidity events by timestamp
  const allLiquidityEvents = [
    ...addedEvents.map((event) => ({ ...event, type: "add" })),
    ...removedEvents.map((event) => ({ ...event, type: "remove" })),
  ].sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

  const formatDate = (timestamp: string) => {
    return format(new Date(Number(timestamp) * 1000), "d MMMM, yyyy, HH:mm");
  };

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-6">Liquidity History</h2>

      {allLiquidityEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-dark-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Droplets className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No liquidity activity yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allLiquidityEvents.slice(0, 8).map((event, index) => (
            <div
              key={`${event.type}-${event.id}-${index}`}
              className="bg-dark-700/30 border border-dark-600/30 rounded-lg p-3 hover:bg-dark-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {event.type === "add" ? (
                    <Plus className="h-4 w-4 text-green-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      event.type === "add" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {event.type === "add" ? "Added" : "Removed"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(event.blockTimestamp)}</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-white line-clamp-1">{event.market.question}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Amount: {nFormatter(event.amount, 0, "$", true)}</span>
                  <span>
                    Shares: {nFormatter(event.liquidityShares || event.shares || "0", 0, "", true)}
                  </span>
                </div>
                {event.outcomeSharesReturned && event.outcomeSharesReturned.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span>
                      Outcome shares returned:{" "}
                      {event.outcomeSharesReturned
                        .map((s) => nFormatter(s, 0, "", true))
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {allLiquidityEvents.length > 8 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing last 8 events of {allLiquidityEvents.length} total
          </p>
        </div>
      )}
    </div>
  );
}
