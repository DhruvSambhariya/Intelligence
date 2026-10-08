import type { HypeIntelligence, CrowdIntelligence, ExpenseIntelligence } from "./types";
import type { SignalSnapshot } from "./signals";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function confidence(snapshot: SignalSnapshot) {
  const values = [
    snapshot.search.confidence,
    snapshot.hotel.confidence,
    snapshot.flight.confidence,
    snapshot.social.confidence,
    snapshot.events.confidence,
  ];
  const score = values.reduce((sum, value) => sum + ({ high: 3, moderate: 2, low: 1 }[value] ?? 1), 0) / values.length;
  return score >= 2.5 ? "high" : score >= 1.6 ? "moderate" : "low";
}

function labelForHype(score: number) {
  if (score < 20) return "Very low";
  if (score < 40) return "Low";
  if (score < 60) return "Normal";
  if (score < 75) return "High";
  if (score < 90) return "Very high";
  return "Extremely high";
}

function labelForCrowd(score: number) {
  if (score < 15) return "You practically own the place";
  if (score < 30) return "Peaceful";
  if (score < 45) return "Less crowded";
  if (score < 60) return "Normal";
  if (score < 70) return "Manageable";
  if (score < 85) return "Quite busy";
  return "Too much crowd";
}

export function calculatePredictions(snapshot: SignalSnapshot) {
  const demandSignals = [
    snapshot.search.score,
    snapshot.hotel.score,
    snapshot.flight.score,
    snapshot.social.score,
    snapshot.events.score,
  ];

  const currentHype = Math.round(
    snapshot.search.score * 0.25 +
    snapshot.hotel.score * 0.30 +
    snapshot.social.score * 0.25 +
    snapshot.flight.score * 0.15 +
    snapshot.events.score * 0.05
  );

  const momentum = Math.round(
    ((snapshot.search.score - 50) * 0.30) +
    ((snapshot.hotel.score - 50) * 0.30) +
    ((snapshot.social.score - 50) * 0.25) +
    ((snapshot.flight.score - 50) * 0.15)
  );

  const projectedHype = clamp(currentHype + momentum * 0.45);

  const crowdScore = clamp(
    snapshot.hotel.score * 0.35 +
    snapshot.search.score * 0.20 +
    snapshot.flight.score * 0.15 +
    snapshot.social.score * 0.15 +
    currentHype * 0.10 +
    snapshot.events.score * 0.05
  );

  const comparablePrices = snapshot.hotelPrices.filter((item) => item.comparable && item.normalPrice > 0);
  const expensePercent = comparablePrices.length
    ? Math.round(
        comparablePrices.reduce(
          (sum, item) => sum + ((item.selectedPrice - item.normalPrice) / item.normalPrice) * 100,
          0
        ) / comparablePrices.length
      )
    : null;

  const avgConfidence = confidence(snapshot);

  const hype: HypeIntelligence = {
    current: currentHype,
    momentum,
    projected: projectedHype,
    label: labelForHype(projectedHype),
    confidence: avgConfidence,
  };

  const crowd: CrowdIntelligence = {
    level: labelForCrowd(crowdScore),
    label: labelForCrowd(crowdScore),
    confidence: avgConfidence,
    reason: "Estimated from demand, accommodation, flight, social and event signals.",
  };

  const expense: ExpenseIntelligence = {
    changePercent: expensePercent ?? 0,
    label: expensePercent === null ? "Insufficient price data" : expensePercent > 0 ? "Above normal" : expensePercent < 0 ? "Below normal" : "Normal",
    confidence: expensePercent === null ? "low" : "moderate",
    reason: expensePercent === null
      ? "No comparable same-room baseline was available."
      : "Compared with the normal-demand price of the same hotel and room.",
  };

  return { hype, crowd, expense, confidence: avgConfidence, demandSignals };
}
