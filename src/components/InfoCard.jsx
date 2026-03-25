export function InfoCard({ label, value, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
            {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
    );
}
