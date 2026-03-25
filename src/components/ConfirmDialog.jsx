export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" style={{ animation: 'fadeUp 0.35s ease-out both' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title || 'Confirm'}</h3>
                <p className="text-sm text-gray-600 mb-6">{message || 'Are you sure?'}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        {confirmLabel || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
