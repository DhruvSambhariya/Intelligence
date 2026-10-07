import type { DemandSignal } from "./types";

export type MockSignalSet = {
  searchDemand: DemandSignal;
  hotelDemand: DemandSignal;
  hotelPricePressure: DemandSignal;
  flightDemand: DemandSignal;
  socialInterest: DemandSignal;
};

export function getMockSignals(): MockSignalSet {
  return {
    searchDemand: {
      value: 38,
      direction: "up",
      confidence: "moderate",
      source: "mock_search",
    },
    hotelDemand: {
      value: 51,
      direction: "up",
      confidence: "moderate",
      source: "mock_hotels",
    },
    hotelPricePressure: {
      value: 27,
      direction: "up",
      confidence: "high",
      source: "mock_hotels",
    },
    flightDemand: {
      value: 31,
      direction: "up",
      confidence: "low",
      source: "mock_flights",
    },
    socialInterest: {
      value: 44,
      direction: "up",
      confidence: "moderate",
      source: "mock_social",
    },
  };
}