import { NextResponse } from "next/server";

import { getChartData } from "@/lib/api";
import { MarketHourlyData } from "@/lib/types";
import { isAddress } from "viem";

export async function GET(req: Request): Promise<NextResponse<MarketHourlyData[]>> {
  const url = new URL(req.url);
  const address = url.searchParams?.get("address") || "";
  const hours = parseInt(url.searchParams?.get("hours") || "0");

  let marketHourlyData: MarketHourlyData[] = [];

  if (!isAddress(address) || isNaN(hours) || hours <= 0) {
    return NextResponse.json<MarketHourlyData[]>(marketHourlyData);
  }

  try {
    marketHourlyData = await getChartData(address, hours);
    return NextResponse.json<MarketHourlyData[]>(marketHourlyData);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return NextResponse.json<MarketHourlyData[]>(marketHourlyData, { status: 400 });
  }
}
