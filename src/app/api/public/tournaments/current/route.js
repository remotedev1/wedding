import { NextResponse } from "next/server";
import { getPublicTournamentSnapshot } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tournament = await getPublicTournamentSnapshot();
    return NextResponse.json(
      { success: true, data: tournament },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("Public tournament snapshot failed", error);
    return NextResponse.json(
      { success: false, error: "Tournament information is temporarily unavailable." },
      { status: 500 },
    );
  }
}
