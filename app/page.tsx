"use client";

import { useMemo, useState } from "react";

type Card = {
  id: string;
  index: string;
  label: string;
  value: string;
  note: string;
  detail: string;
  accent: string;
};

const intelligence: Card[] = [
  { id: "hype", index: "01", label: "Hype", value: "78", note: "having a moment", detail: "Interest is well above Manali's usual baseline for this period.", accent: "hype" },
  { id: "trend", index: "02", label: "Momentum", value: "+18%", note: "rising this week", detail: "Recent attention is accelerating rather than simply staying high.", accent: "trend" },
  { id: "crowd", index: "03", label: "Crowd", value: "Quite busy", note: "especially midday", detail: "Expect noticeable activity around the best-known attractions during peak hours.", accent: "crowd" },
  { id: "expense", index: "04", label: "Expense", value: "+27%", note: "above normal", detail: "Comparable stays are currently carrying a higher price pressure for these dates.", accent: "expense" },
  { id: "weather", index: "05", label: "Weather", value: "18°—25°", note: "excellent window", detail: "Clear mornings, comfortable afternoons and colder evenings. Forecast confidence is moderate.", accent: "weather" },
  { id: "conditions", index: "06", label: "Conditions", value: "Watch", note: "check before leaving", detail: "This signal is reserved for destination-level advisories, closures, hazards and disruptions — not route traffic.", accent: "conditions" },
];

const destinations = [
  { name: "Manali", region: "Himachal Pradesh", hint: "Mountain escape" },
  { name: "Jibhi", region: "Himachal Pradesh", hint: "Quiet valley" },
  { name: "Rishikesh", region: "Uttarakhand", hint: "River town" },
];

export default function Home() {
  const [destination, setDestination] = useState(destinations[0]);
  const [dates, setDates] = useState("10 Oct — 12 Oct");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

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
          <span>SYNC <i>&</i> EXPLORE</span>
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
          <h1>Choose the <em>moment.</em></h1>
          <p className="lede">A destination can be beautiful and still be the wrong choice for your dates. See what is changing before you book.</p>
        </div>
      </section>

      <section className="command">
        <div className="command-label"><span className="pulse" /> ANALYSE A DESTINATION</div>
        <div className="command-row">
          <div className="command-field search-wrap">
            <small>WHERE</small>
            <input value={query || destination.name} onChange={(e) => setQuery(e.target.value)} onFocus={() => setQuery("")} placeholder="Search a city" aria-label="Search destination" />
            {matches.length > 0 && <div className="suggestions">{matches.map((item) => <button key={item.name} onClick={() => { setDestination(item); setQuery(""); }}>{item.name}<span>{item.region} · {item.hint}</span></button>)}</div>}
          </div>
          <div className="command-field">
            <small>WHEN</small>
            <input value={dates} onChange={(e) => setDates(e.target.value)} aria-label="Trip dates" />
          </div>
          <button className="analyse" onClick={() => setOpen(null)}>RUN INTELLIGENCE <span>↗</span></button>
        </div>
      </section>

      <section className="destination">
        <div className="destination-index">02 / DESTINATION</div>
        <div className="destination-main">
          <div>
            <h2>{destination.name}<span>, {destination.region}</span></h2>
            <p>What the signals suggest for <strong>{dates}</strong>.</p>
          </div>
          <div className="date-chip">{dates}</div>
        </div>
      </section>

      <section className="intel">
        <div className="intel-intro">
          <span className="section-no">03</span>
          <div>
            <p className="overline">SIX SIGNALS</p>
            <h3>Read the place<br /><em>before you go.</em></h3>
          </div>
          <p className="intro-note">Not a single score. Each signal answers a different question about the same trip.</p>
        </div>

        <div className="signal-grid">
          {intelligence.map((card, i) => {
            const expanded = open === card.id;
            return (
              <article key={card.id} className={`signal signal-${card.accent} ${expanded ? "expanded" : ""} signal-${i + 1}`} onClick={() => setOpen(expanded ? null : card.id)}>
                <div className="signal-head"><span>{card.index}</span><span>{expanded ? "CLOSE" : "OPEN"}</span></div>
                <div className="signal-body">
                  <p className="signal-label">{card.label}</p>
                  <div className="signal-value">{card.value}</div>
                  <p className="signal-note">{card.note}</p>
                </div>
                <div className="signal-line"><span /><span>{expanded ? "−" : "+"}</span></div>
                {expanded && <div className="signal-detail"><p>{card.detail}</p><div className="micro"><span>DATE-SPECIFIC</span><span>MOCK SIGNAL</span></div></div>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="insight">
        <div className="insight-mark">07</div>
        <div className="insight-copy">
          <p className="overline">THE USEFUL PART</p>
          <h3>Manali is popular.<br /><em>So what?</em></h3>
          <p>When signals disagree, the product should explain the tension — not hide it inside another score.</p>
        </div>
        <div className="insight-data">
          <div><span>HYPE</span><strong>78</strong></div>
          <div><span>MOMENTUM</span><strong>+18%</strong></div>
          <div><span>EXPENSE</span><strong>+27%</strong></div>
          <p>Interest is rising while prices are already above normal.</p>
        </div>
      </section>

      <section className="alternatives">
        <div className="section-line"><span>08 / BETTER ALTERNATIVES</span><span>BASED ON YOUR DATES</span></div>
        <div className="alternative-head">
          <h3>Maybe there&apos;s<br /><em>another way.</em></h3>
          <p>Nearby places with a different balance of crowd, cost and atmosphere.</p>
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
        <div className="section-line"><span>09 / BETTER DATES</span><span>KEEP {destination.name.toUpperCase()}</span></div>
        <div className="dates-inner">
          <h3>Keep the place.<br /><em>Change the moment.</em></h3>
          <div className="date-options">
            <button><span>17 — 19 OCT</span><strong>Manageable</strong><small>Lower crowd pressure</small><b>→</b></button>
            <button className="selected"><span>24 — 26 OCT</span><strong>Peaceful</strong><small>Lower demand · similar weather</small><b>→</b></button>
          </div>
        </div>
      </section>

      <footer><span>SYNC & EXPLORE</span><span>DESTINATION INTELLIGENCE / PROTOTYPE 01</span></footer>
    </main>
  );
}
