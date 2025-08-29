"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getFavorites } from "@/lib/favorites";
import { Market } from "@/lib/types";
import { BackgroundCircles } from "@/app/components/misc/BackgroundCircles";
import { MarketCard } from "@/app/components/markets/MarketCard";

const FavoritesPage: React.FC = () => {
  const router = useRouter();

  const [favorites, setFavorites] = useState<string[] | null>(null);

  const { data, refetch } = useQuery<Market[]>({
    queryKey: ["get-favourite-markets", favorites?.join(",")],
    queryFn: async () => {
      if (!favorites) {
        return [];
      }
      const res = await axios.get<Market[]>(
        `/api/get-favourite-markets?addresses=${favorites.join(",")}`,
      );
      return res.data;
    },
    enabled: !!favorites,
  });

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = getFavorites();
      setFavorites(storedFavorites);
      await refetch();
    };

    loadFavorites();

    // Listen for storage changes to update favorites in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "prediction-markets-favorites") {
        loadFavorites();
      }
    };

    // Custom event listener for real-time updates within the same tab
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-updated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", handleFavoritesUpdate);
    };
  }, [refetch]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-sei-gradient"></div>
      <div className="absolute inset-0 bg-sei-radial"></div>
      <div className="absolute inset-0 bg-sei-overlay"></div>

      {/* Dynamic floating circles - only render on client */}
      <BackgroundCircles />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-8 pt-32">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Favorites</h1>
          <p className="text-lg sm:text-xl text-gray-300">Your saved prediction markets</p>
        </div>

        {/* Favorites Content */}
        {favorites && favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
              <p className="text-gray-400 mb-6">
                Start exploring markets and click the star icon to save your favorites here.
              </p>
              <button
                onClick={() => router.push("/markets")}
                className="px-6 py-3 bg-sei-400 text-dark-950 rounded-lg font-semibold hover:bg-sei-300 transition-colors"
              >
                Browse Markets
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {data &&
              data.map((market, i) => (
                <div key={market.address} className="fade-in">
                  <MarketCard market={market} index={i} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
