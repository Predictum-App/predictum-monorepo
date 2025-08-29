"use server";

import { MarketCard } from "@/app/components/markets/MarketCard";
import { getFeatuedMarkets } from "@/lib/api";

// Featured Markets Content Component
export const FeaturedMarketsContent = async () => {
  const markets = await getFeatuedMarkets();

  return (
    <>
      {markets.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No active markets</h3>
          <p className="text-gray-400 mb-6">There are currently no featured markets available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-10 mb-12">
          {markets.map((market, index) => (
            <MarketCard key={market.address} market={market} index={index} />
          ))}
        </div>
      )}
    </>
  );
};
