import { NextResponse } from "next/server";
import {
  getAllAccessEarlyAdopterCount,
  getUnifiedProductBySlug,
} from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const product = getUnifiedProductBySlug("prepmeup-all-access-pass");
    const totalLimit = product?.earlyAdopterLimit || 10;
    const claimedCount = getAllAccessEarlyAdopterCount("prepmeup-all-access-pass");
    const remainingSeats = Math.max(0, totalLimit - claimedCount);

    return NextResponse.json({
      ok: true,
      productSlug: "prepmeup-all-access-pass",
      totalLimit,
      claimedCount,
      remainingSeats,
      isAvailable: remainingSeats > 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch early adopter stats." },
      { status: 500 }
    );
  }
}
