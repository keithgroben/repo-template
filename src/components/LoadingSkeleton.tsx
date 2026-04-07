interface LoadingSkeletonProps {
    lines?: number;
    className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 rounded-lg animate-pulse"
                    style={{ width: `${85 - i * 15}%` }}
                />
            ))}
        </div>
    );
}
