"use server";

import { CommonSearchParams } from "@/lib/types";

import { BackgroundCircles } from "@/app/components/misc/BackgroundCircles";
import { MarketSearch } from "@/app/components/markets/MarketSearch";
import { MarketSortDropdown } from "@/app/components/markets/MarketSortDropdown";
import { MarketFilterCategories } from "@/app/components/markets/MarketFilterCategories";
import { MarketsGrid } from "@/app/components/markets/MarketsGrid";

export default async function Page(props: { searchParams?: Promise<CommonSearchParams> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-sei-gradient"></div>
      <div className="absolute inset-0 bg-sei-radial"></div>
      <div className="absolute inset-0 bg-sei-overlay"></div>

      {/* Dynamic floating circles - only render on client */}
      <BackgroundCircles />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-8">
        {/* Page Title Section */}
        <div className="text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              All Markets
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
              Discover and trade on prediction markets
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto pb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <MarketSearch />

            {/* Sort */}
            <MarketSortDropdown />
          </div>

          {/* Category Tabs */}
          <MarketFilterCategories />
        </div>

        {/* Markets Grid */}
        <MarketsGrid searchParams={searchParams} />
      </div>
    </div>
  );
}
