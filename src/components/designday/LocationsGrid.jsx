import LogoPlaceholder from './LogoPlaceholder';

export default function LocationsGrid({ locations, onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-10 max-w-6xl mx-auto">
      {locations.map(loc => (
        <div
          key={loc.id}
          onClick={() => onCardClick(loc.id)}
          onKeyDown={e => e.key === 'Enter' && onCardClick(loc.id)}
          role="button"
          tabIndex={0}
          className="cursor-pointer text-left bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
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
        </div>
      ))}
    </div>
  );
}
