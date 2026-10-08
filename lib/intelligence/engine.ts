import { mockProvider } from "./providers/mock";
import { getOpenMeteoWeather } from "./providers/open-meteo";
import { calculatePredictions } from "./prediction";
import type { IntelligenceRequest, IntelligenceResponse } from "./types";
import { MAX_PREDICTION_DAYS } from "./validation";

const REGION_BY_DESTINATION: Record<string, string> = {
  manali: "Himachal Pradesh",
  jibhi: "Himachal Pradesh",
  naggar: "Himachal Pradesh",
  "tirthan valley": "Himachal Pradesh",
  rishikesh: "Uttarakhand",
};

function regionFor(destination: string) {
  return REGION_BY_DESTINATION[destination.toLowerCase()] ?? "Destination";
}

function daysFromToday(date?: string) {
  if (!date) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const target = new Date(date + "T00:00:00Z").getTime();
  return Math.ceil((target - todayUtc) / 86_400_000);
}

function signalResponse(snapshot: Awaited<ReturnType<typeof mockProvider.collect>>, expensePercent: number | null) {
  return {
    searchDemand: { value: snapshot.search.score, direction: snapshot.search.direction, confidence: snapshot.search.confidence, source: snapshot.search.source, evidence: snapshot.search.evidence },
    hotelDemand: { value: snapshot.hotel.score, direction: snapshot.hotel.direction, confidence: snapshot.hotel.confidence, source: snapshot.hotel.source, evidence: snapshot.hotel.evidence },
    hotelPricePressure: { value: expensePercent ?? 0, direction: (expensePercent ?? 0) > 0 ? "up" as const : (expensePercent ?? 0) < 0 ? "down" as const : "stable" as const, confidence: expensePercent === null ? "low" as const : "moderate" as const, source: "hotel_price_baseline", evidence: expensePercent === null ? ["No comparable same-room baseline was available."] : ["Compared with the normal-demand price of the same hotel and room."] },
    flightDemand: { value: snapshot.flight.score, direction: snapshot.flight.direction, confidence: snapshot.flight.confidence, source: snapshot.flight.source, evidence: snapshot.flight.evidence },
    socialInterest: { value: snapshot.social.score, direction: snapshot.social.direction, confidence: snapshot.social.confidence, source: snapshot.social.source, evidence: snapshot.social.evidence },
  };
}

export async function buildIntelligence(request: IntelligenceRequest): Promise<IntelligenceResponse> {
  const [snapshot, weather] = await Promise.all([
    mockProvider.collect(request),
    getOpenMeteoWeather(request).catch((error) => {
      console.error("Open-Meteo weather provider failed", error);
      return null;
    }),
  ]);
  const predictions = calculatePredictions(snapshot);
  const horizonDays = request.mode === "date" ? daysFromToday(request.startDate) : null;
  const available = request.mode === "current" || (horizonDays !== null && horizonDays >= 1 && horizonDays <= MAX_PREDICTION_DAYS);

  const base = {
    destination: { name: request.destination, region: regionFor(request.destination) },
    mode: request.mode,
    dates: { start: request.startDate ?? null, end: request.endDate ?? null },
    signals: signalResponse(snapshot, predictions.expense.changePercent),
  };

  if (!available) {
    return {
      ...base,
      prediction: {
        available: false,
        horizonDays,
        confidence: null,
        message: "Nice try. We're an intelligence engine, not a crystal ball. Reliable date-specific predictions are only available within our current prediction window.",
      },
      hype: null,
      crowd: null,
      expense: null,
      weather,
      conditions: null,
      alternatives: [],
      betterDates: [],
    };
  }

  return {
    ...base,
    prediction: { available: true, horizonDays, confidence: predictions.confidence },
    hype: predictions.hype,
    crowd: predictions.crowd,
    expense: predictions.expense,
    weather,
    conditions: null,
    alternatives: [],
    betterDates: [],
  };
}
