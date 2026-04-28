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
