export type IntelligenceMode = "current" | "date";

export type Confidence = "high" | "moderate" | "low";

export type DemandSignal = {
  value: number;
  direction: "up" | "down" | "stable";
  confidence: Confidence;
  source: string;
  evidence?: string[];
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
  projected: number;
  label: string;
  confidence: Confidence;
};

export type CrowdLevel = "very_low" | "low" | "less_crowded" | "normal" | "manageable" | "quite_busy" | "very_high";

export type CrowdIntelligence = {
  level: CrowdLevel;
  label: string;
  confidence: Confidence;
  reason: string;
};

export type ExpenseIntelligence = {
  changePercent: number | null;
  label: string;
  confidence: Confidence;
  reason: string;
};

export type WeatherDay = {
  date: string;
  summary: string;
  temperature: { minC: number; maxC: number };
  precipitationProbability: number | null;
  precipitationMm: number | null;
  windMaxKmh: number | null;
};

export type WeatherIntelligence = {
  summary: string;
  confidence: Confidence;
  source: string;
  forecastDaysAvailable: number;
  temperature?: { minC: number; maxC: number };
  precipitationProbability?: number | null;
  precipitationMm?: number | null;
  windMaxKmh?: number | null;
  days?: WeatherDay[];
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
  destination: { name: string; region: string };
  mode: IntelligenceMode;
  dates: { start: string | null; end: string | null };
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