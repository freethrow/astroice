import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationsMap({ locations, onMarkerClick }) {
  const center = [44.8125, 20.4612];

  const pin = useMemo(() => L.divIcon({
    className: '',
    html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 9.6 14 24 14 24s14-14.4 14-24C28 6.3 21.7 0 14 0z"
      fill="#E05A42" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38],
  }), []);

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
