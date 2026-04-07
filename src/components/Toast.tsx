// Toast is imperative (outside Preact) — called via Toast.success(), Toast.error(), etc.
// Import this file once in index.tsx to initialize.

type ToastType = 'success' | 'error' | 'info' | 'warning';

const COLORS: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
    warning: 'bg-amber-500 text-gray-900',
};

export const Toast = {
    show(message: string, type: ToastType = 'success', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `${COLORS[type]} text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium max-w-sm`;
        toast.style.animation = 'slideIn 0.25s ease-out';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease-in forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    },
    success(msg: string) { this.show(msg, 'success'); },
    error(msg: string)   { this.show(msg, 'error'); },
    info(msg: string)    { this.show(msg, 'info'); },
    warning(msg: string) { this.show(msg, 'warning'); },
};

// Make available globally for convenience
(window as unknown as Record<string, unknown>).Toast = Toast;
