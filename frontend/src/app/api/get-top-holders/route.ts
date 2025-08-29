import { NextResponse } from "next/server";

import { getTopHolders } from "@/lib/api";
import { TopHoldersResult } from "@/lib/types";
import { isAddress } from "viem";

export async function GET(req: Request): Promise<NextResponse<TopHoldersResult>> {
  const url = new URL(req.url);
  const address = url.searchParams?.get("address") || "";

  let topHoldersResult: TopHoldersResult = { outcome0: [], outcome1: [] };

  if (!isAddress(address)) {
    return NextResponse.json<TopHoldersResult>(topHoldersResult);
  }

  try {
    topHoldersResult = await getTopHolders(address);
    return NextResponse.json<TopHoldersResult>(topHoldersResult);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return NextResponse.json<TopHoldersResult>(topHoldersResult, { status: 400 });
  }
}
