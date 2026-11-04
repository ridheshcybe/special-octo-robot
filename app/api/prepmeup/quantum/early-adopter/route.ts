import { NextResponse } from "next/server";
import { getEarlyAdopterCount } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const limit = Number(process.env.QUANTUM_EARLY_ADOPTER_LIMIT) || 10;
    const claimedCount = getEarlyAdopterCount("quantum-computing-foundations");
    const remainingSeats = Math.max(0, limit - claimedCount);

    return NextResponse.json({
      ok: true,
      totalLimit: limit,
      claimedCount,
      remainingSeats,
      isAvailable: remainingSeats > 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load early adopter count." },
      { status: 500 }
    );
  }
}
