# Design Day 2026 Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/designday2026` page showing a hero, an interactive Leaflet map, and a card grid of Belgrade furniture/design galleries with a detail lightbox — all mocked with hardcoded data until Contentful is ready.

**Architecture:** Single React island (`LocationsSection`) owns all shared state (which lightbox is open), rendered with `client:only="react"` inside a minimal Astro layout that has no header or footer. Mock location data lives in a separate file, making the Contentful swap a one-line import change.

**Tech Stack:** Astro 4, React 18, Tailwind CSS 3, react-leaflet (new), leaflet 1.9 (existing), plain JSX (no TypeScript in components)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/layouts/MinimalLayout.astro` | Create | Bare html/head/body, no Header/Footer, no Leaflet CDN |
| `src/lib/mockLocations.js` | Create | 6 hardcoded Belgrade gallery objects |
| `src/components/designday/LogoPlaceholder.jsx` | Create | Initials+color placeholder shown when logo is null |
| `src/components/designday/HoursTable.jsx` | Create | Renders schedule days in Serbian |
| `src/components/designday/Lightbox.jsx` | Create | Full-screen detail overlay, ESC/backdrop to close |
| `src/components/designday/LocationsGrid.jsx` | Create | 3-col card grid, click opens lightbox |
| `src/components/designday/LocationsMap.jsx` | Create | react-leaflet map, terracotta markers, click opens lightbox |
| `src/components/designday/LocationsSection.jsx` | Create | Parent island — owns openId state, wires all children |
| `src/pages/designday2026.astro` | Create | Hero section + LocationsSection island |
| `package.json` | Modify | Add react-leaflet via npm install |

---

## Task 1: Install react-leaflet

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install react-leaflet
```

- [ ] **Step 2: Verify install**

Check `package.json` — `react-leaflet` should appear in `dependencies`. No version conflicts expected (leaflet 1.9.4 + react 18 are both compatible).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-leaflet"
```

---

## Task 2: Create MinimalLayout

**Files:**
- Create: `src/layouts/MinimalLayout.astro`

- [ ] **Step 1: Create the file**

```astro
---
const { title = 'Design Day 2026' } = Astro.props;
---
<!DOCTYPE html>
<html lang="sr-Latn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@700&family=Roboto:wght@100;400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body style="background-color: #F5F0EB; color: #1C1C1A; margin: 0;">
    <slot />
  </body>
</html>
```

Note: Tailwind is injected automatically by `@astrojs/tailwind` — no explicit CSS import needed.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/MinimalLayout.astro
git commit -m "feat: add MinimalLayout for standalone pages"
```

---

## Task 3: Create mock location data

**Files:**
- Create: `src/lib/mockLocations.js`

- [ ] **Step 1: Create the file**

```js
export const mockLocations = [
  {
    id: 'forma-milano',
    name: 'Forma Milano',
    slug: 'forma-milano',
    logo: null,
    shortDescription: 'Savremeni italijanski nameštaj i dekoracija enterijera.',
    longDescription: 'Forma Milano predstavlja vodeće italijanske brendove nameštaja i unutrašnje dekoracije. Specijalizovani smo za dizajnerske komade koji spajaju funkcionalnost i estetiku. Posetite naš showroom i pronađite inspiraciju za vaš dom.',
    address: 'Knez Mihailova 20, 11000 Beograd',
    email: 'info@formamilano.rs',
    phone: '+381 11 3281 200',
    website: 'https://formamilano.rs',
    coordinates: { lat: 44.8185, lon: 20.4573 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '10:00', close: '20:00' },
        { date: '2026-05-16', open: '11:00', close: '19:00' },
      ],
    },
    order: 1,
  },
  {
    id: 'casa-italiana',
    name: 'Casa Italiana',
    slug: 'casa-italiana',
    logo: null,
    shortDescription: 'Ekskluzivni enterijer i dizajnerski dodaci iz Italije.',
    longDescription: 'Casa Italiana donosi duh mediteranskog stila direktno u Beograd. Naša kolekcija obuhvata sve od luksuznih sofa do unikatnih svetiljki i tepiha. Naši stručnjaci za dizajn enterijera su tu da vam pomognu da stvorite savršen prostor.',
    address: 'Terazije 5, 11000 Beograd',
    email: 'kontakt@casaitaliana.rs',
    phone: '+381 11 3243 101',
    website: null,
    coordinates: { lat: 44.8165, lon: 20.4622 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '10:00', close: '19:00' },
        { date: '2026-05-16', open: '12:00', close: '20:00' },
      ],
    },
    order: 2,
  },
  {
    id: 'novolux-design',
    name: 'Novolux Design',
    slug: 'novolux-design',
    logo: null,
    shortDescription: 'Rasveta i dekorativni elementi vrhunskog kvaliteta.',
    longDescription: 'Novolux Design je specijalizovana prodavnica rasvete i dekorativnih elemenata koji transformišu svaki prostor. Iz naše kolekcije biraju arhitekte, dizajneri i zahtevni kupci koji traže jedinstven vizuelni identitet svog doma ili poslovnog prostora.',
    address: 'Bulevar Kralja Aleksandra 48, 11000 Beograd',
    email: 'info@novolux.rs',
    phone: '+381 11 3440 855',
    website: 'https://novolux.rs',
    coordinates: { lat: 44.8156, lon: 20.4699 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '09:00', close: '18:00' },
        { date: '2026-05-16', open: '10:00', close: '18:00' },
      ],
    },
    order: 3,
  },
  {
    id: 'studio-interno',
    name: 'Studio Interno',
    slug: 'studio-interno',
    logo: null,
    shortDescription: 'Autorski nameštaj i predmeti savremenog dizajna.',
    longDescription: 'Studio Interno je boutique galerija koja promoviše autorski pristup dizajnu nameštaja. Svaki komad u našoj ponudi je rezultat saradnje sa talentovanim dizajnerima iz Italije i Srbije. Posetite nas i otkrijte predmete koji pričaju priču.',
    address: 'Skadarska 32, 11000 Beograd',
    email: 'studio@interno.rs',
    phone: null,
    website: 'https://studiointerno.rs',
    coordinates: { lat: 44.8198, lon: 20.4629 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '11:00', close: '21:00' },
        { date: '2026-05-16', open: '11:00', close: '21:00' },
      ],
    },
    order: 4,
  },
  {
    id: 'artefacto-beograd',
    name: 'Artefacto Beograd',
    slug: 'artefacto-beograd',
    logo: null,
    shortDescription: 'Galerija umetničkih predmeta i dizajnerskog nameštaja.',
    longDescription: 'Artefacto Beograd spaja svet umetnosti i funkcionalnog dizajna. Naša galerija predstavlja pažljivo odabrane predmete koji se nalaze na granici između dekoracije i umetničkog dela. Idealno mesto za poklon ili za opremanje posebnog prostora.',
    address: 'Karađorđeva 2, 11000 Beograd',
    email: 'beograd@artefacto.rs',
    phone: '+381 11 2631 044',
    website: null,
    coordinates: { lat: 44.8093, lon: 20.4467 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '10:00', close: '20:00' },
        { date: '2026-05-16', open: '10:00', close: '20:00' },
      ],
    },
    order: 5,
  },
  {
    id: 'spazio-design',
    name: 'Spazio Design',
    slug: 'spazio-design',
    logo: null,
    shortDescription: 'Kompletno opremanje prostora u italijanskom stilu.',
    longDescription: 'Spazio Design nudi kompletan servis dizajna enterijera, od prve konsultacije do finalne realizacije. Naš tim arhitekata i dizajnera specijalizovan je za projekte u mediteranskom i savremenom italijanskom stilu, za stambene i poslovne prostore.',
    address: 'Nemanjina 14, 11000 Beograd',
    email: 'hello@spaziodesign.rs',
    phone: '+381 11 3613 072',
    website: 'https://spaziodesign.rs',
    coordinates: { lat: 44.8074, lon: 20.4626 },
    schedule: {
      days: [
        { date: '2026-05-15', open: '10:00', close: '18:00' },
        { date: '2026-05-16', open: '12:00', close: '20:00' },
      ],
    },
    order: 6,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mockLocations.js
git commit -m "feat: add mock location data for Design Day 2026"
```

---

## Task 4: Create LogoPlaceholder component

**Files:**
- Create: `src/components/designday/LogoPlaceholder.jsx`

- [ ] **Step 1: Create the file**

```jsx
const COLORS = ['#E05A42', '#C04A35', '#8B3A28', '#6B4E3D', '#A05040'];

export default function LogoPlaceholder({ name, size = 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const bg = COLORS[name.charCodeAt(0) % COLORS.length];
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';

  return (
    <div
      style={{ backgroundColor: bg }}
      className={`${sizeClass} rounded flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-bold font-archivo">{initials}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/LogoPlaceholder.jsx
git commit -m "feat: add LogoPlaceholder component"
```

---

## Task 5: Create HoursTable component

**Files:**
- Create: `src/components/designday/HoursTable.jsx`

- [ ] **Step 1: Create the file**

```jsx
const DAY_NAMES = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];

export default function HoursTable({ schedule }) {
  if (!schedule?.days?.length) return null;

  return (
    <table className="w-full text-sm mt-2">
      <tbody>
        {schedule.days.map(d => {
          // Use noon to avoid DST / timezone edge cases
          const date = new Date(d.date + 'T12:00:00');
          const dayName = DAY_NAMES[date.getDay()];
          const dd = String(date.getDate()).padStart(2, '0');
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return (
            <tr key={d.date} className="border-t border-gray-200">
              <td className="py-1 pr-6 text-gray-600">{dayName}, {dd}.{mm}.</td>
              <td className="py-1 font-medium">{d.open}–{d.close}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/HoursTable.jsx
git commit -m "feat: add HoursTable component"
```

---

## Task 6: Create Lightbox component

**Files:**
- Create: `src/components/designday/Lightbox.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useEffect } from 'react';
import HoursTable from './HoursTable';
import LogoPlaceholder from './LogoPlaceholder';

export default function Lightbox({ location, onClose }) {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28, 28, 26, 0.80)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="flex items-start gap-4">
          <LogoPlaceholder name={location.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-archivo font-bold text-2xl leading-tight" style={{ color: '#1C1C1A' }}>
              {location.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{location.shortDescription}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none flex-shrink-0 -mt-1"
            aria-label="Zatvori"
          >
            ×
          </button>
        </div>

        {/* Long description */}
        <p className="text-sm text-gray-700 leading-relaxed">{location.longDescription}</p>

        {/* Contact details */}
        <div className="text-sm flex flex-col gap-2">
          <div>
            <span className="font-semibold">Adresa: </span>
            {location.address}
          </div>
          <div>
            <span className="font-semibold">E-pošta: </span>
            <a href={`mailto:${location.email}`} style={{ color: '#E05A42' }} className="hover:underline">
              {location.email}
            </a>
          </div>
          {location.phone && (
            <div>
              <span className="font-semibold">Telefon: </span>
              <a href={`tel:${location.phone}`} style={{ color: '#E05A42' }} className="hover:underline">
                {location.phone}
              </a>
            </div>
          )}
          {location.website && (
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#E05A42' }}
              className="hover:underline font-semibold"
            >
              Sajt →
            </a>
          )}
        </div>

        {/* Schedule */}
        {location.schedule && (
          <div>
            <h3 className="font-semibold text-sm">Radno vreme</h3>
            <HoursTable schedule={location.schedule} />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-2 py-2 px-6 rounded font-archivo font-bold text-white self-start transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#E05A42' }}
        >
          Zatvori
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/Lightbox.jsx
git commit -m "feat: add Lightbox component"
```

---

## Task 7: Create LocationsGrid component

**Files:**
- Create: `src/components/designday/LocationsGrid.jsx`

- [ ] **Step 1: Create the file**

```jsx
import LogoPlaceholder from './LogoPlaceholder';

export default function LocationsGrid({ locations, onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-10 max-w-6xl mx-auto">
      {locations.map(loc => (
        <button
          key={loc.id}
          onClick={() => onCardClick(loc.id)}
          className="text-left bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
        >
          <LogoPlaceholder name={loc.name} />
          <h3 className="font-archivo font-bold text-lg" style={{ color: '#1C1C1A' }}>
            {loc.name}
          </h3>
          <p className="text-sm text-gray-600 flex-1">{loc.shortDescription}</p>
          <address className="text-xs text-gray-500 not-italic">{loc.address}</address>
          <a
            href={`mailto:${loc.email}`}
            onClick={e => e.stopPropagation()}
            className="text-xs hover:underline"
            style={{ color: '#E05A42' }}
          >
            {loc.email}
          </a>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/LocationsGrid.jsx
git commit -m "feat: add LocationsGrid component"
```

---

## Task 8: Create LocationsMap component

**Files:**
- Create: `src/components/designday/LocationsMap.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pin = L.divIcon({
  className: '',
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 9.6 14 24 14 24s14-14.4 14-24C28 6.3 21.7 0 14 0z"
      fill="#E05A42" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -38],
});

export default function LocationsMap({ locations, onMarkerClick }) {
  const center = [44.8125, 20.4612];

  return (
    <div style={{ height: '450px', width: '100%' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {locations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.coordinates.lat, loc.coordinates.lon]}
            icon={pin}
            eventHandlers={{ click: () => onMarkerClick(loc.id) }}
          >
            <Popup>
              <strong>{loc.name}</strong><br />{loc.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/LocationsMap.jsx
git commit -m "feat: add LocationsMap component"
```

---

## Task 9: Create LocationsSection (parent island)

**Files:**
- Create: `src/components/designday/LocationsSection.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useState } from 'react';
import LocationsMap from './LocationsMap';
import LocationsGrid from './LocationsGrid';
import Lightbox from './Lightbox';

export default function LocationsSection({ locations }) {
  const [openId, setOpenId] = useState(null);
  const open = openId ? locations.find(l => l.id === openId) ?? null : null;

  return (
    <div>
      <LocationsMap locations={locations} onMarkerClick={setOpenId} />
      <LocationsGrid locations={locations} onCardClick={setOpenId} />
      {open && <Lightbox location={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/designday/LocationsSection.jsx
git commit -m "feat: add LocationsSection parent island"
```

---

## Task 10: Create designday2026.astro page

**Files:**
- Create: `src/pages/designday2026.astro`

- [ ] **Step 1: Create the file**

```astro
---
import MinimalLayout from '../layouts/MinimalLayout.astro';
import LocationsSection from '../components/designday/LocationsSection.jsx';
import { mockLocations } from '../lib/mockLocations.js';

const locations = [...mockLocations].sort((a, b) => a.order - b.order);
---
<MinimalLayout title="Design Day 2026">

  <!-- Hero -->
  <section style="background-color: #F5F0EB;">
    <div class="max-w-6xl mx-auto flex flex-col-reverse md:flex-row min-h-[65vh]">

      <!-- Left: text -->
      <div class="flex flex-col justify-center px-8 py-12 md:w-1/2 gap-5">
        <p class="font-archivo uppercase text-xs tracking-widest" style="color: #E05A42;">
          Giornata del design italiano u svetu 2026
        </p>
        <h1 class="font-archivo font-bold text-4xl md:text-5xl leading-tight" style="color: #1C1C1A;">
          RE-DIZAJN:
        </h1>
        <p class="font-roboto font-light text-2xl md:text-3xl leading-snug" style="color: #1C1C1A;">
          regenerisati prostore, objekte, ideje, odnose
        </p>
        <p class="font-roboto text-lg" style="color: #1C1C1A;">
          4. maj 2026, 17:30
        </p>
        <p class="font-roboto text-sm text-gray-500">
          Rezidencija Ambasadora Italije, Birčaninova 9a
        </p>
        <a
          href="/"
          class="font-archivo uppercase tracking-widest text-xs mt-2 hover:opacity-70 transition-opacity self-start"
          style="color: #E05A42;"
        >
          ← ITA Beograd
        </a>
      </div>

      <!-- Right: invitation image -->
      <div class="md:w-1/2">
        <img
          src="/designday2026.jpg"
          alt="Design Day 2026 — pozivnica"
          class="w-full h-full object-cover object-top"
        />
      </div>

    </div>
  </section>

  <!-- Section label -->
  <div class="max-w-6xl mx-auto px-6 pt-10">
    <h2 class="font-archivo font-bold uppercase tracking-widest text-sm" style="color: #E05A42;">
      Učesnici
    </h2>
    <div class="h-px mt-2" style="background-color: #E05A42; opacity: 0.3;"></div>
  </div>

  <!-- Interactive map + grid -->
  <LocationsSection client:only="react" locations={locations} />

</MinimalLayout>
```

- [ ] **Step 2: Start dev server and verify the page loads**

```bash
npm run dev
```

Open `http://localhost:4321/designday2026` in a browser.

Expected:
- Hero section visible with text on left, image on right (desktop) / image on top (mobile)
- "← ITA Beograd" link present in accent color
- Map renders at 450px height with 6 terracotta markers
- Card grid shows 6 gallery cards with initials placeholders
- Clicking a card opens the lightbox
- Clicking a marker opens the lightbox for that location
- ESC key closes the lightbox
- Clicking the dark backdrop closes the lightbox
- "Zatvori" button closes the lightbox
- Hours table shows Serbian day names and formatted dates

- [ ] **Step 3: Commit**

```bash
git add src/pages/designday2026.astro
git commit -m "feat: add /designday2026 page with hero, map, and gallery grid"
```

---

## Contentful Migration Checklist (for later)

When the `Location` content type is created in Contentful:

1. Add `getLocations()` to `src/lib/contentful.js`:
```js
export async function getLocations() {
  const entries = await contentfulClient.getEntries({
    content_type: 'location',
    order: 'fields.order',
  });
  return entries.items.map(item => ({
    id: item.sys.id,
    ...item.fields,
    logo: item.fields.logo ? optimizeImage(item.fields.logo, { width: 200, height: 200 }) : null,
    coordinates: {
      lat: item.fields.coordinates.lat,
      lon: item.fields.coordinates.lon,
    },
  }));
}
```

2. In `designday2026.astro`, replace:
```js
import { mockLocations } from '../lib/mockLocations.js';
const locations = [...mockLocations].sort((a, b) => a.order - b.order);
```
with:
```js
import { getLocations } from '../lib/contentful.js';
const locations = await getLocations();
```

3. Replace `logo: null` logic in `LogoPlaceholder` and `LocationsGrid` / `Lightbox` — when `loc.logo` is not null, render `<img src={loc.logo.src} ... />` instead of `<LogoPlaceholder>`.
