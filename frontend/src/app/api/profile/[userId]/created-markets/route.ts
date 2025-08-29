import { NextRequest, NextResponse } from "next/server";
import { getUserCreatedMarkets } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const markets = await getUserCreatedMarkets(userId);

    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching user created markets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
