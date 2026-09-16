# Sync & Explore — Destination Intelligence

A destination-intelligence experience for understanding **when** and **how** a trip may feel before committing to it.

## Current scope

This first prototype is UI-only and uses mock data. The selected destination and dates drive a set of expandable intelligence cards:

- 🔥 Hype — current destination interest
- 📈 Trend — recent momentum
- 👥 Crowd — human-readable expected crowd conditions
- 💰 Expense — price pressure versus normal
- 🌦 Weather — trip-specific weather interpretation
- 🚨 Conditions — destination-level disruptions and advisories
- 🧭 Alternatives — nearby, potentially more favorable destinations
- 📅 Better dates — calmer date alternatives

**Road Intelligence is intentionally separate.** Route traffic, congestion, road closures, construction and Google Maps traffic intelligence will belong to a future Road Intelligence product.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Next.js URL shown in the terminal.

## Product direction

The UI is being built first with realistic mock data. Real data providers, prediction models, historical baselines and confidence indicators will be integrated only after the interaction and visual system are locked.
