"use client";

import { useMemo, useState } from "react";

type Card = {
  id: string;
  icon: string;
  label: string;
  value: string;
  summary: string;
  eyebrow: string;
  accent: string;
  details: string[];
};

const cards: Card[] = [
  {
    id: "hype",
    icon: "🔥",
    label: "Hype",
    value: "78%",
    summary: "Getting popular",
    eyebrow: "Destination interest",
    accent: "warm",
    details: [
      "People are starting to notice this destination around your dates.",
      "Recent travel-content activity is above its usual level.",
      "78–90% means the destination is having a moment; 90–100% is peak hype.",
    ],
  },
  {
    id: "trend",
    icon: "📈",
    label: "Trend",
    value: "+18%",
    summary: "Rising this week",
    eyebrow: "Momentum",
    accent: "green",
    details: [
      "Interest is moving upward compared with the recent baseline.",
      "A rising trend can signal that a quiet destination is about to become busier.",
      "This is a prediction signal, not a guarantee of future bookings.",
    ],
  },
  {
    id: "crowd",
    icon: "👥",
    label: "Crowd",
    value: "Quite busy",
    summary: "Popular, but manageable",
    eyebrow: "Expected experience",
    accent: "violet",
    details: [
      "Expect noticeable visitor activity around the most popular places.",
      "Peak attraction hours are likely to feel busier than early morning or evening.",
      "We keep the underlying score hidden and translate it into human language.",
    ],
  },
  {
    id: "expense",
    icon: "₹",
    label: "Expense",
    value: "+27%",
    summary: "Above normal",
    eyebrow: "Price pressure",
    accent: "gold",
    details: [
      "Comparable stays are currently showing higher price pressure for these dates.",
      "Example baseline: ₹12,000 for a comparable 5★ double room.",
      "Selected-date example: ₹15,240 — about 27% above the baseline.",
    ],
  },
  {
    id: "weather",
    icon: "☀️",
    label: "Weather",
    value: "Excellent",
    summary: "18° — 25°",
    eyebrow: "Trip conditions",
    accent: "sky",
    details: [
      "Morning: clear and cool. Afternoon: bright with comfortable outdoor conditions.",
      "Evening: cooler with light winds; nights are noticeably colder.",
      "Forecast confidence is shown separately because confidence changes with lead time.",
    ],
  },
  {
    id: "conditions",
    icon: "🚨",
    label: "Conditions",
    value: "Watch",
    summary: "Recent activity detected",
    eyebrow: "Destination alerts",
    accent: "red",
    details: [
      "No road intelligence is included here — route traffic belongs to the future Road Intelligence product.",
      "This card is reserved for destination-level closures, advisories, weather hazards, local disruptions and other relevant conditions.",
      "Every alert will eventually carry its source and last-checked time.",
    ],
  },
  {
    id: "alternatives",
    icon: "🧭",
    label: "Alternatives",
    value: "3 nearby",
    summary: "Quieter options",
    eyebrow: "If you want less rush",
    accent: "teal",
    details: [
      "Naggar — quieter mountain atmosphere, around 1 hour from Manali.",
      "Jibhi — peaceful alternative with lower visitor pressure.",
      "Tirthan Valley — a slower option for nature and quiet.",
    ],
  },
];

const destinations = [
  { name: "Manali", region: "Himachal Pradesh", hint: "Popular mountain escape" },
  { name: "Jibhi", region: "Himachal Pradesh", hint: "Quiet valley getaway" },
  { name: "Rishikesh", region: "Uttarakhand", hint: "River & mountain town" },
];

export default function Home() {
  const [destination, setDestination] = useState(destinations[0]);
  const [dates, setDates] = useState("10 Oct — 12 Oct");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return destinations.filter((item) => `${item.name} ${item.region}`.toLowerCase().includes(value));
  }, [query]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>SYNC <i>&</i> EXPLORE</span>
        </div>
        <span className="product-tag">DESTINATION INTELLIGENCE</span>
      </header>

      <section className="hero">
        <p className="kicker">TRAVEL BEFORE YOU TRAVEL</p>
        <h1>Know the place.<br /><em>Choose the moment.</em></h1>
        <p className="hero-copy">See what your destination could feel like on the dates you&apos;re thinking about — before you commit.</p>

        <div className="search-panel">
          <div className="search-field">
            <span>⌕</span>
            <div>
              <label>DESTINATION</label>
              <input
                value={query || destination.name}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setQuery("")}
                placeholder="Search a city..."
                aria-label="Search destination"
              />
            </div>
            {matches.length > 0 && (
              <div className="suggestions">
                {matches.map((item) => (
                  <button key={item.name} onClick={() => { setDestination(item); setQuery(""); setOpen(null); }}>
                    <strong>{item.name}</strong><span>{item.region} · {item.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="date-field">
            <span>◷</span>
            <div>
              <label>YOUR DATES</label>
              <input value={dates} onChange={(event) => setDates(event.target.value)} aria-label="Trip dates" />
            </div>
          </div>
          <button className="analyse-button" onClick={() => setOpen(null)}>Analyse <span>→</span></button>
        </div>
      </section>

      <section className="destination-heading">
        <div>
          <p className="kicker">YOUR DESTINATION</p>
          <h2>{destination.name}<span>, {destination.region}</span></h2>
        </div>
        <div className="selected-date">{dates}</div>
      </section>

      <section className="intelligence-grid" aria-label="Destination intelligence">
        {cards.map((card) => {
          const isOpen = open === card.id;
          return (
            <article key={card.id} className={`intel-card ${isOpen ? "is-open" : ""} accent-${card.accent}`} onClick={() => setOpen(isOpen ? null : card.id)}>
              <div className="card-topline"><span className="card-icon">{card.icon}</span><span className="card-eyebrow">{card.eyebrow}</span><span className="expand">{isOpen ? "×" : "↗"}</span></div>
              <div className="card-main">
                <h3>{card.label}</h3>
                <strong>{card.value}</strong>
                <p>{card.summary}</p>
              </div>
              {isOpen && (
                <div className="card-details">
                  {card.details.map((detail, index) => <p key={index}><span>0{index + 1}</span>{detail}</p>)}
                </div>
              )}
              {!isOpen && <div className="card-hint">Click to explore</div>}
            </article>
          );
        })}
      </section>

      <section className="alternatives-panel">
        <div className="section-heading">
          <div><p className="kicker">WHEN THE NUMBERS SAY SOMETHING ELSE</p><h2>Maybe there&apos;s a better way.</h2></div>
          <p>We&apos;ll use the same intelligence to find nearby places that fit your dates better.</p>
        </div>
        <div className="alternative-grid">
          {[{name:"Naggar", time:"~1 hr from Manali", mood:"Quieter", stat:"−22% price pressure"}, {name:"Jibhi", time:"~2.5 hrs from Manali", mood:"Peaceful", stat:"−19% price pressure"}, {name:"Tirthan Valley", time:"~3.5 hrs from Manali", mood:"Very peaceful", stat:"−28% price pressure"}].map((item) => (
            <button className="alternative" key={item.name}>
              <span className="alt-arrow">↗</span><p>{item.time}</p><h3>{item.name}</h3><div><span>{item.mood}</span><span>{item.stat}</span></div>
            </button>
          ))}
        </div>
      </section>

      <section className="dates-strip">
        <div><p className="kicker">OR KEEP MANALI</p><h2>Find a calmer weekend.</h2></div>
        <div className="date-option"><span>17 — 19 OCT</span><strong>Manageable</strong><small>Lower crowd pressure · similar weather</small></div>
        <div className="date-option featured"><span>24 — 26 OCT</span><strong>Peaceful</strong><small>Lower demand · comfortable weather</small></div>
      </section>

      <footer><span>SYNC & EXPLORE</span><span>DESTINATION INTELLIGENCE · V0.1</span></footer>
    </main>
  );
}
