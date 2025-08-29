import { FC, forwardRef } from "react";
import clsx from "clsx";

import { shimmer } from "@/lib/utils";

type Props = React.HTMLProps<HTMLDivElement>;

export const MarketCardSkeleton: FC<Props> = forwardRef(({ className, ...rest }, ref) => {
  return (
    <div
      {...rest}
      className={clsx(
        "bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md h-full",
        className,
      )}
      ref={ref}
    >
      {/* Header with Icon, Title and Probability */}
      <div className="flex items-start space-x-3 mb-4">
        {/* Icon skeleton */}
        <div className="w-8 h-8 rounded bg-gray-700 relative overflow-hidden">
          <div className={shimmer}></div>
        </div>

        {/* Market title skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-700 rounded relative overflow-hidden mb-2">
            <div className={shimmer}></div>
          </div>
          <div className="h-3 bg-gray-700 rounded relative overflow-hidden w-3/4">
            <div className={shimmer}></div>
          </div>
        </div>

        {/* Probability Circle skeleton */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-700 relative overflow-hidden">
            <div className={shimmer}></div>
          </div>
        </div>
      </div>

      {/* Action Buttons skeleton */}
      <div className="flex space-x-2 mb-4">
        <div className="flex-1 h-8 bg-gray-700 rounded-lg relative overflow-hidden">
          <div className={shimmer}></div>
        </div>
        <div className="flex-1 h-8 bg-gray-700 rounded-lg relative overflow-hidden">
          <div className={shimmer}></div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-700 rounded relative overflow-hidden">
          <div className={shimmer}></div>
        </div>
        <div className="w-4 h-4 bg-gray-700 rounded relative overflow-hidden">
          <div className={shimmer}></div>
        </div>
      </div>
    </div>
  );
});
MarketCardSkeleton.displayName = "MarketCardSkeleton";
