"use client";

import { ArrowUpRight, ArrowDownLeft, DollarSign } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { nFormatter } from "@/lib/utils";
import { format } from "date-fns";

interface TradingHistoryProps {
  profile: UserProfile;
}

export function TradingHistory({ profile }: TradingHistoryProps) {
  const boughtEvents = profile.sharesBoughtEvents || [];
  const soldEvents = profile.sharesSoldEvents || [];

  const allTradingEvents = [
    ...boughtEvents.map((event) => ({ ...event, type: "buy" })),
    ...soldEvents.map((event) => ({ ...event, type: "sell" })),
  ].sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));

  const formatDate = (timestamp: string) => {
    return format(new Date(Number(timestamp) * 1000), "d MMMM, yyyy, HH:mm");
  };

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-6">Trading History</h2>

      {allTradingEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-dark-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No trading activity yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allTradingEvents.slice(0, 10).map((event, index) => (
            <div
              key={`${event.type}-${event.id}-${index}`}
              className="bg-dark-700/30 border border-dark-600/30 rounded-lg p-3 hover:bg-dark-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {event.type === "buy" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      event.type === "buy" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {event.type === "buy" ? "Bought" : "Sold"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(event.blockTimestamp)}</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-white line-clamp-1">{event.market.question}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Outcome: {event.market.outcomes[event.outcomeIndex]}</span>
                  <span>Shares: {nFormatter(event.shares, 0, "", true)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Amount: {nFormatter(event.amount, 0, "$", true)}</span>
                  <span>Fee: {nFormatter(event.fee, 0, "$", true)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {allTradingEvents.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing last 10 trades of {allTradingEvents.length} total
          </p>
        </div>
      )}
    </div>
  );
}
