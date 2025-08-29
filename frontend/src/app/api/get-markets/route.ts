import { getMarkets } from "@/lib/api";
import { Market } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse<Market[]>> {
  const url = new URL(req.url);
  const paramsObj = Array.from(url.searchParams?.keys() || []).reduce(
    (acc, val) => ({ ...acc, [val]: url.searchParams.get(val) }),
    {},
  );

  const addresses = url.searchParams?.get("addresses") || null;

  const uniqueAddresses =
    typeof addresses === "string"
      ? Array.from(
          new Set(
            typeof addresses === "string"
              ? addresses
                  .split(",")
                  .map((a) => a.trim().toLocaleLowerCase())
                  .filter(Boolean)
              : null,
          ),
        )
      : null;

  let markets: Market[] = [];

  try {
    markets = await getMarkets({ ...paramsObj, addresses: uniqueAddresses });
    return NextResponse.json<Market[]>(markets);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return NextResponse.json<Market[]>(markets, { status: 400 });
  }
}
