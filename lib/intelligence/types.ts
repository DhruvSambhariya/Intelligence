export type IntelligenceMode = "current" | "date";

export type Confidence = "high" | "moderate" | "low";

export type DemandSignal = {
  value: number;
  direction: "up" | "down" | "stable";
  confidence: Confidence;
  source: string;
};

export type IntelligenceRequest = {
  destination: string;
  mode: IntelligenceMode;
  startDate?: string;
  endDate?: string;
};

export type HypeIntelligence = {
  current: number;
  momentum: number;
  projected: number | null;
  label: string;
  confidence: Confidence;
};

export type CrowdIntelligence = {
  level: "very_low" | "low" | "less_crowded" | "normal" | "manageable" | "quite_busy" | "very_high";
  label: string;
  confidence: Confidence;
  reason: string;
};

export type ExpenseIntelligence = {
  changePercent: number;
  label: string;
  confidence: Confidence;
  reason: string;
};

export type WeatherIntelligence = {
  summary: string;
  confidence: Confidence;
  temperature?: {
    minC: number;
    maxC: number;
  };
};

export type ConditionsIntelligence = {
  status: "clear" | "watch" | "caution" | "restricted";
  label: string;
  confidence: Confidence;
  reason: string;
};

export type Recommendation = {
  name: string;
  region: string;
  reason: string;
};

export type IntelligenceResponse = {
  destination: {
    name: string;
    region: string;
  };
  mode: IntelligenceMode;
  dates: {
    start: string | null;
    end: string | null;
  };
  prediction: {
    available: boolean;
    horizonDays: number | null;
    confidence: Confidence | null;
    message?: string;
  };
  hype: HypeIntelligence | null;
  crowd: CrowdIntelligence | null;
  expense: ExpenseIntelligence | null;
  weather: WeatherIntelligence | null;
  conditions: ConditionsIntelligence | null;
  alternatives: Recommendation[];
  betterDates: Recommendation[];
  signals: {
    searchDemand: DemandSignal;
    hotelDemand: DemandSignal;
    hotelPricePressure: DemandSignal;
    flightDemand: DemandSignal;
    socialInterest: DemandSignal;
  };
};