"use client";

import { Market } from "@/lib/types";
import { FC, useState } from "react";
import PriceChart from "../PriceChart";

type Props = {
  market: Market;
};

const timeframes = ["6h", "1d", "1w", "1m", "all"] as const;

export const MarketDetailsChart: FC<Props> = ({ market }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<(typeof timeframes)[number]>("1d");

  return (
    <>
      {/* Timeframe Selection */}
      <div className="flex space-x-2">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? "bg-sei-400 text-dark-950"
                : "bg-dark-700/50 text-gray-300 hover:bg-dark-600/50"
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>
      {/* Price Chart */}
      <PriceChart
        marketAddress={market.address}
        outcomes={market.outcomes || []}
        timeframe={selectedTimeframe}
        // onPricesUpdate={setCurrentPrices}
      />
    </>
  );
};
