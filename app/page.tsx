"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "current" | "date";
type Intelligence = {
  destination: { name: string; region: string };
  mode: Mode;
  dates: { start: string | null; end: string | null };
  prediction: { available: boolean; horizonDays: number | null; confidence: string | null; message?: string };
  hype: { current: number; momentum: number; projected: number | null; label: string; confidence: string } | null;
  crowd: { level: string; label: string; confidence: string; reason: string } | null;
  expense: { changePercent: number | null; label: string; confidence: string; reason: string } | null;
  weather: { summary: string; confidence: string; temperature?: { minC: number; maxC: number } } | null;
  conditions: { label: string; status: string; confidence: string; reason: string; source?: string; items?: { title: string; url: string; source: string; date: string | null }[] } | null;
  alternatives: { name: string; region: string; reason: string }[];
  betterDates: { name: string; region: string; reason: string }[];
  signals: Record<string, { value: number | null; direction: string; confidence: string; source: string; evidence?: string[] } | null>;
};

const destinations = [
  { name: "Manali", region: "Himachal Pradesh", hint: "Mountain escape" },
  { name: "Jibhi", region: "Himachal Pradesh", hint: "Quiet valley" },
  { name: "Rishikesh", region: "Uttarakhand", hint: "River town" },
];

const cardIds = ["crowd", "expense", "weather", "conditions"] as const;

export default function Home() {
  const [destination, setDestination] = useState<(typeof destinations)[number] | null>(null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("current");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [todayIso, setTodayIso] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const max = new Date(today);
    max.setDate(today.getDate() + 25);
    setTodayIso(iso(tomorrow));
    setMaxDate(iso(max));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return destinations.filter((d) => `${d.name} ${d.region}`.toLowerCase().includes(q));
  }, [query]);

  const dates = startDate && endDate
    ? `${startDate.slice(8)} ${new Date(startDate + "T00:00:00").toLocaleString("en", { month: "short" })} — ${endDate.slice(8)} ${new Date(endDate + "T00:00:00").toLocaleString("en", { month: "short" })}`
    : "Select dates";

  const invalidDates =
    mode === "date" &&
    (!startDate || !endDate || endDate <= startDate ||
      (!!maxDate && (startDate > maxDate || endDate > maxDate)));

  async function runIntelligence() {
    if (!destination || loading || invalidDates) return;
    setLoading(true);
    setError(null);
    setIntelligence(null);
    setOpenCard(null);

    const params = new URLSearchParams({
      destination: destination.name,
      mode,
    });
    if (mode === "date") {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    try {
      const response = await fetch("/api/intelligence?" + params.toString());
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Intelligence request failed");
      setIntelligence(body as Intelligence);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load destination intelligence.");
    } finally {
      setLoading(false);
    }
  }

  function selectMode(next: Mode) {
    setMode(next);
    setIntelligence(null);
    setOpenCard(null);
    setError(null);
    if (next === "current") {
      setStartDate("");
      setEndDate("");
    }
  }

  function selectDestination(item: (typeof destinations)[number]) {
    setDestination(item);
    setQuery("");
    setIntelligence(null);
    setOpenCard(null);
  }

  const hype = intelligence?.hype;
  const cardDetail = {
    crowd: intelligence?.crowd?.reason,
    expense: intelligence?.expense?.reason,
    weather: intelligence?.weather?.summary,
    conditions: intelligence?.conditions?.reason,
  };

  return (
    <main className={`site ${dark ? "dark" : ""}`}>
      <div className="grain" />

      <header className="nav">
        <a className="logo" href="#" aria-label="Sync and Explore">
          <span className="logo-symbol">S</span><span>SYNC <i>&amp;</i> EXPLORE</span>
        </a>
        <div className="nav-right">
          <span className="nav-label">DESTINATION INTELLIGENCE</span>
          <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            <span className={dark ? "active" : ""}>☾</span><span className={!dark ? "active" : ""}>☼</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-meta"><span>01</span><span>THE INTELLIGENCE LAYER</span></div>
        <div className="hero-copy">
          <p className="overline">TRAVEL BEFORE YOU TRAVEL</p>
          <h1>Know the place.<br /><em>before you go.</em></h1>
          <p className="lede">Destination intelligence built from the signals people leave behind — searches, bookings, prices, social attention, weather and what is changing around a place.</p>
        </div>
      </section>

      <section className="command">
        <div className="command-top">
          <div className="command-label"><span className="pulse" /> ANALYSE A DESTINATION</div>
          <div className="mode-switch">
            <button className={mode === "current" ? "active" : ""} onClick={() => selectMode("current")}>CURRENT</button>
            <button className={mode === "date" ? "active" : ""} onClick={() => selectMode("date")}>SELECT DATES</button>
          </div>
        </div>

        <div className="command-row">
          <div className="command-field search-wrap">
            <small>WHERE</small>
            <input
              value={query || destination?.name || ""}
              onChange={(e) => { setQuery(e.target.value); setDestination(null); setIntelligence(null); }}
              placeholder="Search a city"
              aria-label="Search destination"
            />
            {matches.length > 0 && (
              <div className="suggestions">
                {matches.map((item) => (
                  <button key={item.name} onClick={() => selectDestination(item)}>
                    {item.name}<span>{item.region} · {item.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`command-field date-field ${mode === "current" ? "disabled" : ""}`}>
            <small>{mode === "current" ? "WHEN · CURRENT" : "WHEN · YOUR DATES"}</small>
            {mode === "current" ? (
              <input value="Right now" readOnly aria-label="Current intelligence" />
            ) : (
              <div className="date-inputs">
                <input type="date" min={todayIso} max={maxDate} value={startDate} onChange={(e) => { setStartDate(e.target.value); setIntelligence(null); }} aria-label="Start date" />
                <span>—</span>
                <input type="date" min={startDate || todayIso} max={maxDate} value={endDate} onChange={(e) => { setEndDate(e.target.value); setIntelligence(null); }} aria-label="End date" />
              </div>
            )}
          </div>

          <button className="analyse" onClick={runIntelligence} disabled={loading || !destination || invalidDates}>
            {loading ? "READING SIGNALS…" : "RUN INTELLIGENCE"} <span>↗</span>
          </button>
        </div>
        {mode === "date" && (
          <div className={`date-validation ${invalidDates ? "invalid" : ""}`}>
            {startDate && endDate && endDate <= startDate ? "End date must be after start date." : `Choose dates within the next 25 days.`}
          </div>
        )}
        {error && <div className="api-status error">{error}</div>}
      </section>

      {!intelligence && !loading && (
        <section className="empty-state">
          <span>02 / READY</span>
          <h2>Search a destination<br /><em>to see its intelligence.</em></h2>
          <p>Nothing is calculated until you run the analysis.</p>
        </section>
      )}

      {loading && (
        <section className="empty-state"><span>02 / ANALYSING</span><h2>Reading the signals.</h2><p>Open weather, public-attention data and destination-related news are being assembled.</p></section>
      )}

      {intelligence && (
        <>
          <section className="destination">
            <div className="destination-index">02 / DESTINATION</div>
            <div className="destination-main">
              <div>
                <h2>{destination?.name}<span>, {destination?.region}</span></h2>
                <p>{mode === "current" ? "What the signals say about the destination right now." : <>What the signals suggest for <strong>{dates}</strong>.</>}</p>
              </div>
              <div className="date-chip">{mode === "current" ? "CURRENT" : dates}</div>
            </div>
          </section>

          {mode === "date" && (
            <section className="prediction-window">
              <div>
                <span className="window-kicker">PREDICTION WINDOW</span>
                <strong>{intelligence.prediction.message ?? (intelligence.prediction.available ? `Date window · ${intelligence.prediction.horizonDays} days ahead.` : "Date-specific predictions are unavailable.")}</strong>
              </div>
              <span className="window-state">{intelligence.prediction.available ? "WITHIN WINDOW" : "OUTSIDE WINDOW"}</span>
            </section>
          )}

          <section className="intel">
            <div className="intel-intro">
              <span className="section-no">03</span>
              <div><p className="overline">SIGNALS, NOT ONE SCORE</p><h3>Read the place<br /><em>before you go.</em></h3></div>
              <p className="intro-note">Each signal answers a different question. Together they reveal what people are doing, what demand is becoming, and what your dates may feel like.</p>
            </div>

            <div className="signal-grid">
              <article className="signal signal-hype" onClick={() => setOpenCard("hype")}>
                <div className="signal-head"><span>01</span><span>OPEN</span></div>
                <div className="hype-content">
                  <p className="signal-label">Hype</p>
                  <div className="hype-row"><div className="signal-value">{hype?.current ?? "—"}</div><span className="hype-label">{hype?.label ?? "—"}</span></div>
                  <div className="hype-meter" aria-label={`Hype level ${hype?.current ?? 0} out of 100`}><span style={{ width: `${hype?.current ?? 0}%` }} /></div>
                  <div className="hype-scale"><span>QUIET</span><span>HEATING UP</span><span>PEAK</span></div>
                  <div className="momentum"><div><span>MOMENTUM</span><strong>{hype ? `${hype.momentum >= 0 ? "+" : ""}${hype.momentum}%` : "—"}</strong></div><p>{hype ? `Projected hype: ${hype.projected}` : "—"}</p></div>
                </div>
              </article>

              {cardIds.map((id, i) => {
                const value =
                  id === "crowd" ? intelligence.crowd?.label :
                  id === "expense" ? (intelligence.expense?.changePercent == null ? null : `${intelligence.expense.changePercent > 0 ? "+" : ""}${intelligence.expense.changePercent}%`) :
                  id === "weather" ? (intelligence.weather?.temperature ? `${intelligence.weather.temperature.minC}°—${intelligence.weather.temperature.maxC}°` : null) :
                  intelligence.conditions?.label;
                const notes = { crowd: "visitor pressure", expense: "compared with normal", weather: "forecast", conditions: "destination conditions" };
                const labels = { crowd: "Crowd", expense: "Expense", weather: "Weather", conditions: "Conditions" };
                const opened = openCard === id;
                return (
                  <article key={id} className={`signal signal-${id}`} onClick={() => setOpenCard(id)}>
                    <div className="signal-head"><span>0{i + 2}</span><span>OPEN</span></div>
                    <div className="signal-body"><p className="signal-label">{labels[id]}</p><div className="signal-value">{value ?? "No data yet"}</div><p className="signal-note">{notes[id]}</p></div>
                    <div className="signal-line"><span /><span>+</span></div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="insight">
            <div className="insight-mark">06</div>
            <div className="insight-copy"><p className="overline">THE USEFUL PART</p><h3>People are<br />telling us something.</h3><p>Search behaviour, hotel demand, price movement, flight cycles and social attention become clues about what your destination may feel like when you arrive.</p></div>
            <div className="insight-data">
              <div><span>HYPE</span><strong>{hype?.current ?? "—"}</strong></div>
              <div><span>MOMENTUM</span><strong>{hype ? `${hype.momentum >= 0 ? "+" : ""}${hype.momentum}%` : "—"}</strong></div>
              <div><span>PRICE PRESSURE</span><strong>{intelligence.expense?.changePercent == null ? "—" : `${intelligence.expense.changePercent > 0 ? "+" : ""}${intelligence.expense.changePercent}%`}</strong></div>
            </div>
          </section>

          {intelligence.alternatives.length > 0 && (
            <section className="alternatives">
              <div className="section-line"><span>07 / BETTER ALTERNATIVES</span><span>BASED ON YOUR DATES</span></div>
              <div className="alternative-head"><h3>Maybe there&apos;s<br /><em>another way.</em></h3></div>
              <div className="alternative-list">{intelligence.alternatives.map((item, index) => <button className="alternative" key={item.name}><span className="alt-index">0{index + 1}</span><span className="alt-place"><strong>{item.name}</strong><small>{item.region}</small></span><span className="alt-mood">{item.reason}</span><span className="alt-arrow">↗</span></button>)}</div>
            </section>
          )}

          {intelligence.betterDates.length > 0 && (
            <section className="dates">
              <div className="section-line"><span>08 / BETTER DATES</span><span>KEEP {destination?.name.toUpperCase()}</span></div>
              <div className="dates-inner"><h3>Keep the place.<br /><em>Change the moment.</em></h3><div className="date-options">{intelligence.betterDates.map((item) => <button key={item.name}><span>{item.name}</span><strong>{item.reason}</strong><b>→</b></button>)}</div></div>
            </section>
          )}

          <section className="future-note">
            <span>LOOKING TOO FAR AHEAD?</span>
            <div><h3><strong>Nice try.</strong><br />We&apos;re an intelligence engine,<br /><em>not a crystal ball.</em></h3><p>Reliable date-specific predictions are only available within our current prediction window. We can still show what we already know — such as fixed events, major festivals and other known information.</p></div>
          </section>
        </>
      )}

      {openCard && intelligence && (
        <div className="card-overlay" role="dialog" aria-modal="true" onClick={() => setOpenCard(null)}>
          <div className="card-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setOpenCard(null)}>CLOSE ×</button>
            {openCard === "hype" ? (
              <>
                <span className="overline">01 / HYPE + MOMENTUM</span>
                <h2>{hype?.current ?? "—"} <em>{hype?.label ?? ""}</em></h2>
                <div className="overlay-meter"><span style={{ width: `${hype?.current ?? 0}%` }} /></div>
                <div className="overlay-stats"><div><small>CURRENT HYPE</small><strong>{hype?.current ?? "—"}</strong></div><div><small>MOMENTUM</small><strong>{hype ? `${hype.momentum >= 0 ? "+" : ""}${hype.momentum}%` : "—"}</strong></div><div><small>PROJECTED</small><strong>{hype?.projected ?? "—"}</strong></div></div>
                <p>Hype uses recent Wikipedia page-view movement as a limited public-attention proxy, not as a count of searches, bookings or visitors. Momentum compares the latest 7-day average with the preceding 7 days. This early signal is low-confidence and is not yet calibrated against real travel outcomes.</p>
                {intelligence.signals.searchDemand && (
                  <div className="weather-detail">
                    <div className="weather-meta">
                      <span>SOURCE <strong>{intelligence.signals.searchDemand.source}</strong></span>
                      <span>CONFIDENCE <strong>{intelligence.signals.searchDemand.confidence}</strong></span>
                    </div>
                    <div className="weather-days">
                      {(intelligence.signals.searchDemand.evidence ?? []).map((item) => (
                        <div key={item}><strong>{item}</strong></div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="overline">0{cardIds.indexOf(openCard as any) + 2} / {openCard.toUpperCase()}</span>
                <h2>{openCard === "crowd" ? intelligence.crowd?.label : openCard === "expense" ? (intelligence.expense?.changePercent == null ? "No price baseline" : `${intelligence.expense.changePercent > 0 ? "+" : ""}${intelligence.expense.changePercent}%`) : openCard === "weather" ? (intelligence.weather?.summary ?? "No weather data yet") : (intelligence.conditions?.label ?? "No conditions data yet")}</h2>
                <p>{cardDetail[openCard as keyof typeof cardDetail] ?? "This signal does not have real provider data yet."}</p>
                {openCard === "conditions" && intelligence.conditions?.items && intelligence.conditions.items.length > 0 && (
                  <div className="weather-days">
                    {intelligence.conditions.items.map((item) => (
                      <div key={item.url}>
                        <span>{item.source}{item.date ? ` · ${item.date}` : ""}</span>
                        <strong><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></strong>
                      </div>
                    ))}
                  </div>
                )}
                {openCard === "weather" && intelligence.weather && (
                  <div className="weather-detail">
                    <div className="weather-meta">
                      <span>SOURCE <strong>{intelligence.weather.source}</strong></span>
                      <span>CONFIDENCE <strong>{intelligence.weather.confidence}</strong></span>
                      <span>FORECAST COVERAGE <strong>{intelligence.weather.forecastDaysAvailable} DAYS</strong></span>
                    </div>
                    {intelligence.weather.days && intelligence.weather.days.length > 0 && (
                      <div className="weather-days">
                        {intelligence.weather.days.map((day) => (
                          <div key={day.date}>
                            <span>{day.date}</span>
                            <strong>{day.temperature.minC}° — {day.temperature.maxC}°</strong>
                            <small>{day.summary} · {day.precipitationProbability ?? 0}% rain</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <footer><span>SYNC &amp; EXPLORE</span><span>DESTINATION INTELLIGENCE / PROTOTYPE 03</span></footer>
    </main>
  );
}
