import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { HomeView } from './views/Home';
import './index.css';

function App() {
    const [route, setRoute] = useState(location.hash.slice(1) || 'home');

    useEffect(() => {
        const handler = () => setRoute(location.hash.slice(1) || 'home');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const [view, param] = route.includes('/')
        ? [route.split('/')[0], route.split('/')[1]]
        : [route, null];

    const renderView = () => {
        switch (view) {
            case 'detail': return <DetailView id={param} />;
            default:       return <HomeView />;
        }
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <a href="#home" className="text-base font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
                    App Name
                </a>
                <nav className="flex items-center gap-4">
                    <a
                        href="#home"
                        className={`text-sm transition-colors ${view === 'home' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Home
                    </a>
                </nav>
            </header>
            <main>
                {renderView()}
            </main>
        </div>
    );
}

function DetailView({ id }) {
    return (
        <div className="max-w-3xl mx-auto p-6" style={{ animation: 'fadeUp 0.35s ease-out both' }}>
            <a href="#home" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                &larr; Back to dashboard
            </a>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Detail View</h1>
                <p className="text-sm text-gray-500 mb-4">Viewing item <strong>{id}</strong></p>
            </div>
        </div>
    );
}

render(<App />, document.getElementById('app'));
