import type { IntelligenceRequest } from "./types";

export const MAX_PREDICTION_DAYS = 25;

function dateOnly(value: string) {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!match) return null;
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export type ValidationResult =
  | { ok: true; request: IntelligenceRequest }
  | { ok: false; error: string };

export function validateIntelligenceRequest(
  input: IntelligenceRequest
): ValidationResult {
  const destination = input.destination.trim();
  if (!destination) return { ok: false, error: "destination is required" };

  if (input.mode === "current") {
    return { ok: true, request: { destination, mode: "current" } };
  }

  if (!input.startDate || !input.endDate) {
    return { ok: false, error: "startDate and endDate are required when mode=date" };
  }

  const start = dateOnly(input.startDate);
  const end = dateOnly(input.endDate);
  if (!start || !end) {
    return { ok: false, error: "dates must use YYYY-MM-DD format" };
  }

  const today = todayUtc();
  if (start <= today) return { ok: false, error: "startDate must be after today" };
  if (end <= start) return { ok: false, error: "endDate must be after startDate" };
  return {
    ok: true,
    request: {
      destination,
      mode: "date",
      startDate: input.startDate,
      endDate: input.endDate,
    },
  };
}
