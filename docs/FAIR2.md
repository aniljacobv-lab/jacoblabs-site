# Fair2 — a Jacob Labs demo

Fair2 is a portable HTML/CSS/JavaScript prototype for community rides and paid assistance. It does not need ChatGPT, Sites authentication, a database, a build step, or application API keys to run its sample booking flows.

## Run locally

Install Node.js 22+ to run checks. From this repository:

```sh
npm test
npm run check
python -m http.server 8080 --directory public
```

Open http://localhost:8080/fair2/. On Windows, use `py` instead of `python` if needed. No npm install is necessary for the app or tests. Serve over HTTP rather than opening the HTML file directly. Use HTTPS for a remotely hosted demo and browser location permissions.

## Host under Jacob Labs

The checked-in Firebase configuration serves `public`. The project alias is `jacoblabs-site`; the Fair2 entry is `/fair2/`. Intended Firebase URL: https://jacoblabs-site.web.app/fair2/ . This URL is live only after deployment succeeds. Any custom domain already attached to this Firebase Hosting site uses the same path.

Using a Firebase CLI signed in to an account authorized for the existing project:

```sh
firebase deploy --only hosting --project jacoblabs-site
```

This publishes the whole Jacob Labs static website, including the new Fair2 product card. The existing `deploy.bat` also handles deployment; review it before use because it commits and pushes changes as well. No credentials or Firebase access tokens are included here.

Fair2's scoped Hosting headers permit same-origin geolocation with browser consent and disable long-lived asset caching. Microphone and camera access remain disabled. File selection is available; no audio recording is implemented. Other Jacob Labs pages retain their existing policies.

## Move to another host

Copy the complete `public/fair2` directory to any static host. If mounting it at `/fair2/`, keep its `<base href="/fair2/">`. If mounting at the domain root, change that one tag to `<base href="/">`; for a different subdirectory, change it to that directory with a trailing slash. All application assets and map configuration use this base. The Jacob Labs backlink is `/`; adjust it for a standalone deployment if desired. Apply equivalent headers on the new host. No ChatGPT source manifest or credentials are needed.

## Demo walkthrough

Use **Demo guide** at the top:

1. Standard ride: review the example destination, vehicle and toll preference; preview, simulate arrival/start/completion, then rate the sample trip.
2. Shopping and assistance: the guide fills a fictional outing for tomorrow. Review the payout, request sample driver acceptance, advance through pickup and arrival, and try an agreed time extension.
3. Safety: inspect consent and revocation controls. Sharing and contact alerts are previews. The 911 link opens the device's calling flow and is for real emergencies only; do not call it during a demo.
4. Economics: adjust fare, insurance allowance, mileage and demand assumptions. All amounts are illustrative, not insurance or transportation quotes.

**Reset** asks for confirmation then reloads. Bookings, uploaded evidence, contacts and shortcuts are browser-tab state and do not survive reload. Use fictional data when demonstrating the public site. The guide does not send messages, make reservations or charge a card.

## Code map

- `public/fair2/index.html`: all screen markup and base styles.
- `simple.css`, `simple-ui.js`: mobile Ride / Trips / Account shell, shortcuts and history.
- `app.js`, `policy.js`: standard ride simulation, onboarding and rating policy.
- `care.js`, `care-ui.js`: assisted round trips, time extensions, family and safety previews.
- `route-preference.js`: toll preference snapshots.
- `location.js`, `location-ui.js`, `map-config.json`: nearby search, map pins and simulated route adjustments.
- `offers.js`, `offers-ui.js`: screenshot review and name-your-price simulation.
- `experience.js`, `experience-ui.js`: optional comfort feedback and parked-car evidence.
- `economics.js`: illustrative unit economics calculations.
- `demo.js`, `demo.css`: Jacob Labs navigation, guided scenarios and reset.
- `tests/fair2`: original functional regression tests, relocated for this repository.
- `scripts/check-fair2.cjs`: JavaScript syntax, local asset and duplicate-ID checks.

## Connected versus simulated

Live external calls: Photon place search/reverse lookup and OpenStreetMap map tiles. Search terms and search-center coordinates go to the configured provider. Geolocation is requested only after a visitor clicks the location action. Public endpoints have no service guarantee and must be reviewed/replaced before wider production traffic. Configure endpoints in `map-config.json`; do not put secret API keys into browser code.

Simulated: bookings, dispatch, driver identity checks, insurance verification, payments/payouts, road routing, toll prices/ETAs, emergency response, background location sharing, recurring bookings and child transport. Uploaded screenshots/media stay in local browser memory; they are not independently verified. Photos cannot establish smell, driving safety or medical suitability.

The quality desk and business controls are intentionally accessible demo screens, not secure administrator roles. There is no production backend or authentication implementation hidden elsewhere. All existing app code is in this repository.

## Source provenance and limitations

Exported from Fair2 Sites source commit `4123b26e16e1ddf08cfcb93c5eda911e06dad64c` on October 15, 2026. Added portable hosting setup, Jacob Labs listing, and demo guide. Personal residential sample address text was generalized for public distribution. No user screenshots, credentials, private Git history or Sites access configuration were exported.

Automated tests and structural checks are included. Visual browser QA was unavailable during this export. This is a demonstrable concept, not an operational transportation service.
