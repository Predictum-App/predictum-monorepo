import { cn } from "@/lib/utils";
import { FC } from "react";

type Props = {
  price: number;
  name: string;
};
export const MarketChanceCircle: FC<Props> = ({ price, name }) => {
  const firstOutcomePrice = Number(price);
  const firstOutcomePricePct = Math.round(firstOutcomePrice * 100);
  const radius = 24;
  const clampedProgress = Math.max(0, Math.min(1, firstOutcomePrice));
  const endAngle = Math.PI * (1 - clampedProgress); // from π (left) down to 0 (right)
  const endX = radius * Math.cos(endAngle);
  const endY = -radius * Math.sin(endAngle); // negative y to draw on top in default SVG coords
  const sweepFlag = 1; // draw from left to right via top

  let color = "text-green-400";
  if (price <= 0.25) {
    color = "text-red-400";
  } else if (price < 0.5) {
    color = "text-yellow-400";
  }
  return (
    <div className="flex flex-col items-center flex-shrink-0 relative">
      <div className="relative w-14 h-10">
        <svg className="w-14 h-10" viewBox="-24 -24 48 30" style={{ overflow: "visible" }}>
          {/* Background semicircle */}
          <path
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-600"
            strokeLinecap="round"
          />
          {/* Price progress semicircle */}
          {clampedProgress > 0 && (
            <path
              d={`M ${-radius} 0 A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className={color}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute-centered">
          <span className={cn("text-sm font-bold leading-none", color)}>
            {firstOutcomePricePct}%
          </span>
        </div>
      </div>
      <span className="absolute -bottom-2 text-[10px] text-gray-400 max-w-[3.5rem] text-center truncate">
        {name}
      </span>
    </div>
  );
};
