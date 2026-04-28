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
