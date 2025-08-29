import { forwardRef } from "react";
import { MarketCardSkeleton } from "./MarketCardSkeleton";

type Props = {
  wrap?: boolean;
};

export const MarketsGridSkeleton = forwardRef<HTMLDivElement, Props>(({ wrap }, ref) => {
  return (
    <>
      {wrap ? (
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-10"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <MarketCardSkeleton
              key={index}
              className="fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : (
        Array.from({ length: 6 }).map((_, index) => (
          <MarketCardSkeleton
            key={index}
            className="fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            ref={index === 0 ? ref : undefined}
          />
        ))
      )}
    </>
  );
});
MarketsGridSkeleton.displayName = "MarketsGridSkeleton";
