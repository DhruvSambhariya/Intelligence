"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "current" | "date";

type Intelligence = {
  destination: { name: string; region: string };
  mode: Mode;
  dates: { start: string | null; end: string | null };
  prediction: { available: boolean; horizonDays: number | null; confidence: string | null; message?: string };
  hype: { current: number; momentum: number; projected: number | null; label: string; confidence: string } | null;
  crowd: { label: string; confidence: string; reason: string } | null;
  expense: { changePercent: number; label: string; confidence: string; reason: string } | null;
  weather: { summary: string; confidence: string; temperature?: { minC: number; maxC: number } } | null;
  conditions: { label: string; status: string; confidence: string; reason: string } | null;
  alternatives: { name: string; region: string; reason: string }[];
  betterDates: { name: string; region: string; reason: string }[];
};

type Signal = {
  id: string;
  index: string;
  label: string;
  value: string;
  note: string;
  detail: string;
};

const destinations = [
  { name: "Manali", region: "Himachal Pradesh", hint: "Mountain escape" },
  { name: "Jibhi", region: "Himachal Pradesh", hint: "Quiet valley" },
  { name: "Rishikesh", region: "Uttarakhand", hint: "River town" },
];

const signals: Signal[] = [
  {
    id: "crowd",
    index: "02",
    label: "Crowd",
    value: "Quite busy",
    note: "especially midday",
    detail: "Search demand, accommodation activity, seasonality and the selected dates point to higher visitor pressure than normal.",
  },
  {
    id: "expense",
    index: "03",
    label: "Expense",
    value: "+27%",
    note: "above normal",
    detail: "Comparable accommodation and travel demand are currently carrying higher price pressure for these dates.",
  },
  {
    id: "weather",
    index: "04",
    label: "Weather",
    value: "18°—25°",
    note: "comfortable window",
    detail: "The date view will expand into morning, afternoon, evening, rain risk, wind and forecast confidence.",
  },
  {
    id: "conditions",
    index: "05",
    label: "Conditions",
    value: "Watch",
    note: "check before leaving",
    detail: "Destination-level advisories, closures, hazards and disruptions — not route traffic.",
  },
];

export default function Home() {
  const [destination, setDestination] = useState(destinations[0]);
  const [startDate, setStartDate] = useState("2026-10-10");
  const [endDate, setEndDate] = useState("2026-10-12");
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("current");
  const [dark, setDark] = useState(false);
  const [request, setRequest] = useState({ destination: "Manali", mode: "current" as Mode, startDate: "2026-10-10", endDate: "2026-10-12" });

  const formatDate = (value: string) => {
    const parts = value.split("-");
    if (parts.length !== 3) return "Select date";
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return parts[2] + " " + (months[Number(parts[1]) - 1] ?? "");
  };
  const dates = startDate && endDate ? formatDate(startDate) + " — " + formatDate(endDate) : "Select dates";

  useEffect(() => {
    const controller = new AbortController();

    async function loadIntelligence() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        destination: request.destination,
        mode: request.mode,
      });
      if (request.mode === "date") {
        params.set("startDate", request.startDate);
        params.set("endDate", request.endDate);
      }

      try {
        const response = await fetch("/api/intelligence?" + params.toString(), { signal: controller.signal });
        if (!response.ok) throw new Error("Intelligence request failed");
        setIntelligence((await response.json()) as Intelligence);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Unable to load destination intelligence.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadIntelligence();
    return () => controller.abort();
  }, [request]);

  const displayHype = intelligence?.hype?.current ?? null;
  const displayMomentum = intelligence?.hype?.momentum ?? null;
  const displayProjected = intelligence?.hype.projected ?? displayHype;
  const displayCrowd = intelligence?.crowd?.label ?? null;
  const displayExpense = intelligence?.expense?.changePercent ?? null;
  const displayWeather = intelligence?.weather?.temperature
    ? `${intelligence.weather.temperature.minC}°—${intelligence.weather.temperature.maxC}°`
    : "Loading…";
  const displayConditions = intelligence?.conditions?.label ?? null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? destinations.filter((d) => `${d.name} ${d.region}`.toLowerCase().includes(q)) : [];
  }, [query]);

  return (
    <main className={`site ${dark ? "dark" : ""}`}>
      <div className="grain" />

      <header className="nav">
        <a className="logo" href="#" aria-label="Sync and Explore">
          <span className="logo-symbol">S</span>
          <span>SYNC <i>&amp;</i> EXPLORE</span>
        </a>
        <div className="nav-right">
          <span className="nav-label">DESTINATION INTELLIGENCE</span>
          <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            <span className={dark ? "active" : ""}>☾</span>
            <span className={!dark ? "active" : ""}>☼</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-meta">
          <span>01</span>
          <span>THE INTELLIGENCE LAYER</span>
        </div>
        <div className="hero-copy">
          <p className="overline">TRAVEL BEFORE YOU TRAVEL</p>
          <h1>Know the place.<br /><em>before you go.</em></h1>
          <p className="lede">
            Destination intelligence built from the signals people leave behind —
            searches, bookings, prices, social attention, weather and what is changing around a place.
          </p>
        </div>
      </section>

      <section className="command">
        <div className="command-top">
          <div className="command-label"><span className="pulse" /> ANALYSE A DESTINATION</div>
          <div className="mode-switch" aria-label="Intelligence mode">
            <button className={mode === "current" ? "active" : ""} onClick={() => setMode("current")}>CURRENT</button>
            <button className={mode === "date" ? "active" : ""} onClick={() => setMode("date")}>SELECT DATES</button>
          </div>
        </div>

        <div className="command-row">
          <div className="command-field search-wrap">
            <small>WHERE</small>
            <input
              value={query || destination.name}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setQuery("")}
              placeholder="Search a city"
              aria-label="Search destination"
            />
            {matches.length > 0 && (
              <div className="suggestions">
                {matches.map((item) => (
                  <button key={item.name} onClick={() => { setDestination(item); setQuery(""); }}>
                    {item.name}<span>{item.region} · {item.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`command-field date-field ${mode === "current" ? "disabled" : ""}`}>
            <small>{mode === "current" ? "WHEN · CURRENT" : "WHEN · YOUR DATES"}</small>
            {mode === "current" ? (
              <input value="Right now" readOnly disabled aria-label="Current intelligence" />
            ) : (
              <div className="date-inputs">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Start date" />
                <span>—</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="End date" />
              </div>
            )}
          </div>

          <button className="analyse" onClick={() => { setOpen(null); setRequest({ destination: destination.name, mode, startDate, endDate }); }} disabled={loading}>
            RUN INTELLIGENCE <span>↗</span>
          </button>
        </div>
      </section>

      <section className="destination">
        <div className="destination-index">02 / DESTINATION</div>
        <div className="destination-main">
          <div>
            <h2>{destination.name}<span>, {destination.region}</span></h2>
            <p>
              {mode === "current"
                ? "What the signals say about the destination right now."
                : <>What the signals suggest for <strong>{dates}</strong>.</>}
            </p>
          </div>
          <div className="date-chip">{mode === "current" ? "CURRENT" : dates}</div>
        </div>
      </section>

      {mode === "date" && (
        <section className="prediction-window">
          <div>
            <span className="window-kicker">PREDICTION WINDOW</span>
            <strong>
              {intelligence?.prediction.available
                ? `Reliable date-specific intelligence · ${intelligence.prediction.horizonDays} days ahead.`
                : intelligence?.prediction.message ?? "Reliable date-specific predictions are unavailable for these dates."}
            </strong>
          </div>
          <span className="window-state">
            {intelligence?.prediction.available ? "WITHIN WINDOW" : "OUTSIDE WINDOW"}
          </span>
        </section>
      )}

      <section className="intel">
        <div className="intel-intro">
          <span className="section-no">03</span>
          <div>
            <p className="overline">SIGNALS, NOT ONE SCORE</p>
            <h3>Read the place<br /><em>before you go.</em></h3>
          </div>
          <p className="intro-note">
            Each signal answers a different question. Together they reveal what people are doing,
            what demand is becoming, and what your dates may feel like.
          </p>
        </div>

        <div className="signal-grid">
          <article className="signal signal-hype">
            <div className="signal-head"><span>01</span><span>OPEN</span></div>
            <div className="hype-content">
              <div>
                <p className="signal-label">Hype</p>
                <div className="hype-row">
                  <div className="signal-value">{displayHype === null ? "—" : displayHype}</div>
                  <span className="hype-label">HAVING A MOMENT</span>
                </div>
              </div>
              <div className="hype-meter" aria-label="Hype level 78 out of 100">
                <span style={{ width: `${displayHype ?? 0}%` }} />
              </div>
              <div className="hype-scale"><span>QUIET</span><span>HEATING UP</span><span>PEAK</span></div>
              <div className="momentum">
                <div>
                  <span>MOMENTUM</span>
                  <strong>{displayMomentum === null ? "—" : "+" + displayMomentum + "%"}</strong>
                </div>
                <p>{intelligence?.hype?.label ?? (intelligence?.prediction.available === false ? "Prediction unavailable for these dates." : "Reading current signals…")}</p>
              </div>
            </div>
          </article>

          {signals.map((card) => {
            const expanded = open === card.id;
            return (
              <article
                key={card.id}
                className={`signal signal-${card.id} ${expanded ? "expanded" : ""}`}
                onClick={() => setOpen(expanded ? null : card.id)}
              >
                <div className="signal-head"><span>{card.index}</span><span>{expanded ? "CLOSE" : "OPEN"}</span></div>
                <div className="signal-body">
                  <p className="signal-label">{card.label}</p>
                  <div className="signal-value">
                    {card.id === "crowd" ? (displayCrowd ?? "—") :
                     card.id === "expense" ? (displayExpense === null ? "—" : "+" + displayExpense + "%") :
                     card.id === "weather" ? (displayWeather ?? "—") :
                     (displayConditions ?? "—")}
                  </div>
                  <p className="signal-note">{card.note}</p>
                </div>
                <div className="signal-line"><span /><span>{expanded ? "−" : "+"}</span></div>
                {expanded && (
                  <div className="signal-detail">
                    <p>{card.detail}</p>
                    <div className="micro"><span>DATE-SPECIFIC</span><span>MOCK SIGNAL</span></div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="insight">
        <div className="insight-mark">06</div>
        <div className="insight-copy">
          <p className="overline">THE USEFUL PART</p>
          <h3>People are<br />telling us something.</h3>
          <p>
            Search behaviour, hotel demand, price movement, flight cycles and social attention
            become clues about what your destination may feel like when you arrive.
          </p>
        </div>
        <div className="insight-data">
          <div><span>HYPE</span><strong>{displayHype === null ? "—" : displayHype}</strong></div>
          <div><span>MOMENTUM</span><strong>+{displayMomentum}%</strong></div>
          <div><span>PRICE PRESSURE</span><strong>{displayExpense === null ? "—" : "+" + displayExpense + "%"}</strong></div>
          <p>Signals agree: interest is rising while prices are already moving above normal.</p>
        </div>
      </section>

      <section className="alternatives">
        <div className="section-line"><span>07 / BETTER ALTERNATIVES</span><span>BASED ON YOUR DATES</span></div>
        <div className="alternative-head">
          <h3>Maybe there&apos;s<br /><em>another way.</em></h3>
          <p>Not just nearby places. Alternatives chosen from the balance of crowd, cost, weather, hype and conditions.</p>
        </div>
        <div className="alternative-list">
          {[
            ["Naggar", "Himachal Pradesh", "quieter", "−22% price pressure"],
            ["Jibhi", "Himachal Pradesh", "peaceful", "−19% price pressure"],
            ["Tirthan Valley", "Himachal Pradesh", "very quiet", "−28% price pressure"],
          ].map(([name, region, mood, stat], index) => (
            <button className="alternative" key={name}>
              <span className="alt-index">0{index + 1}</span>
              <span className="alt-place"><strong>{name}</strong><small>{region}</small></span>
              <span className="alt-mood">{mood}</span>
              <span className="alt-stat">{stat}</span>
              <span className="alt-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dates">
        <div className="section-line"><span>08 / BETTER DATES</span><span>KEEP {destination.name.toUpperCase()}</span></div>
        <div className="dates-inner">
          <h3>Keep the place.<br /><em>Change the moment.</em></h3>
          <div className="date-options">
            <button><span>17 — 19 OCT</span><strong>Manageable</strong><small>Lower crowd pressure</small><b>→</b></button>
            <button className="selected"><span>24 — 26 OCT</span><strong>Peaceful</strong><small>Lower demand · similar weather</small><b>→</b></button>
          </div>
        </div>
      </section>

      <section className="future-note">
        <span>LOOKING TOO FAR AHEAD?</span>
        <div>
          <h3><strong>Nice try.</strong><br />We&apos;re an intelligence engine,<br /><em>not a crystal ball.</em></h3>
          <p>Reliable date-specific predictions are only available within our current prediction window. We can still show what we already know — such as fixed events, major festivals and other known information.</p>
        </div>
      </section>

      <footer><span>SYNC &amp; EXPLORE</span><span>DESTINATION INTELLIGENCE / PROTOTYPE 02</span></footer>
    </main>
  );
}
