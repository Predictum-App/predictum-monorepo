"use client";

import Link from "next/link";
import { useState } from "react";

export default function Hero() {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="relative max-w-7xl mx-auto px-8">
      <div className="text-center min-h-screen flex flex-col justify-center items-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 sm:pb-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* Main Headline */}
          <h1 className="font-space-grotesk font-normal text-white text-center leading-tight">
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-medium">
              Predict. Trade. Influence.
            </span>
            <span className="block text-sei-400 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mt-2 sm:mt-4">
              Predictum.
            </span>
          </h1>

          {/* Subtitle */}
          <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-dark-200 leading-relaxed font-light">
              Don&apos;t wait for the market. Create it anytime, anywhere.
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-sei-400 font-medium leading-relaxed">
              It&apos;s as easy as posting on X. Predictum.
            </p>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto pt-6 sm:pt-8">
            <div className="bg-dark-800/60 glow-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sei-400/5">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="What price will Bitcoin hit in August 2025? ($150,000)"
                    className="w-full bg-transparent border-none outline-none text-dark-200 text-base sm:text-lg leading-relaxed placeholder-dark-400 focus:placeholder-dark-500 transition-colors"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 sm:space-x-4">
                <div
                  className="cursor-pointer inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-dark-300 text-sm sm:text-base font-medium hover:text-white transition-colors border border-dark-600 rounded-full hover:border-dark-500"
                  onClick={() => window.open("https://docs.predictum.xyz/", "_blank")}
                >
                  How It Works
                </div>
                <Link
                  href={`/markets/create${searchText ? `?question=${encodeURIComponent(searchText)}` : ""}`}
                  className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-sei-400 text-dark-950 rounded-full font-semibold text-sm sm:text-base hover:bg-sei-300 transition-colors shadow-lg shadow-sei-400/20"
                >
                  Create Market
                </Link>
              </div>
            </div>

            {/* Example markets - responsive layout */}
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4">
              <p className="text-sm text-dark-400 font-medium text-center">or create:</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                {[
                  "What price will Ethereum hit in August? ($10,000)",
                  "Will the US confirm that aliens exist in 2025?",
                ].map((market, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchText(market);
                    }}
                    className="px-3 sm:px-4 py-2 bg-dark-800/60 border border-dark-700/30 rounded-xl text-xs sm:text-sm text-dark-200 hover:bg-dark-700/60 hover:border-dark-600/50 hover:text-white transition-all duration-200 group flex items-center justify-center cursor-pointer"
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
