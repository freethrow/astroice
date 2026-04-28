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
