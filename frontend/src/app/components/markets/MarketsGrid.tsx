"use client";

import { FC, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import { CommonSearchParams, Market } from "@/lib/types";

import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

import { MarketCard } from "./MarketCard";
import { MarketsGridSkeleton } from "./MarketGridSkeleton";

type Props = {
  searchParams?: CommonSearchParams;
};

export const MarketsGrid: FC<Props> = ({ searchParams }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Reset state when searchParams change
  useEffect(() => {
    setMarkets([]);
    setPage(1);
    setHasMore(true);
  }, [
    searchParams?.searchTerm,
    searchParams?.sortBy,
    searchParams?.sortDirection,
    searchParams?.state,
    searchParams?.filter,
    searchParams?.addresses,
  ]);

  const getUrl = useCallback(() => {
    const baseUrl = "/api/get-markets";
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set("page", page.toString());
    urlSearchParams.set("pageSize", "6");

    if (searchParams?.sortBy) {
      urlSearchParams.set("sortBy", searchParams?.sortBy);
    }
    if (searchParams?.sortDirection) {
      urlSearchParams.set("sortDirection", searchParams?.sortDirection);
    }
    if (searchParams?.searchTerm) {
      urlSearchParams.set("searchTerm", searchParams?.searchTerm);
    }
    if (searchParams?.filter) {
      urlSearchParams.set("filter", searchParams.filter);
      if (searchParams.filter === "favorites") {
        urlSearchParams.set("addresses", searchParams.addresses as unknown as string);
        setHasMore(false);
      }
    }
    return `${baseUrl}?${urlSearchParams.toString()}`;
  }, [
    page,
    searchParams?.addresses,
    searchParams?.searchTerm,
    searchParams?.sortBy,
    searchParams?.sortDirection,
    searchParams?.filter,
  ]);

  const fetchMarkets = useCallback(async () => {
    const result = await axios.get<Market[]>(getUrl());

    if (result.data.length === 0) {
      setHasMore(false);
    } else {
      setMarkets((prevMarkets) => {
        const existingIds = new Set(prevMarkets.map((m) => m.address));
        const newMarkets = result.data.filter((m) => !existingIds.has(m.address));
        return [...prevMarkets, ...newMarkets];
      });
      setPage((prevPage) => prevPage + 1);
    }
  }, [getUrl]);

  const { loadMoreRef } = useInfiniteScroll(fetchMarkets, hasMore);

  if (!hasMore && markets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No markets found</h3>
        <p className="text-gray-400 mb-6">
          {searchParams?.searchTerm
            ? "Try adjusting your search terms"
            : "Try adjusting your filters or create a new market."}
        </p>
        <Link
          href="/markets/create"
          className="inline-flex items-center px-6 py-3 bg-sei-400 text-dark-950 rounded-full font-semibold text-sm hover:bg-sei-300 transition-colors shadow-lg shadow-sei-400/20"
        >
          Create Market
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-10">
      {markets.map((market, index) => (
        <MarketCard key={market.address} market={market} index={index} />
      ))}
      {hasMore && <MarketsGridSkeleton ref={loadMoreRef} />}
    </div>
  );
};
