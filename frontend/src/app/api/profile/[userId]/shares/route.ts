import { NextRequest, NextResponse } from "next/server";
import { getUserShares } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const shares = await getUserShares(userId);

    return NextResponse.json(shares);
  } catch (error) {
    console.error("Error fetching user shares:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
