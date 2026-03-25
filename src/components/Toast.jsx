// Toast is imperative (outside Preact) — called via Toast.success(), Toast.error(), etc.
// Import this file once in index.jsx to initialize.

const COLORS = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
    warning: 'bg-amber-500 text-gray-900',
};

export const Toast = {
    show(message, type = 'success', duration = 3500) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `${COLORS[type] || COLORS.info} text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium max-w-sm`;
        toast.style.animation = 'slideIn 0.25s ease-out';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease-in forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg)   { this.show(msg, 'error'); },
    info(msg)    { this.show(msg, 'info'); },
    warning(msg) { this.show(msg, 'warning'); },
};

// Make available globally for convenience
window.Toast = Toast;
