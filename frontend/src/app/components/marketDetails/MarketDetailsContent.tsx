"use server";

import { FC } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ChartColumnIcon, ClockIcon, LockKeyholeIcon } from "lucide-react";

import { getMarket } from "@/lib/api";
import { nFormatter } from "@/lib/utils";

import { MarketDetailsRules } from "./MarketDetailsRules";
import { MarketDetailsTabs } from "./MarketDetailsTabs";
import { MarketDetailsSiderbar } from "./MarketDetailsSidebar";
import { MarketDetailsNotFound } from "./MarketDetailsNotFound";
import { MarketDetailsChart } from "./MarketDetailsChart";
import { MarketDetailsLiquiditySiderbar } from "./MarketDetailsLiquiditySidebar";

type Props = {
  address: string;
};

export const MarketDetailsContent: FC<Props> = async ({ address }) => {
  const market = await getMarket(address);

  if (!market) {
    return <MarketDetailsNotFound address={address} />;
  }

  return (
    <div className="relative max-w-7xl mx-auto px-8 pt-32">
      {/* Market Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left and Center Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Question Card */}
          <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              {/* Orange square icon with checkmark */}
              <div className="w-full relative aspect-square min-w-[64px] max-w-[64px] max-h-[64px] rounded-lg overflow-hidden flex-shrink-0">
                {market.marketURI ? (
                  <Image
                    src={market.marketURI}
                    fill
                    alt="market"
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-sei-400 rounded flex-shrink-0 flex items-center justify-center"></div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-white text-xl font-semibold mb-2">{market.question}</h1>
                <div className="flex flex-wrap items-center gap-2 overflow-hidden">
                  <p className="flex items-center gap-1.5 text-gray-400 text-sm overflow-hidden">
                    <ClockIcon size={16} />
                    {format(market.closeAt, "d MMMM, yyyy, HH:mm")}
                  </p>
                  <div className="w-[1px] h-2.5 bg-gray-400"></div>
                  <p className="flex items-center gap-1.5 text-gray-400 text-sm overflow-hidden">
                    <ChartColumnIcon size={16} />
                    {nFormatter(market.volumeUSD, 0, "$", true)} Vol.
                  </p>
                  <div className="w-[1px] h-2.5 bg-gray-400"></div>
                  <p className="flex items-center gap-1.5 text-gray-400 text-sm overflow-hidden">
                    <LockKeyholeIcon size={16} />
                    {nFormatter(market.tvlUSD, 0, "$", true)} TVL
                  </p>
                </div>
              </div>
            </div>
          </div>

          <MarketDetailsChart market={market} />

          {/* Rules Section */}
          <MarketDetailsRules />

          {/* Comments Section */}
          <MarketDetailsTabs market={market} />
        </div>

        {/* Right Sidebar - Trading Interface */}
        <div className="flex flex-col space-y-6">
          <MarketDetailsSiderbar market={market} />
          <MarketDetailsLiquiditySiderbar market={market} />
        </div>
      </div>
    </div>
  );
};
