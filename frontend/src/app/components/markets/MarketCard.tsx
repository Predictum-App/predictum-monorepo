"use client";

import { StarIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Market } from "@/lib/types";
import { cn, nFormatter } from "@/lib/utils";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

import { MarketChanceCircle } from "./MarketChanceCircle";

type Props = {
  market: Market;
  index: number;
};

export const MarketCard: FC<Props> = ({ market, index }) => {
  const router = useRouter();

  const [isFavorited, setIsFavorited] = useState<boolean | null>(null);

  useEffect(() => {
    setIsFavorited(isFavorite(market.address));
  }, [market.address]);

  const handleMarketClick = () => {
    router.push(`/markets/${market.address}`);
  };

  const handleOutcomeBuy = (index: number) => {
    router.push(`/markets/${market.address}?outcome=${index}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteStatus = toggleFavorite(market);
    setIsFavorited(newFavoriteStatus);
  };

  return (
    <div
      className="fade-in cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleMarketClick}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 h-full">
        {/* Header with Icon, Title and Probability */}
        <div className="flex items-start space-x-3 mb-4">
          {/* Icon - Orange for Bitcoin, Blue for others */}
          <div className="w-full relative aspect-square min-w-[32px] max-w-[32px] max-h-[32px] rounded-lg overflow-hidden flex-shrink-0">
            {market.marketURI ? (
              <Image
                src={market.marketURI}
                fill
                alt="market"
                data-loaded="false"
                onLoad={(event) => {
                  event.currentTarget.setAttribute("data-loaded", "true");
                }}
                className={cn(
                  "object-cover h-full w-full data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10",
                )}
              />
            ) : (
              <div className="w-16 h-16 bg-sei-400 rounded flex-shrink-0 flex items-center justify-center"></div>
            )}
          </div>

          {/* Market title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
              {market.question}
            </h3>
          </div>

          {/* Price Semi-Circle (First Outcome) */}
          <MarketChanceCircle
            price={market.outcomePrice?.[0] ?? 0}
            name={market.outcomes?.[0] ?? "Chance"}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOutcomeBuy(0);
            }}
            className="overflow-hidden flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1 border border-gray-700"
          >
            <span className="truncate">Buy {market.outcomes[0]}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOutcomeBuy(1);
            }}
            className="overflow-hidden flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1 border border-gray-700"
          >
            <span className="truncate">Buy {market.outcomes[1]}</span>
          </button>
        </div>

        {/* Footer with Volume and Star */}
        <div className="flex space-x-2 items-center justify-between text-xs text-gray-400">
          <div className="overflow-hidden flex items-center space-x-1">
            <span className="truncate">{nFormatter(market.volumeUSD, 0, "$", true)} Vol.</span>
          </div>
          {isFavorited !== null && (
            <button onClick={handleFavoriteClick} className="transition-colors">
              <StarIcon
                size={14}
                className={cn(
                  "hover:fill-yellow-300 hover:stroke-yellow-300",
                  isFavorited && "fill-yellow-400 stroke-yellow-400",
                )}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
