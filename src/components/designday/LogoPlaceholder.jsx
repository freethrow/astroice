const COLORS = ['#E05A42', '#C04A35', '#8B3A28', '#6B4E3D', '#A05040'];

export default function LogoPlaceholder({ name, logo, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';

  if (logo) {
    const logos = Array.isArray(logo) ? logo : [logo];
    return (
      <div className="flex gap-2 flex-shrink-0 items-center">
        {logos.map(src => (
          <img
            key={src}
            src={src}
            alt={name}
            className={`${sizeClass} object-contain rounded`}
          />
        ))}
      </div>
    );
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const bg = COLORS[name.charCodeAt(0) % COLORS.length];

  return (
    <div
      style={{ backgroundColor: bg }}
      className={`${sizeClass} rounded flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-bold font-archivo">{initials}</span>
    </div>
  );
}
