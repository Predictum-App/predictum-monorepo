import { getFavoriteMarkets } from "@/lib/api";
import { Market } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse<Market[]>> {
  const url = new URL(req.url);
  const addresses = url.searchParams?.get("addresses") || "";

  let markets: Market[] = [];

  if (addresses.length === 0) {
    return NextResponse.json<Market[]>(markets);
  }

  const uniqueAddresses = Array.from(
    new Set(
      typeof addresses === "string"
        ? addresses
            .split(",")
            .map((a) => a.trim().toLocaleLowerCase())
            .filter(Boolean)
        : [],
    ),
  );

  try {
    markets = await getFavoriteMarkets(uniqueAddresses);
    return NextResponse.json<Market[]>(markets);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return NextResponse.json<Market[]>(markets, { status: 400 });
  }
}
