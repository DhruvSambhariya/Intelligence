import type { IntelligenceRequest, HypeIntelligence, ConditionsIntelligence } from "../types";

type PageViewItem = { timestamp: string; views: number };
type PageViewResponse = { items?: PageViewItem[] };
type SearchResponse = { query?: { search?: Array<{ title: string }> } };
type GdeltArticle = { title?: string; url?: string; seendate?: string; domain?: string };
type GdeltResponse = { articles?: GdeltArticle[] };

const WIKIMEDIA = "https://wikimedia.org/api/rest_v1";
const USER_AGENT = "SyncAndExploreDestinationIntelligence/0.1 (open-data research prototype)";

function compactDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function hypeLabel(score: number) {
  if (score < 25) return "Cooling off";
  if (score < 45) return "Quiet";
  if (score < 60) return "Steady";
  if (score < 75) return "Picking up";
  if (score < 90) return "Heating up";
  return "Spiking";
}

async function wikipediaTitle(destination: string): Promise<string | null> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", destination + " India destination");
  url.searchParams.set("srlimit", "5");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 86400 } });
  if (!response.ok) return null;
  const body = (await response.json()) as SearchResponse;
  const results = body.query?.search ?? [];
  const exact = results.find((item) => item.title.toLowerCase() === destination.toLowerCase());
  return (exact ?? results[0])?.title ?? null;
}

export async function getWikimediaAttention(request: IntelligenceRequest): Promise<{
  hype: HypeIntelligence | null;
  signal: { value: number | null; direction: "up" | "down" | "stable"; confidence: "low"; source: string; evidence: string[] };
}> {
  const empty = {
    hype: null,
    signal: {
      value: null,
      direction: "stable" as const,
      confidence: "low" as const,
      source: "Wikimedia pageviews",
      evidence: ["No usable public page-view history was found for this destination."],
    },
  };
  try {
    const title = await wikipediaTitle(request.destination);
    if (!title) return empty;
    // Wikimedia pageviews can lag, so exclude the most recent two days.
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 2);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 34);
    const article = encodeURIComponent(title.replaceAll(" ", "_"));
    const url = `${WIKIMEDIA}/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${article}/daily/${compactDate(start)}00/${compactDate(end)}00`;
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 21600 } });
    if (!response.ok) return empty;
    const body = (await response.json()) as PageViewResponse;
    const views = (body.items ?? []).filter((item) => Number.isFinite(item.views)).map((item) => item.views);
    if (views.length < 14) return empty;
    const recent = views.slice(-7);
    const previous = views.slice(-14, -7);
    const recentAverage = recent.reduce((sum, value) => sum + value, 0) / recent.length;
    const previousAverage = previous.reduce((sum, value) => sum + value, 0) / previous.length;
    if (previousAverage <= 0) return empty;
    const changePercent = Math.round(((recentAverage - previousAverage) / previousAverage) * 100);
    // Relative attention index only; not a visitor count or calibrated popularity score.
    const current = Math.round(clamp(50 + changePercent * 0.45, 0, 100));
    const momentum = Math.round(clamp(changePercent, -100, 100));
    const daysAhead = request.mode === "date" && request.startDate
      ? Math.max(1, Math.ceil((new Date(request.startDate + "T00:00:00Z").getTime() - Date.now()) / 86400000))
      : 1;
    const projected = daysAhead <= 7
      ? Math.round(clamp(current + momentum * daysAhead * 0.035, 0, 100))
      : null;
    const direction = changePercent >= 8 ? "up" : changePercent <= -8 ? "down" : "stable";
    return {
      hype: projected === null ? null : { current, momentum, projected, label: hypeLabel(current), confidence: "low" },
      signal: {
        value: current, direction, confidence: "low", source: "Wikimedia pageviews",
        evidence: [
          `Wikipedia article: “${title}”.`,
          `Recent 7-day average pageviews changed ${changePercent >= 0 ? "up" : "down"} ${Math.abs(changePercent)}% versus the preceding 7 days.`,
          "Page views are a limited public-attention proxy; they are not searches, bookings or visitor counts.",\n          ...(projected === null ? ["No date-specific attention projection is shown more than 7 days ahead because this simple trend is not a validated long-range forecast."] : []),
        ],
      },
    };
  } catch {
    return empty;
  }
}

const HAZARD_TERMS = /landslide|flood|flash flood|avalanche|earthquake|wildfire|forest fire|heavy rain|extreme rain|weather warning|road.?closed|evacuat|disaster|air quality|pollution|storm|cloudburst/i;

export async function getDestinationNewsConditions(destination: string): Promise<{
  conditions: ConditionsIntelligence | null;
  signal: { value: number | null; direction: "up" | "down" | "stable"; confidence: "low"; source: string; evidence: string[] };
}> {
  const empty = {
    conditions: null,
    signal: {
      value: null, direction: "stable" as const, confidence: "low" as const,
      source: "GDELT public news search",
      evidence: ["No verifiable destination-condition signal was available from this scan."],
    },
  };
  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", `"${destination}" (landslide OR flood OR avalanche OR earthquake OR wildfire OR "heavy rain" OR cloudburst OR evacuation OR "weather warning" OR pollution OR storm)`);
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("format", "json");
    url.searchParams.set("maxrecords", "10");
    url.searchParams.set("timespan", "7d");
    url.searchParams.set("sort", "HybridRel");
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 1800 } });
    if (!response.ok) return empty;
    const body = (await response.json()) as GdeltResponse;
    const articles = (body.articles ?? [])
      .filter((article) => article.title && article.url && HAZARD_TERMS.test(article.title))
      .slice(0, 5);
    if (!articles.length) {
      return {
        ...empty,
        signal: { ...empty.signal, evidence: ["The recent news scan returned no matching headline. This does not establish that conditions are safe or clear."] },
      };
    }
    return {
      conditions: {
        status: "watch",
        label: "News mentions to review",
        confidence: "low",
        reason: `The public news scan surfaced ${articles.length} potentially relevant headline(s). These are unverified media mentions, not official advisories; check the linked sources before making travel decisions.`,
        source: "GDELT public news search",
        items: articles.map((article) => ({
          title: article.title!, url: article.url!, source: article.domain ?? "News source", date: article.seendate ?? null,
        })),
      },
      signal: {
        value: articles.length, direction: "up", confidence: "low", source: "GDELT public news search",
        evidence: articles.map((article) => article.title!),
      },
    };
  } catch {
    return empty;
  }
}
