"use client";

import { TrendingUp, TrendingDown, Target, Coins } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { formatAmountWithRegex, nFormatter } from "@/lib/utils";

interface ProfileStatsProps {
  profile: UserProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  // Calculate statistics
  const totalFeesClaimed =
    profile.feesClaimedEvents?.reduce((sum, event) => sum + BigInt(event.amount || 0), BigInt(0)) ||
    BigInt(0);

  const totalRewardsClaimed =
    profile.rewardClaims?.reduce((sum, event) => sum + BigInt(event.amount || 0), BigInt(0)) ||
    BigInt(0);

  const totalWinnings = totalFeesClaimed + totalRewardsClaimed;
  const marketsCreated = profile.marketDatas?.length || 0;
  const totalShares =
    profile.marketDatas?.reduce(
      (sum, marketData) =>
        sum +
          marketData.outcomes?.reduce(
            (outcomeSum, outcome) => outcomeSum + Number(outcome.shares || 0),
            0,
          ) || 0,
      0,
    ) || 0;

  // Calculate net liquidity (added - removed)
  const totalLiquidity =
    (profile.liquidityAddedEvents?.reduce(
      (sum, event) => sum + Number(event.amount || 0),
      Number(0),
    ) || Number(0)) -
    (profile.liquidityRemovedEvents?.reduce(
      (sum, event) => sum + Number(event.amount || 0),
      Number(0),
    ) || Number(0));

  const stats = [
    {
      title: "Total Winnings",
      value: `$${formatAmountWithRegex(totalWinnings, 6, 2, true)}`,
      trend: "up",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "Markets Created",
      value: nFormatter(marketsCreated, 0, "", true),
      change: "This month",
      trend: "neutral",
      icon: Target,
      color: "text-blue-400",
    },
    {
      title: "Total Shares",
      value: nFormatter(totalShares, 0, "", true),
      change: "Active positions",
      trend: "neutral",
      icon: Coins,
      color: "text-purple-400",
    },
    {
      title: "Liquidity Provided",
      value: nFormatter(totalLiquidity, 0, "$", true),
      change: "Net provided",
      trend: "neutral",
      icon: TrendingDown,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-6">Portfolio Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-dark-700/30 border border-dark-600/30 rounded-xl p-4 hover:bg-dark-700/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {stat.trend === "up" && stat.change && (
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
              {stat.trend !== "up" && <p className="text-xs text-gray-500">{stat.change}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
