import type { IntelligenceRequest } from "../types";
import type { IntelligenceProvider } from "../providers";
import type { DemandSignal, SignalSnapshot } from "../signals";

function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

function signal(
  source: DemandSignal["source"],
  base: number,
  seed: number,
  label: string
): DemandSignal {
  const score = Math.max(0, Math.min(100, base + (seed % 17) - 8));
  return {
    score,
    direction: score >= 58 ? "up" : score <= 42 ? "down" : "stable",
    confidence: source === "hotel" ? "moderate" : "low",
    source,
    evidence: [label],
  };
}

export const mockProvider: IntelligenceProvider = {
  async collect(request) {
    const seed = hash(
      request.destination.toLowerCase() +
      "|" +
      (request.startDate ?? "current") +
      "|" +
      (request.endDate ?? "")
    );

    const hotelNormal = 5000 + (seed % 5) * 500;
    const selectedPrice = Math.round(hotelNormal * (1 + ((seed % 35) - 5) / 100));

    return {
      destination: request.destination,
      mode: request.mode,
      search: signal("search", 55, seed, "Mock search-interest movement"),
      hotel: signal("hotel", 62, seed >>> 3, "Mock hotel demand movement"),
      flight: signal("flight", 48, seed >>> 5, "Mock flight-demand movement"),
      social: signal("social", 58, seed >>> 7, "Mock social/Reels movement"),
      events: signal("event", 35, seed >>> 9, "Mock event pressure"),
      hotelPrices: [{
        hotelId: "mock-hotel-1",
        hotelName: "Comparable Hotel",
        roomId: "mock-room-1",
        roomName: "Standard Double",
        selectedPrice,
        normalPrice: hotelNormal,
        currency: "INR",
        comparable: true,
      }],
      collectedAt: new Date().toISOString(),
    };
  },
};
