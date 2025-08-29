"use client";

import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";
import { useUserCreatedMarkets } from "../../hooks/useProfile";
import { MarketState } from "@/lib/types";
import { nFormatter } from "@/lib/utils";

interface CreatedMarketsProps {
  address: string;
}

export function CreatedMarkets({ address }: CreatedMarketsProps) {
  const { markets, loading, error } = useUserCreatedMarkets(address);

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
        <p className="text-red-400">Error loading created markets: {error}</p>
      </div>
    );
  }

  const getMarketStatus = (state: MarketState, resolvedOutcome: string | null) => {
    if (state === MarketState.Open) return { text: "Open", icon: Clock, color: "text-blue-400" };
    if (state === MarketState.Closed)
      return { text: "Closed", icon: Clock, color: "text-yellow-400" };
    if (state === MarketState.Resolved && resolvedOutcome !== null)
      return { text: "Resolved", icon: CheckCircle, color: "text-green-400" };
    return { text: "Unknown", icon: XCircle, color: "text-gray-400" };
  };

  const formatDate = (date: Date) => {
    return format(date, "d MMMM, yyyy, HH:mm");
  };

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Markets Created</h2>
        <Link href="/markets/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Market
          </Button>
        </Link>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-12">
          <Link href="/markets/create">
            <div className="w-16 h-16 bg-dark-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
          </Link>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No markets created yet</h3>
          <p className="text-gray-500">Start creating prediction markets to build your portfolio</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {markets.map((market) => {
            const status = getMarketStatus(
              market.state,
              market.resolvedOutcomeIndex?.toString() || null,
            );
            const StatusIcon = status.icon;

            return (
              <div
                key={market.address}
                className="bg-dark-700/30 border border-dark-600/30 rounded-xl p-4 hover:bg-dark-700/50 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/markets/${market.address}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2 line-clamp-2">{market.question}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Created: {formatDate(market.createdAt)}</span>
                      <span>Volume: {nFormatter(market.volumeUSD, 0, "$", true)}</span>
                      <span>TVL: {nFormatter(market.tvlUSD, 0, "$", true)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                  </div>
                </div>

                {market.outcomes && market.outcomes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {market.outcomes.map((outcome: string, index: number) => (
                      <Link
                        key={index}
                        href={
                          market.state === MarketState.Open
                            ? `/markets/${market.address}?outcome=${index}`
                            : `/markets/${market.address}`
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform ${
                          market.resolvedOutcomeIndex === index
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-dark-600/50 text-gray-300 border border-dark-500/30 hover:bg-dark-600/70"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {outcome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
