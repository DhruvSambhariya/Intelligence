# Destination Intelligence — Product & Engineering Specification

**Status:** Draft for user review — do not implement against this document until it is approved.

## 1. Product purpose

Destination Intelligence answers one question:

> What do the available signals suggest about this destination for the moment/date the traveller is considering?

It is not one giant trip score. Each intelligence card answers a different question.
The system must prefer evidence from real traveller behaviour, prices, forecasts, events and conditions over generic assumptions.

## 2. User journey

### Initial state
- Destination/city search field.
- Calendar/date control beside it.
- CURRENT is selected by default.
- Search/Run Intelligence action.
- No intelligence result cards are shown before the user runs a search.

### Current mode
1. User searches/selects a destination.
2. CURRENT remains selected unless changed.
3. User presses Search/Run Intelligence.
4. The backend returns current destination intelligence.
5. Result cards appear.

### Date mode
1. User selects date mode from the calendar control.
2. User chooses a start date and end date.
3. User presses Search/Run Intelligence.
4. Backend evaluates signals relevant to those dates.
5. Date-oriented intelligence cards appear.

Changing destination, mode or dates before running a new search must not make the old result appear to belong to the new request.

## 3. Date rules

Date-specific prediction is available only inside the current prediction window.

Current product target: approximately 20–25 days. The hard limit for the first implementation is 25 days.

Rules:
- Start date must be after today.
- End date must be after start date.
- Start date must be within today + 25 days.
- End date must be within today + 25 days.
- Past dates are invalid.
- Same-day ranges are invalid.
- If either date is outside the prediction window, date-specific predictive intelligence must not be fabricated.

For dates outside the prediction window, the system may still display information that is already known and date-fixed, such as known events or festivals, when reliable data exists, but it must clearly separate known information from prediction.

Use this message for unavailable prediction:

> **Nice try.**
> We're an intelligence engine, not a crystal ball.
> Reliable date-specific predictions are only available within our current prediction window.

## 4. Result cards

Core cards:
1. Hype
2. Momentum
3. Crowd
4. Expense
5. Weather
6. Conditions

Additional result sections:
7. Better Alternatives
8. Better Dates

All core cards are date-oriented when date mode is used.

## 5. Card interaction

Cards are not expanded in their original grid position.
When a card is clicked:
- An overlay opens above the page.
- The original page remains visible behind it.
- The overlay has visible margins so it is clearly an overlay.
- The background is visually subdued.
- The overlay contains detailed explanation and supporting signals.
- It can be closed to return to the results grid.

## 6. Hype

Question: How hyped is this destination?

Hype represents the amount of attention/demand a destination is receiving relative to its normal behaviour.

User-facing presentation:
- Clear visual scale.
- Gradual green → yellow → orange → red progression.
- The visual marker should communicate the level immediately.
- A number may be shown as supporting information, but the visual scale is primary.

Candidate inputs:
- Search volume and search-interest changes.
- Destination-specific keywords.
- Search behaviour relevant to the destination.
- Social/Reels attention.
- Social engagement and growth.
- Hotel searches/interest.
- Hotel booking activity.
- Flight demand signals.
- Events.
- Seasonality.
- Historical destination behaviour.
- Other validated demand indicators.

The model should learn the relationship between these signals and later travel demand rather than assuming that any single signal directly equals visitors.

Important distinction: Hype is not Crowd. A destination can be highly hyped before physical crowd pressure reaches its maximum.

## 7. Momentum

Question: How fast is the destination's attention/demand changing?

Momentum is the forward-looking growth component attached to Hype. It measures the rate at which destination interest/demand is changing and helps project future Hype.

Candidate signals:
- Search growth.
- Keyword growth.
- Reels/content growth.
- Social engagement growth.
- Hotel search/interest growth.
- Hotel booking growth.
- Hotel inventory movement.
- Hotel price movement.
- Flight demand movement.
- Events and other known demand drivers.

Momentum should consider growth and, where data quality permits, acceleration/deceleration of growth.

Conceptual relationship: current signals → momentum → projected demand/hype.
The user should see a clear interpretation, not raw model mathematics.

## 8. Crowd

Question: How crowded is the destination likely to be during the selected dates?

The user-facing output should use understandable labels rather than exposing a crowd percentage.

Possible labels include:
- You practically own the place
- Peaceful
- Less crowded
- Normal
- Manageable
- Quite busy
- Too much crowd

Inputs:
- Hotel bookings.
- Hotel searches.
- Hotel occupancy/inventory signals.
- Flight demand.
- Destination/date-specific searches where available.
- Reels/social attention.
- Hype.
- Momentum.
- Seasonality.
- Day of week.
- Weekends.
- Holidays.
- Events.
- Historical crowd patterns.
- Other validated visitor-demand signals.

The system must combine these rather than treating one source as a direct crowd measurement.

## 9. Expense

Question: How much more or less expensive is this destination for these dates compared with its normal price?

Locked baseline definition:
The baseline is the normal price of the same hotel/room when demand is normal.

Example:
- Same hotel.
- Same room.
- Normal-demand price: ₹5,000.
- Selected-date price: ₹7,000.
- Difference: +₹2,000.
- Expense pressure: +40%.

The system must not compare unrelated hotel categories and call the difference a price increase.

Potential expansion:
- Hotels.
- Flights/fares.
- Transport.
- Activities.

The initial implementation should establish the hotel/room methodology correctly before broadening it.

Factors to account for:
- Same property.
- Same room/category.
- Historical normal-demand pricing.
- Lead time.
- Day of week.
- Seasonality.
- Holidays.
- Events.
- Demand conditions.
- Availability/inventory.

## 10. Weather

Question: What will the weather be like during the travel period?

Weather should be useful rather than just a single average temperature.

Potential presentation:
- Day-by-day forecast.
- Morning.
- Afternoon.
- Evening.
- Night.
- Temperature.
- Rain probability.
- Rain intensity where available.
- Wind.
- Visibility.
- Outdoor comfort.
- Forecast confidence.

Current mode can show current conditions and the relevant near-term forecast.
Date mode should show the forecast for the selected travel dates.
Forecast confidence should reflect lead time and source quality.

## 11. Conditions

Question: Is there anything happening around the destination that could materially affect the trip?

This is broader than weather.

Potential natural/environmental conditions:
- Heavy rain.
- Flooding.
- Landslides.
- Snowfall.
- Storms.
- Extreme heat.
- Wildfire.
- Earthquakes and other relevant hazards.
- Pollution/AQI.
- Smoke/dust.

Potential local disruption:
- Government advisories.
- Restrictions.
- Closures.
- Major local disruptions.
- Destination-level infrastructure issues.
- Other credible warnings.

Potential evidence sources:
- Official advisories.
- Government sources.
- Weather warnings.
- Environmental data.
- Credible news reporting.
- Other reliable sources.

The engine must distinguish between what is happening now, what is known to affect selected dates, what has evidence suggesting it may affect selected dates, and what is uncertain.
It must not turn an ordinary article into a disaster prediction.
It must not claim that a destination is safe merely because no warning was found.

## 12. Better Alternatives

Question: If this destination is not the best choice for these dates, what other destination should the traveller consider?

This is not a list of nearby tourist attractions.

Alternatives should be selected using the intelligence of the requested destination/date, potentially considering:
- Crowd.
- Expense.
- Weather.
- Hype.
- Conditions.
- Similar travel experience.
- Distance/accessibility.
- Other relevant traveller constraints.

The recommendation engine must explain why the alternative is being suggested.

## 13. Better Dates

Question: If the destination is fixed, when would be a better time to go?

Better Dates compares nearby valid dates using the intelligence signals.

Potential comparison factors:
- Crowd.
- Expense.
- Hype.
- Momentum.
- Weather.
- Conditions.
- Events.

The result should explain the reason a date is better rather than simply presenting a date.

## 14. Human behaviour as intelligence

Central principle: Traveller behaviour itself provides valuable predictive evidence.

Search behaviour: unusually high destination or date-specific search activity can indicate increasing demand.
Hotels: hotel searches, bookings, inventory and prices can provide stronger evidence of actual travel intent than attention alone.
Flights: flight demand, pricing and booking patterns can provide additional evidence of upcoming movement.
Social/Reels: growing destination-related content and engagement can act as a leading indicator of increasing attention.

No single signal should automatically become more searches = more crowd. The system should learn and combine relationships between signals.

## 15. Confidence

Every predictive intelligence should carry confidence internally and expose an appropriate user-facing confidence explanation when useful.

Confidence should depend on:
- Quantity of signals.
- Quality/reliability of signals.
- Agreement/disagreement between signals.
- Recency.
- Prediction lead time.
- Historical model performance where available.

The system should not present weak evidence with false precision.

## 16. Data architecture

Frontend → Intelligence API → Signal/Data Services → Prediction Engine → Intelligence Object → Frontend cards + recommendations.

The backend should remain provider-agnostic where practical.

Potential data categories:
- Search/trend.
- Hotels/accommodation.
- Flights.
- Social.
- Weather.
- News/advisories.
- Events.
- Environmental data.
- Historical observations.

External provider selection is an engineering decision to be made after the product contract is locked.

## 17. API contract

Minimum request:
- Destination.
- Mode: current or date.
- Start date when date mode is used.
- End date when date mode is used.

Response should contain:
- Destination.
- Mode.
- Dates.
- Prediction availability.
- Prediction horizon.
- Confidence.
- Hype.
- Momentum.
- Crowd.
- Expense.
- Weather.
- Conditions.
- Better Alternatives.
- Better Dates.
- Supporting signals/metadata where appropriate.

When date prediction is unavailable, predictive fields must not contain fabricated values.

## 18. UI rules

Before search: do not show intelligence result cards.
After current search: show current intelligence.
After date search: show intelligence for the selected dates.
While loading: clearly communicate that intelligence is being calculated/fetched.
Failed request: show a useful error state rather than stale intelligence.
Unsupported future dates: do not show fabricated predictions.
Card details: use overlay detail views, not in-grid expansion.

## 19. What this product is NOT

- One giant trip score.
- A generic list of tourist attractions.
- A chatbot guessing travel conditions.
- Simply displaying raw API data.
- A weather-only dashboard.
- A route/traffic intelligence system.
- A promise of perfect future prediction.
- A reason to invent numbers when evidence is missing.

Road/route intelligence is a separate future module.

## 20. Prediction philosophy

The engine should be complicated internally and simple externally.

Internally:
- Many signals.
- Historical relationships.
- Normal baselines.
- Growth rates.
- Seasonality.
- Cross-signal relationships.
- Confidence.
- Validation.

Externally:
- Clear answer.
- Clear reason.
- Useful comparison.
- Honest uncertainty.

Never fabricate certainty.

## 21. Development sequence

1. Product contract — this document.
2. Backend contract — define data models, validation and intelligence pipeline around this specification.
3. Provider research — determine real data providers and their availability, cost, limits and terms.
4. First real signals — connect the highest-value reliable sources.
5. Intelligence calculations — build Hype, Momentum, Crowd and Expense logic from real observations.
6. Weather and Conditions — connect forecast, environmental and advisory information.
7. Recommendation engine — build Better Alternatives and Better Dates.
8. Frontend integration — connect the final UI to the real intelligence object.
9. Validation — compare predictions with later observed outcomes and improve the models.

## 22. Current implementation status

The existing repository contains an experimental backend skeleton and mock signals.

That implementation is not considered the final architecture.

It should be revised to comply with this specification before real data providers are integrated.

No external provider should be integrated merely to make the demo look real.

The objective is to build a defensible Destination Intelligence system.