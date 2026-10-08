import { mockProvider } from "./providers/mock";
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

export async function buildIntelligence(
  request: IntelligenceRequest
): Promise<IntelligenceResponse> {
  const snapshot = await mockProvider.collect(request);
  const predictions = calculatePredictions(snapshot);
  const horizonDays = request.mode === "date" ? daysFromToday(request.startDate) : null;
  const available =
    request.mode === "current" ||
    (horizonDays !== null && horizonDays >= 1 && horizonDays <= MAX_PREDICTION_DAYS);

  if (!available) {
    return {
      destination: { name: request.destination, region: regionFor(request.destination) },
      mode: request.mode,
      dates: {
        start: request.startDate ?? null,
        end: request.endDate ?? null,
      },
      prediction: {
        available: false,
        horizonDays,
        confidence: null,
        message:
          "Nice try. We're an intelligence engine, not a crystal ball. Reliable date-specific predictions are only available within our current prediction window.",
      },
      hype: null,
      crowd: null,
      expense: null,
      weather: null,
      conditions: null,
      alternatives: [],
      betterDates: [],
      signals: {
        searchDemand: {
          value: snapshot.search.score,
          direction: snapshot.search.direction,
          confidence: snapshot.search.confidence,
          source: snapshot.search.source,
          evidence: snapshot.search.evidence,
        },
        hotelDemand: {
          value: snapshot.hotel.score,
          direction: snapshot.hotel.direction,
          confidence: snapshot.hotel.confidence,
          source: snapshot.hotel.source,
          evidence: snapshot.hotel.evidence,
        },
        hotelPricePressure: {
          value: predictions.expense.changePercent ?? 0,
          direction: (predictions.expense.changePercent ?? 0) > 0 ? "up" : "stable",
          confidence: predictions.expense.confidence,
          source: "hotel_price_baseline",
          evidence: [predictions.expense.reason],
        },
        flightDemand: {
          value: snapshot.flight.score,
          direction: snapshot.flight.direction,
          confidence: snapshot.flight.confidence,
          source: snapshot.flight.source,
          evidence: snapshot.flight.evidence,
        },
        socialInterest: {
          value: snapshot.social.score,
          direction: snapshot.social.direction,
          confidence: snapshot.social.confidence,
          source: snapshot.social.source,
          evidence: snapshot.social.evidence,
        },
      },
    };
  }

  return {
    destination: { name: request.destination, region: regionFor(request.destination) },
    mode: request.mode,
    dates: {
      start: request.startDate ?? null,
      end: request.endDate ?? null,
    },
    prediction: {
      available: true,
      horizonDays,
      confidence: predictions.confidence,
    },
    hype: predictions.hype,
    crowd: predictions.crowd,
    expense: predictions.expense,
    weather: null,
    conditions: null,
    alternatives: [],
    betterDates: [],
    signals: {
      searchDemand: {
        value: snapshot.search.score,
        direction: snapshot.search.direction,
        confidence: snapshot.search.confidence,
        source: snapshot.search.source,
        evidence: snapshot.search.evidence,
      },
      hotelDemand: {
        value: snapshot.hotel.score,
        direction: snapshot.hotel.direction,
        confidence: snapshot.hotel.confidence,
        source: snapshot.hotel.source,
        evidence: snapshot.hotel.evidence,
      },
      hotelPricePressure: {
        value: predictions.expense.changePercent ?? 0,
        direction: (predictions.expense.changePercent ?? 0) > 0 ? "up" : "stable",
        confidence: predictions.expense.confidence,
        source: "hotel_price_baseline",
        evidence: [predictions.expense.reason],
      },
      flightDemand: {
        value: snapshot.flight.score,
        direction: snapshot.flight.direction,
        confidence: snapshot.flight.confidence,
        source: snapshot.flight.source,
        evidence: snapshot.flight.evidence,
      },
      socialInterest: {
        value: snapshot.social.score,
        direction: snapshot.social.direction,
        confidence: snapshot.social.confidence,
        source: snapshot.social.source,
        evidence: snapshot.social.evidence,
      },
    },
  };
}
