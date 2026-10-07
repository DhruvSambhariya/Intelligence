import type {
  Confidence,
  IntelligenceRequest,
  IntelligenceResponse,
} from "./types";
import { getMockSignals } from "./mock-signals";

const DESTINATION_REGIONS: Record<string, string> = {
  manali: "Himachal Pradesh",
  jibhi: "Himachal Pradesh",
  rishikesh: "Uttarakhand",
  naggar: "Himachal Pradesh",
  "tirthan valley": "Himachal Pradesh",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function averageConfidence(values: Confidence[]): Confidence {
  const score = values.reduce((sum, value) => sum + ({ high: 3, moderate: 2, low: 1 }[value] ?? 1), 0) / values.length;
  if (score >= 2.5) return "high";
  if (score >= 1.6) return "moderate";
  return "low";
}

function hypeLabel(score: number) {
  if (score < 20) return "Shhh... almost nobody's talking about it.";
  if (score < 40) return "A little off the radar.";
  if (score < 60) return "Pretty normal interest.";
  if (score < 75) return "People are starting to notice.";
  if (score < 90) return "It's having a moment.";
  return "Everybody suddenly wants to go.";
}

function crowdLabel(value: number) {
  if (value < 15) return ["very_low", "You practically own the place 😎"] as const;
  if (value < 30) return ["low", "Peaceful"] as const;
  if (value < 45) return ["less_crowded", "Less crowded"] as const;
  if (value < 60) return ["normal", "Normal"] as const;
  if (value < 70) return ["manageable", "Manageable"] as const;
  if (value < 85) return ["quite_busy", "Quite busy"] as const;
  return ["very_high", "Too much crowd"] as const;
}

function dateHorizon(startDate?: string) {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function buildIntelligence(request: IntelligenceRequest): IntelligenceResponse {
  const name = request.destination.trim();
  const region = DESTINATION_REGIONS[name.toLowerCase()] ?? "Destination";
  const signals = getMockSignals();

  const confidence = averageConfidence([
    signals.searchDemand.confidence,
    signals.hotelDemand.confidence,
    signals.hotelPricePressure.confidence,
    signals.flightDemand.confidence,
    signals.socialInterest.confidence,
  ]);

  const currentHype = 78;
  const momentum = Math.round(
    signals.searchDemand.value * 0.25 +
    signals.hotelDemand.value * 0.25 +
    signals.socialInterest.value * 0.3 +
    signals.flightDemand.value * 0.2
  ) - 35;

  const horizonDays = request.mode === "date" ? dateHorizon(request.startDate) : null;
  const predictionAvailable =
    request.mode === "current" ||
    (horizonDays !== null && horizonDays >= 0 && horizonDays <= 30);

  const projected = predictionAvailable
    ? clamp(currentHype + momentum * 0.35, 0, 100)
    : null;

  const crowdPressure = clamp(
    48 +
    signals.searchDemand.value * 0.22 +
    signals.hotelDemand.value * 0.28 +
    Math.max(momentum, 0) * 0.25,
    0,
    100
  );

  const [crowdLevel, crowdLabelText] = crowdLabel(crowdPressure);

  const futureMessage = request.mode === "date" && !predictionAvailable
    ? "Nice try. We're an intelligence engine, not a crystal ball. Reliable date-specific predictions are only available within our current prediction window."
    : undefined;

  return {
    destination: { name, region },
    mode: request.mode,
    dates: {
      start: request.mode === "date" ? request.startDate ?? null : null,
      end: request.mode === "date" ? request.endDate ?? null : null,
    },
    prediction: {
      available: predictionAvailable,
      horizonDays,
      confidence: predictionAvailable ? confidence : null,
      message: futureMessage,
    },
    hype: predictionAvailable ? {
      current: currentHype,
      momentum,
      projected,
      label: hypeLabel(projected ?? currentHype),
      confidence,
    } : null,
    crowd: {
      level: crowdLevel,
      label: crowdLabelText,
      confidence,
      reason: "Search demand, accommodation activity, social attention and momentum are currently pointing toward higher visitor pressure.",
    },
    expense: predictionAvailable ? {
      changePercent: signals.hotelPricePressure.value,
      label: signals.hotelPricePressure.value > 0 ? "Above normal" : "Below normal",
      confidence: signals.hotelPricePressure.confidence,
      reason: "Hotel price pressure is being treated as one demand signal rather than as a standalone prediction.",
    } : null,
    weather: predictionAvailable ? {
      summary: "Mock forecast — comfortable window",
      confidence: "moderate",
      temperature: { minC: 18, maxC: 25 },
    } : null,
    conditions: predictionAvailable ? {
      status: "watch",
      label: "Watch",
      confidence: "moderate",
      reason: "Mock condition signal. Real advisories and destination-level disruptions will be connected later.",
    } : null,
    alternatives: predictionAvailable ? [
      { name: "Naggar", region: "Himachal Pradesh", reason: "Lower crowd and price pressure for the same travel window." },
      { name: "Jibhi", region: "Himachal Pradesh", reason: "Quieter demand profile with a similar mountain escape." },
      { name: "Tirthan Valley", region: "Himachal Pradesh", reason: "Lower demand pressure while keeping the mountain experience." },
    ] : [],
    betterDates: predictionAvailable ? [
      { name: "17 — 19 Oct", region, reason: "Lower projected crowd pressure." },
      { name: "24 — 26 Oct", region, reason: "Lower demand with similar weather conditions." },
    ] : [],
    signals,
  };
}