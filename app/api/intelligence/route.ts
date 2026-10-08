import { NextRequest, NextResponse } from "next/server";
import { buildIntelligence } from "@/lib/intelligence/engine";
import { validateIntelligenceRequest } from "@/lib/intelligence/validation";
import type { IntelligenceMode } from "@/lib/intelligence/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const destination = params.get("destination")?.trim() ?? "";
  const mode = params.get("mode") ?? "current";

  if (mode !== "current" && mode !== "date") {
    return NextResponse.json({ error: "mode must be current or date" }, { status: 400 });
  }

  const validation = validateIntelligenceRequest({
    destination,
    mode: mode as IntelligenceMode,
    startDate: params.get("startDate") ?? undefined,
    endDate: params.get("endDate") ?? undefined,
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const intelligence = await buildIntelligence(validation.request);
    return NextResponse.json(intelligence);
  } catch (error) {
    console.error("Intelligence request failed", error);
    return NextResponse.json(
      { error: "Unable to build destination intelligence" },
      { status: 500 }
    );
  }
}
