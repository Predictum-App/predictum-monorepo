"use server";

import { Suspense } from "react";
import Link from "next/link";

import { FeaturedMarketsSkeleton } from "@/app/components/markets/FeaturedMarketsSkeleton";
import { FeaturedMarketsContent } from "./FeaturedMarketsContent";

// Main Featured Markets Component with Suspense
export default async function FeaturedMarkets() {
  return (
    <div className="relative w-full py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Featured Markets
          </h2>
        </div>

        <Suspense fallback={<FeaturedMarketsSkeleton />}>
          <FeaturedMarketsContent />
        </Suspense>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/markets"
            className="inline-flex items-center px-8 py-3 bg-sei-400 text-dark-950 rounded-full font-semibold text-lg hover:bg-sei-300 transition-colors shadow-lg shadow-sei-400/20"
          >
            View All Markets
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
