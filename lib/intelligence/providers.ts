import type { IntelligenceRequest } from "./types";
import type { SignalSnapshot } from "./signals";

export interface IntelligenceProvider {
  collect(request: IntelligenceRequest): Promise<SignalSnapshot>;
}

/*
 * Every real provider will implement the same contract.
 * The intelligence engine does not know whether a signal came from
 * Google, a hotel partner, Meta, a flight provider, or another source.
 */
export type ProviderRegistry = {
  demand: IntelligenceProvider;
};
