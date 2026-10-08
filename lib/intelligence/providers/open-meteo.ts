import type { IntelligenceRequest } from "../types";
import type { WeatherIntelligence } from "../types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeoResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

type ForecastResponse = {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    wind_speed_10m_max?: number[];
  };
};

function weatherCodeLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 55) return "Drizzle";
  if (code <= 57) return "Freezing drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

async function geocode(destination: string): Promise<GeoResult | null> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", destination);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) return null;

  const body = (await response.json()) as { results?: GeoResult[] };
  return body.results?.[0] ?? null;
}

export async function getOpenMeteoWeather(request: IntelligenceRequest): Promise<WeatherIntelligence | null> {
  const location = await geocode(request.destination);
  if (!location) return null;

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "16");

  if (request.mode === "current") {
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
    );
  }

  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max"
  );

  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) return null;

  const body = (await response.json()) as ForecastResponse;
  const daily = body.daily;

  if (!daily?.time?.length) return null;

  const days = daily.time.map((date, index) => ({
    date,
    summary: weatherCodeLabel(daily.weather_code[index]),
    temperature: {
      minC: Math.round(daily.temperature_2m_min[index]),
      maxC: Math.round(daily.temperature_2m_max[index]),
    },
    precipitationProbability: daily.precipitation_probability_max?.[index] ?? null,
    precipitationMm: daily.precipitation_sum?.[index] ?? null,
    windMaxKmh: daily.wind_speed_10m_max?.[index] ?? null,
  }));

  if (request.mode === "current") {
    const current = body.current;
    if (!current) return null;

    return {
      summary: `${weatherCodeLabel(current.weather_code)} · ${Math.round(current.temperature_2m)}°C · wind ${Math.round(current.wind_speed_10m)} km/h`,
      confidence: "high",
      source: "Open-Meteo",
      forecastDaysAvailable: days.length,
      temperature: {
        minC: Math.round(current.temperature_2m),
        maxC: Math.round(current.temperature_2m),
      },
      precipitationProbability: null,
      precipitationMm: current.precipitation,
      windMaxKmh: Math.round(current.wind_speed_10m),
      days,
    };
  }

  const start = request.startDate!;
  const end = request.endDate!;
  const selected = days.filter((day) => day.date >= start && day.date <= end);

  if (!selected.length) {
    return {
      summary: "Forecast not available yet for these dates.",
      confidence: "low",
      source: "Open-Meteo",
      forecastDaysAvailable: days.length,
      days,
    };
  }

  const minC = Math.min(...selected.map((day) => day.temperature.minC));
  const maxC = Math.max(...selected.map((day) => day.temperature.maxC));
  const rainProbability = Math.max(
    ...selected.map((day) => day.precipitationProbability ?? 0)
  );
  const precipitation = selected.reduce(
    (sum, day) => sum + (day.precipitationMm ?? 0),
    0
  );

  return {
    summary: `${selected[0].summary} · ${minC}°—${maxC}°C · rain risk up to ${rainProbability}%`,
    confidence: selected[0].date === start && selected[selected.length - 1].date === end ? "high" : "moderate",
    source: "Open-Meteo",
    forecastDaysAvailable: days.length,
    temperature: { minC, maxC },
    precipitationProbability: rainProbability,
    precipitationMm: Math.round(precipitation * 10) / 10,
    windMaxKmh: Math.round(Math.max(...selected.map((day) => day.windMaxKmh ?? 0))),
    days: selected,
  };
}
