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
