import type { IntelligenceMode } from "./types";

export type SignalDirection = "up" | "down" | "stable";
export type SignalSource = "search" | "hotel" | "flight" | "social" | "event";

export type DemandSignal = {
  score: number;
  direction: SignalDirection;
  confidence: "high" | "moderate" | "low";
  source: SignalSource;
  evidence: string[];
};

export type HotelPriceObservation = {
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  selectedPrice: number;
  normalPrice: number;
  currency: string;
  comparable: boolean;
};

export type SignalSnapshot = {
  destination: string;
  mode: IntelligenceMode;
  search: DemandSignal;
  hotel: DemandSignal;
  flight: DemandSignal;
  social: DemandSignal;
  events: DemandSignal;
  hotelPrices: HotelPriceObservation[];
  collectedAt: string;
};
