# Design Day 2026 — `/designday2026` Page Design

**Date:** 2026-04-28  
**URL:** `/designday2026`  
**Language:** Serbian (Latin script) only

---

## Goal

A standalone event page for Design Day 2026 ("Giornata del design italiano nel mondo"). Shows a hero invitation image, an interactive Leaflet map of participating Belgrade furniture/design galleries, a card grid, and a detail lightbox. Detached from the main site layout (no Header/Footer).

---

## Color Palette

Derived from `/public/designday2026.jpg`:

| Token | Hex | Usage |
|---|---|---|
| Background | `#F5F0EB` | Page background |
| Accent | `#E05A42` | Map markers, links, hover states |
| Text | `#1C1C1A` | Body text, headings |

---

## File Structure

```
src/pages/designday2026.astro
src/layouts/MinimalLayout.astro
src/lib/mockLocations.js
src/components/designday/
  LocationsSection.jsx      ← React island, owns all shared state
  LocationsMap.jsx          ← react-leaflet map
  LocationsGrid.jsx         ← card grid
  Lightbox.jsx              ← detail overlay
  HoursTable.jsx            ← schedule table
```

No changes to `contentful.js`, `Layout.astro`, `Header.astro`, `tailwind.config.mjs`, or `global.css`.

---

## Dependencies

- **Install:** `react-leaflet` (+ `@types/leaflet` for editor hints if desired)
- **Already installed:** `leaflet`, `react`, `react-dom`, `@astrojs/react`, `@astrojs/tailwind`
- **No new packages** for the lightbox — custom React + Tailwind

---

## MinimalLayout

`src/layouts/MinimalLayout.astro` — bare layout, no Header/Footer, no ViewTransitions, no Leaflet CDN (react-leaflet bundles its own):

```astro
---
const { title = "Design Day 2026" } = Astro.props;
---
<!DOCTYPE html>
<html lang="sr-Latn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@700&family=Roboto:wght@100;400;500&display=swap" rel="stylesheet" />
    <!-- Tailwind CSS is injected automatically by @astrojs/tailwind — no explicit import needed -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

---

## Astro Page

`src/pages/designday2026.astro`:

- Imports `MinimalLayout` and `LocationsSection`
- Imports mock data from `src/lib/mockLocations.js` (swap for `getLocations()` from `contentful.js` when model is ready)
- Hero section: two-column on desktop (left: Serbian event text + home link; right: invitation image), stacked on mobile (image on top)
- `LocationsSection` rendered with `client:only="react"` (required — Leaflet touches `window`)

**Hero left column content (Serbian):**
- Subtitle: "Giornata del design italiano u svetu 2026"
- Title: "RE-DIZAJN: regenerisati prostore, objekte, ideje, odnose"
- Date/time: "4. maj 2026, 17:30"
- Venue: "Rezidencija Ambasadora Italije, Birčaninova 9a"
- Home link: `← ITA Beograd` (accent color, uppercase, letter-spaced, links to `/`)

---

## Mock Data

`src/lib/mockLocations.js` — 6 hardcoded Belgrade furniture/design galleries.

Each location object shape:
```js
{
  id: 'gallery-slug',
  name: 'Gallery Name',
  slug: 'gallery-slug',
  logo: null,              // null = render initials placeholder
  shortDescription: '...',
  longDescription: '...',
  address: 'Ulica bb, Beograd',
  email: 'info@gallery.rs',
  phone: '+381 11 ...',   // optional
  website: 'https://...',  // optional
  coordinates: { lat: 44.8xx, lon: 20.4xx },
  schedule: {
    days: [
      { date: '2026-05-15', open: '10:00', close: '20:00' },
      { date: '2026-05-16', open: '11:00', close: '19:00' },
    ]
  },
  order: 1,
}
```

Logo placeholder: when `logo` is null, render a colored square with the gallery's initials (color derived from the accent palette, consistent per gallery).

---

## React Components

### LocationsSection.jsx

Owns all shared state:
- `openId: string | null` — which location's lightbox is open
- No schedule refresh logic (added later when Contentful model is ready)

Renders: `<LocationsMap>` → `<LocationsGrid>` → `{open && <Lightbox>}`

### LocationsMap.jsx

- `react-leaflet`: `MapContainer`, `TileLayer`, `Marker`, `Popup`
- Center: `[44.8125, 20.4612]` (Belgrade), zoom 13
- Custom `divIcon` SVG pin in accent color `#E05A42`
- Marker click → `onMarkerClick(loc.id)` → opens lightbox
- OSM tiles (upgrade to paid provider before public launch)

### LocationsGrid.jsx

- Tailwind grid: 3 cols desktop / 2 tablet / 1 mobile
- Each card: logo placeholder (or image), name, short description, address, email
- Card is a `<button>` → `onCardClick(loc.id)`
- Email `<a>` stops propagation to prevent card click

### Lightbox.jsx

- Fixed full-screen overlay, dark semi-transparent backdrop
- Centered white/off-white panel, scrollable
- Content: logo, name, long description, address, email, phone (optional), website link ("Sajt"), `<HoursTable>`
- Close triggers: ESC key (via `useEffect`), backdrop click, explicit close button ("Zatvori")
- Locks body scroll while open (`overflow-hidden` on `document.body`)

### HoursTable.jsx

Renders schedule days in Serbian Latin:
```
Petak, 15.05.    10:00–20:00
Subota, 16.05.   11:00–19:00
```

Day names array: `['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota']`

---

## Data Migration Path

When the Contentful `Location` model is ready:
1. Add `getLocations()` to `src/lib/contentful.js` (real CDA fetch)
2. In `designday2026.astro`, replace the `mockLocations` import with `getLocations()`
3. Replace null logo with `optimizeImage(loc.fields.logo)` using the existing helper
4. Optionally add the client-side schedule refresh `useEffect` to `LocationsSection`
5. Set up Netlify build hook + Contentful webhook for auto-rebuild

---

## Implementation Order

1. Install `react-leaflet`
2. Create `MinimalLayout.astro`
3. Create `src/lib/mockLocations.js` with 6 mock galleries
4. Build `HoursTable.jsx`
5. Build `Lightbox.jsx`
6. Build `LocationsGrid.jsx`
7. Build `LocationsMap.jsx`
8. Build `LocationsSection.jsx` (wires everything together)
9. Create `designday2026.astro` with hero + island
10. Style: apply Design Day palette, hero layout (split desktop / stacked mobile)
