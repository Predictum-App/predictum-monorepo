"use client";

import { useAccount } from "wagmi";
import { useProfile } from "../hooks/useProfile";
import { CustomConnectButton } from "../components/web3/CustomConnectButton";
import { ProfileStats } from "./components/ProfileStats";
import { CreatedMarkets } from "./components/CreatedMarkets";
import { UserShares } from "./components/UserShares";
import { TradingHistory } from "./components/TradingHistory";
import { LiquidityHistory } from "./components/LiquidityHistory";
import { BackgroundCircles } from "../components/misc/BackgroundCircles";
import {
  ProfileStatsSkeleton,
  CreatedMarketsSkeleton,
  UserSharesSkeleton,
  TradingHistorySkeleton,
  LiquidityHistorySkeleton,
} from "./components/skeletons";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { profile, loading, error } = useProfile(address || "");

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <CustomConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundCircles />
        <div className="relative max-w-7xl mx-auto px-8 pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Created Markets */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileStatsSkeleton />
              <CreatedMarketsSkeleton />
              <UserSharesSkeleton />
            </div>

            {/* Right Column - Trading and Liquidity History */}
            <div className="flex flex-col space-y-6">
              <TradingHistorySkeleton />
              <LiquidityHistorySkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundCircles />
        <div className="relative max-w-7xl mx-auto px-8 pt-32">
          <div className="bg-dark-800/50 border border-red-500/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-red-400 text-center">Error loading profile: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundCircles />
        <div className="relative max-w-7xl mx-auto px-8 pt-32">
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-gray-400 text-center">No profile data found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic floating circles - only render on client */}
      <BackgroundCircles />

      <div className="relative max-w-7xl mx-auto px-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Created Markets */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileStats profile={profile} />
            <CreatedMarkets address={address} />
            <UserShares address={address} />
          </div>

          {/* Right Column - Trading and Liquidity History */}
          <div className="flex flex-col space-y-6">
            <TradingHistory profile={profile} />
            <LiquidityHistory profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
