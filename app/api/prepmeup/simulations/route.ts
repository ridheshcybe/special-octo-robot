import { NextResponse, type NextRequest } from "next/server";
import { SIMULATIONS_REGISTRY } from "@/app/prepmeup/_lib/simulationsData";
import { loadPersistentState } from "@/lib/prepmeup/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    const state = loadPersistentState();
    const customSims = Array.isArray(state.simulations) ? state.simulations : [];

    if (slug) {
      // 1. Check custom simulations from persistent storage first
      const foundCustom = customSims.find((s: any) => s.slug === slug);
      if (foundCustom) {
        return NextResponse.json({ ok: true, simulation: foundCustom, isCustom: true });
      }

      // 2. Check static simulations registry
      const foundPreset = SIMULATIONS_REGISTRY[slug];
      if (foundPreset) {
        return NextResponse.json({ ok: true, simulation: foundPreset, isCustom: false });
      }

      return NextResponse.json({ ok: false, error: `Simulation "${slug}" not found.` }, { status: 404 });
    }

    // Return combined catalogue
    const presetValues = Object.values(SIMULATIONS_REGISTRY);
    const customMap = new Map(customSims.map((s: any) => [s.slug, s]));

    // Custom overrides or appends to preset
    const mergedList = [
      ...customSims.map((s: any) => ({ ...s, isCustom: true })),
      ...presetValues
        .filter((p) => !customMap.has(p.slug))
        .map((p) => ({ ...p, isCustom: false })),
    ];

    return NextResponse.json({
      ok: true,
      totalCount: mergedList.length,
      simulations: mergedList,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
