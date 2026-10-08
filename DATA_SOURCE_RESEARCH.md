# Destination Intelligence — Data Source Research

**Reviewed:** 2026-10-08  
**Purpose:** Identify realistic sources for the locked intelligence model before integrating production providers.

## 1. Search / demand

### Google Trends
Google now has a Google Trends API in alpha. It provides consistently scaled search-interest data, daily/weekly/monthly/yearly aggregation, regional/subregional data, and a rolling five-year window. Access is currently limited to alpha testers. It measures search interest, not absolute search counts.

**Decision:** Treat Google Trends as a high-value target source, but do not make the production system dependent on alpha access.

Google also exposes public Google Trends datasets through BigQuery, including Top 25 and Rising queries for recent periods. This is useful for discovery, but it is not a replacement for arbitrary destination/date demand queries.

## 2. Hotels / accommodation

### Booking.com Demand API
Booking.com currently documents accommodation search and availability endpoints that accept travel dates and can return property/product-level pricing, inventory and room information. Product-level responses can include room identifiers, number available and prices.

This is highly relevant to the locked Expense and Crowd definitions.

**Important limitation:** Booking.com explicitly notes that Demand API coverage does not necessarily equal all inventory/prices shown on the consumer website.

**Decision:** High-priority candidate for the hotel signal, subject to partner/API access and commercial terms.

### Google Hotel APIs
Google's Hotel Prices documentation is primarily for hotel partners supplying price/rate/inventory data to Google. Some Travel Partner API capabilities are restricted to trusted partners.

**Decision:** Do not design the engine around Google Hotel APIs as if they were an unrestricted consumer hotel-price lookup service.

## 3. Flights

### Skyscanner Travel API
Skyscanner documents APIs for flights, hotels and car hire, including real-time and indicative pricing. Access is application/partner based. Current public criteria state that the Travel API is aimed at established commercial businesses and is not generally available to students/individuals or low-traffic sites.

**Decision:** Strong long-term candidate if Sync & Explore qualifies, but not something to assume we can immediately use.

### Amadeus
Amadeus exposes flight-offer search APIs and has a developer/self-service ecosystem.

**Decision:** Evaluate as an accessible development source for flight search/pricing signals, while separately determining whether its data is suitable for historical demand inference.

## 4. Social / Reels

### Instagram / Meta API
The current Instagram API is designed around Instagram Professional accounts and authorized access. It can expose media and certain insights/hashtagged media under the applicable permissions, but it is not an unrestricted public-Instagram firehose.

**Decision:** Instagram remains strategically valuable, but we must not build the product on the assumption that we can freely scrape all Reels or all consumer-account activity. We need a compliant signal strategy.

## 5. Weather

### Open-Meteo
Open-Meteo currently provides forecast, historical weather, air-quality, flood and related APIs. It requires no API key for its free/non-commercial usage tier and supports forecasts up to 16 days. It exposes multiple weather models and historical data.

**Decision:** Excellent first real integration candidate for Weather and potentially environmental signals. Because our prediction window is 25 days, the weather card must distinguish actual forecast coverage from longer-range climatological/context information rather than pretending a 25-day forecast is equally reliable.

## 6. Conditions / news

### GDELT
GDELT's DOC API supports full-text news search over a rolling recent coverage window, and GDELT provides APIs for geographic/news analysis.

**Decision:** Candidate signal source for discovering destination-related news and conditions. It should be combined with official advisories and other authoritative sources rather than treated as an authority by itself.

## 7. Destination resolution

### Google Places API (New)
Google Places API (New) supports text search, autocomplete, place details and place IDs.

**Decision:** Candidate for resolving the user's city search to a canonical destination/place identity and coordinates. This is separate from intelligence itself.

## 8. Important architecture conclusion

We should NOT build:

Frontend → Google/Booking/Instagram/Flight APIs directly.

We should build:

Frontend
→ Intelligence API
→ provider adapters
→ normalized signal layer
→ prediction engine
→ intelligence response

Provider-specific restrictions, missing data, rate limits and authentication stay inside adapters.

## 9. First real-data implementation order

Recommended order:

1. Destination resolution/geocoding.
2. Weather + air quality.
3. Conditions/news.
4. Hotel search/availability/pricing.
5. Flight pricing/demand.
6. Search-demand signals.
7. Social signals.
8. Historical data collection and model validation.

The order is intentionally not based on which provider sounds most exciting. It prioritizes data that is accessible, structured and immediately useful.

## 10. Critical model warning

A live hotel price is not automatically a prediction of crowd.

A search spike is not automatically a prediction of bookings.

A Reel spike is not automatically a prediction of visitors.

A flight price is not automatically a prediction of destination crowd.

The intelligence engine must learn and validate relationships between signals before assigning predictive meaning.

## 11. Expense baseline requirement

For the first Expense implementation, a comparable observation must preserve:

- same property
- same room/product
- comparable occupancy
- comparable stay length
- comparable booking conditions

The normal-demand baseline should be derived from historical observations of that same room/product where possible.

If no defensible same-room baseline exists, the system should report insufficient evidence rather than invent a percentage.

## 12. Current status

No production provider is locked yet.

The next engineering step is to implement the normalized provider interfaces and then integrate the first accessible real sources without changing the product contract.
