import { getOpenMeteoWeather } from "./providers/open-meteo";
import { getDestinationNewsConditions, getWikimediaAttention } from "./providers/open-data";
import type { DemandSignal, IntelligenceRequest, IntelligenceResponse } from "./types";
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
  return Math.ceil((new Date(date + "T00:00:00Z").getTime() - todayUtc) / 86_400_000);
}
function unavailableSignal(source: string, evidence: string[]): DemandSignal {
  return { value: null, direction: "stable", confidence: "low", source, evidence };
}

export async function buildIntelligence(request: IntelligenceRequest): Promise<IntelligenceResponse> {
  const [attention, news, weather] = await Promise.all([
    getWikimediaAttention(request).catch((error) => {
      console.error("Wikimedia attention provider failed", error);
      return { hype: null, signal: unavailableSignal("Wikimedia pageviews", ["Public page-view data is temporarily unavailable."]) };
    }),
    getDestinationNewsConditions(request.destination).catch((error) => {
      console.error("Destination news provider failed", error);
      return { conditions: null, signal: unavailableSignal("GDELT public news search", ["Public news scan is temporarily unavailable."]) };
    }),
    getOpenMeteoWeather(request).catch((error) => {
      console.error("Open-Meteo weather provider failed", error);
      return null;
    }),
  ]);

  const horizonDays = request.mode === "date" ? daysFromToday(request.startDate) : null;
  const available = request.mode === "current" || (horizonDays !== null && horizonDays >= 1 && horizonDays <= MAX_PREDICTION_DAYS);
  const base = {
    destination: { name: request.destination, region: regionFor(request.destination) },
    mode: request.mode,
    dates: { start: request.startDate ?? null, end: request.endDate ?? null },
    // Missing providers remain explicitly unavailable. No synthetic values are substituted.
    signals: {
      searchDemand: attention.signal,
      hotelDemand: null,
      hotelPricePressure: null,
      flightDemand: null,
      socialInterest: null,
    },
  };

  if (!available) {
    return {
      ...base,
      prediction: {
        available: false, horizonDays, confidence: null,
        message: "Nice try. We're an intelligence engine, not a crystal ball. Reliable date-specific predictions are only available within our current prediction window.",
      },
      hype: null, crowd: null, expense: null, weather,
      conditions: news.conditions, alternatives: [], betterDates: [],
    };
  }

  return {
    ...base,
    prediction: {
      available: true, horizonDays, confidence: attention.hype ? "low" : null,
      message: attention.signal.value !== null && request.mode === "date" && (horizonDays ?? 0) > 7
        ? "Public-attention history is available, but we do not project it more than 7 days ahead. Weather is shown only where forecast coverage exists; crowd and expense need booking and comparable price observations."
        : attention.hype
          ? "Hype uses a limited public-attention proxy. Crowd and expense remain unavailable until defensible booking and price observations are connected."
          : "Live weather and a public news scan are available where providers respond. Demand, crowd and expense need additional evidence.",
    },
    hype: attention.hype,
    crowd: null,
    expense: {
      changePercent: null,
      label: "Insufficient price data",
      confidence: "low",
      reason: "We do not yet have comparable observations for the same property, room, occupancy and stay length. No percentage is fabricated.",
    },
    weather, conditions: news.conditions, alternatives: [], betterDates: [],
  };
}
