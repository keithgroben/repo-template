interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title || 'Nothing here yet'}</h3>
            {message && <p className="text-sm text-gray-500 max-w-xs">{message}</p>}
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
