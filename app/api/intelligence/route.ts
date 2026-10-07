import { NextRequest, NextResponse } from "next/server";
import { buildIntelligence } from "@/lib/intelligence/engine";
import type { IntelligenceMode } from "@/lib/intelligence/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const destination = params.get("destination")?.trim();
  const mode = (params.get("mode") ?? "current") as IntelligenceMode;
  const startDate = params.get("startDate") ?? undefined;
  const endDate = params.get("endDate") ?? undefined;

  if (!destination) {
    return NextResponse.json(
      { error: "destination is required" },
      { status: 400 }
    );
  }

  if (mode !== "current" && mode !== "date") {
    return NextResponse.json(
      { error: "mode must be current or date" },
      { status: 400 }
    );
  }

  if (mode === "date" && !startDate) {
    return NextResponse.json(
      { error: "startDate is required when mode=date" },
      { status: 400 }
    );
  }

  if (mode === "date" && endDate && new Date(endDate) < new Date(startDate!)) {
    return NextResponse.json(
      { error: "endDate cannot be before startDate" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    buildIntelligence({
      destination,
      mode,
      startDate,
      endDate,
    })
  );
}