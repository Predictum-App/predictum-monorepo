import { MarketCardSkeleton } from "./MarketCardSkeleton";

export function FeaturedMarketsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-10 mb-12">
      {Array.from({ length: 8 }).map((_, index) => (
        <MarketCardSkeleton key={index} />
      ))}
    </div>
  );
}
