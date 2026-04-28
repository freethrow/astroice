# Design Day — Locations Page Implementation Spec

A standalone page on an existing Astro + Contentful site (hosted on Netlify) for the **Design Day** event: program info, a Leaflet map, and 5–8 location cards that open into a lightbox with full details.

## Goals

- New page at a short, distinctive URL (e.g. `/design-day` or `/lokacije`).
- **Detached from the main site layout** — no navbar/footer, or navbar visually de-emphasized in the background.
- Static intro content (program, hero image, intro text) rendered as plain Astro/HTML.
- Interactive parts (cards, lightbox, map) as a single React island.
- Data sourced from Contentful, with auto-rebuild on edits via Netlify build hook.
- **Per-location dates and working hours fetched client-side** for freshness without rebuilds.
- Serbian (Latin script) only — no i18n routing.

---

## Page structure

```
src/pages/design-day.astro            # the new page (filename = URL)
src/layouts/MinimalLayout.astro       # bare layout, no navbar/footer
src/components/LocationsSection.tsx   # parent React island (state owner)
src/components/LocationsMap.tsx       # Leaflet map
src/components/LocationsGrid.tsx      # cards grid
src/components/Lightbox.tsx           # detail overlay
src/components/HoursTable.tsx         # per-day hours rendering
src/lib/contentful.ts                 # add getLocations() helper
```

### Astro page

```astro
---
// src/pages/design-day.astro
import MinimalLayout from '../layouts/MinimalLayout.astro';
import LocationsSection from '../components/LocationsSection.tsx';
import { getLocations } from '../lib/contentful';

const locations = await getLocations();
---
<MinimalLayout title="Design Day">
  <section class="hero">
    <img src="/design-day-hero.jpg" alt="" />
    <h1>Design Day</h1>
    <p>Uvodni tekst o događaju…</p>
  </section>

  <LocationsSection client:only="react" locations={locations} />
</MinimalLayout>
```

`client:only="react"` is required because Leaflet touches `window` on import and cannot be SSR'd.

### MinimalLayout

Bare `<html lang="sr-Latn">`, `<head>` with global CSS and fonts, `<body>` with a `<slot />`. **No navbar/footer.** If a faded-background navbar is desired later, include it absolutely positioned with reduced opacity — but start without it.

---

## Contentful model: `Location`

Each location represents a venue participating in Design Day, with **its own dates and hours** (locations may run on different days or open at different times).

| Field             | Type                          | Notes                                              |
| ----------------- | ----------------------------- | -------------------------------------------------- |
| `name`            | Short text                    |                                                    |
| `slug`            | Short text, unique            | For React keys                                     |
| `logo`            | Media (single image)          | Dummy logos for now                                |
| `shortDescription`| Short text                    | Shown on the card                                  |
| `longDescription` | Rich text                     | Shown in the lightbox                              |
| `address`         | Short text                    |                                                    |
| `email`           | Short text (email validation) |                                                    |
| `phone`           | Short text (optional)         |                                                    |
| `website`         | Short text (optional)         |                                                    |
| `coordinates`     | **Location** field            | Built-in Contentful geo field — editor pins on map |
| `schedule`        | JSON object                   | Per-day dates + hours, see below                   |
| `order`           | Integer                       | For sorting cards                                  |

### Schedule JSON shape

Each location has its own schedule. Recommended shape:

```json
{
  "days": [
    { "date": "2026-05-15", "open": "10:00", "close": "20:00" },
    { "date": "2026-05-16", "open": "12:00", "close": "22:00" }
  ]
}
```

This handles the requirement that every event has different dates and hours. `HoursTable` renders this as rows like `Petak, 15.05. — 10:00–20:00`.

Using the Contentful Location field for coordinates avoids a separate geocoding step — editors pin each venue on a small map widget directly in Contentful.

---

## Netlify auto-rebuild on Contentful changes

1. In Netlify: **Site settings → Build & deploy → Build hooks** → create a new hook, copy the URL.
2. In Contentful: **Settings → Webhooks** → add the Netlify hook URL, scope it to the `Location` content type and to publish/unpublish events only (so unrelated edits don't trigger rebuilds).

This makes Contentful edits go live in ~30s without manual deploys.

---

## Data flow

- **Build time** (Astro frontmatter): fetch all location data including schedules as a fallback.
- **Client time** (React `useEffect`): refetch only the `schedule` field from Contentful's CDA and merge into state. This way dates/hours can change without a rebuild.

The CDA token is **read-only** and safe to expose client-side — different from the Content Management token (which must never ship to the browser). Set it as `PUBLIC_CONTENTFUL_DELIVERY_TOKEN` in env so Astro/Vite exposes it.

---

## React components

### LocationsSection (parent island)

Owns shared state so the map, cards, and lightbox can talk:

```tsx
import { useState, useEffect } from 'react';
import LocationsMap from './LocationsMap';
import LocationsGrid from './LocationsGrid';
import Lightbox from './Lightbox';

export default function LocationsSection({ locations: initial }) {
  const [locations, setLocations] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);

  // Refresh schedules client-side
  useEffect(() => {
    const SPACE = import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID;
    const TOKEN = import.meta.env.PUBLIC_CONTENTFUL_DELIVERY_TOKEN;
    fetch(
      `https://cdn.contentful.com/spaces/${SPACE}/environments/master/entries` +
      `?content_type=location&select=sys.id,fields.schedule&access_token=${TOKEN}`
    )
      .then(r => r.json())
      .then(data => {
        const scheduleById = Object.fromEntries(
          data.items.map((item: any) => [item.sys.id, item.fields.schedule])
        );
        setLocations(prev => prev.map(loc => ({
          ...loc,
          schedule: scheduleById[loc.id] ?? loc.schedule,
        })));
      })
      .catch(() => { /* keep build-time schedule on failure */ });
  }, []);

  const open = openId ? locations.find(l => l.id === openId) ?? null : null;

  return (
    <>
      <LocationsMap locations={locations} onMarkerClick={setOpenId} />
      <LocationsGrid locations={locations} onCardClick={setOpenId} />
      {open && <Lightbox location={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
```

### LocationsMap (Leaflet via react-leaflet)

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

**Custom green marker** using the brand color. Replace `BRAND_GREEN` with the actual hex from your design system.

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BRAND_GREEN = '#2E7D32'; // TODO: replace with exact brand hex

const greenPin = L.divIcon({
  className: 'brand-pin',
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z"
            fill="${BRAND_GREEN}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="5" fill="white"/>
    </svg>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

export default function LocationsMap({ locations, onMarkerClick }) {
  const center: [number, number] = [44.8125, 20.4612]; // Belgrade

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {locations.map(loc => (
        <Marker
          key={loc.id}
          position={[loc.coordinates.lat, loc.coordinates.lon]}
          icon={greenPin}
          eventHandlers={{ click: () => onMarkerClick?.(loc.id) }}
        >
          <Popup>
            <strong>{loc.name}</strong><br />
            {loc.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

Because we're using a `divIcon`, the default-marker-icon-fix snippet is no longer needed.

**Tile provider note:** OSM's public tiles are fine for development/low traffic. For production launch, register with **Stadia Maps**, **MapTiler**, or **Mapbox** — drop-in change to the `url` and `attribution` props.

### LocationsGrid

```tsx
export default function LocationsGrid({ locations, onCardClick }) {
  return (
    <div className="grid">
      {locations.map(loc => (
        <button key={loc.id} className="card" onClick={() => onCardClick(loc.id)}>
          <img src={loc.logo} alt="" />
          <h3>{loc.name}</h3>
          <p>{loc.shortDescription}</p>
          <address>{loc.address}</address>
          <a href={`mailto:${loc.email}`} onClick={e => e.stopPropagation()}>
            {loc.email}
          </a>
        </button>
      ))}
    </div>
  );
}
```

`stopPropagation` on the email link prevents the card click from firing.

### HoursTable

Renders the per-location schedule. Day names in Serbian Latin, dates formatted as `dd.MM.`:

```tsx
const DAY_NAMES = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];

export default function HoursTable({ schedule }) {
  if (!schedule?.days?.length) return null;
  return (
    <table className="hours">
      <tbody>
        {schedule.days.map((d) => {
          const date = new Date(d.date);
          const dayName = DAY_NAMES[date.getDay()];
          const dd = String(date.getDate()).padStart(2, '0');
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return (
            <tr key={d.date}>
              <td>{dayName}, {dd}.{mm}.</td>
              <td>{d.open}–{d.close}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

### Lightbox (Radix UI Dialog)

```bash
npm install @radix-ui/react-dialog
```

Radix handles focus trapping, ESC-to-close, scroll lock, and ARIA — much better than rolling your own. **No URL update on open** (per requirements) — state lives purely in React.

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import HoursTable from './HoursTable';

export default function Lightbox({ location, onClose }) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="lightbox-overlay" />
        <Dialog.Content className="lightbox-content">
          <Dialog.Title>{location.name}</Dialog.Title>
          <img src={location.logo} alt="" />
          <Dialog.Description>{location.shortDescription}</Dialog.Description>
          <div>{/* render longDescription rich text */}</div>
          <address>{location.address}</address>
          <a href={`mailto:${location.email}`}>{location.email}</a>
          {location.phone && <a href={`tel:${location.phone}`}>{location.phone}</a>}
          {location.website && (
            <a href={location.website} target="_blank" rel="noopener">Sajt</a>
          )}
          <HoursTable schedule={location.schedule} />
          <Dialog.Close aria-label="Zatvori">Zatvori</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## Serbian (Latin) UI strings

Centralize for easy editing later:

```ts
export const STRINGS = {
  close: 'Zatvori',
  website: 'Sajt',
  email: 'E-pošta',
  phone: 'Telefon',
  address: 'Adresa',
  hours: 'Radno vreme',
  days: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'],
};
```

---

## Environment variables

Add to Netlify (and `.env` locally):

```
PUBLIC_CONTENTFUL_SPACE_ID=...
PUBLIC_CONTENTFUL_DELIVERY_TOKEN=...   # CDA token, safe for browser
CONTENTFUL_PREVIEW_TOKEN=...           # optional, server-only
```

---

## Layout

**Map above grid** — overview first, details below. Mobile-friendly by default. Map height around 400–500px on desktop, can shrink on mobile.

(Other patterns considered and rejected for now: side-by-side Airbnb-style is awkward on mobile; per-lightbox mini-map adds complexity without much gain since the main map is already on the page.)

---

## Decisions locked in

- Event: **Design Day** (not EXPO).
- Markers: solid brand green, custom SVG `divIcon`.
- Language: **Serbian Latin only**, no i18n routing.
- Lightbox does **not** update the URL — pure React state.
- Logos: dummy assets initially, real logos later.
- Schedule: per-location dates + hours, refreshed client-side from Contentful CDA.

---

## Implementation order

1. Add `Location` content model in Contentful, populate with 1–2 test entries (dummy logos, real coordinates, sample schedules).
2. Add `getLocations()` to `src/lib/contentful.ts`.
3. Create `MinimalLayout.astro` and the empty `design-day.astro` page that renders just the hero.
4. Build `LocationsGrid` + `HoursTable` + `Lightbox`, wire into `LocationsSection`.
5. Add `LocationsMap` with the green pin, wire marker clicks into the same `openId` state.
6. Add client-side schedule refetch.
7. Set up Netlify build hook + Contentful webhook.
8. Replace dummy logos with real ones.
9. Switch to a paid tile provider before launch.
