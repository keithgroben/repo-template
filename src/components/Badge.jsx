const COLORS = {
    Active:   { bg: 'bg-emerald-50',  text: 'text-emerald-700' },
    Inactive: { bg: 'bg-gray-100',    text: 'text-gray-500' },
    Pending:  { bg: 'bg-amber-50',    text: 'text-amber-700' },
    Error:    { bg: 'bg-red-50',      text: 'text-red-700' },
};

export function Badge({ label, colorMap }) {
    const colors = colorMap || COLORS;
    const c = colors[label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
            {label}
        </span>
    );
}
