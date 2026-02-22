import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);

const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

export default function Navbar() {
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <nav style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            marginBottom: '2rem',
            background: 'var(--card-bg)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link
                    to="/"
                    style={{
                        color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderBottom: location.pathname === '/' ? '2px solid var(--primary)' : '2px solid transparent',
                        paddingBottom: '0.25rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Home
                </Link>
                <Link
                    to="/download-all"
                    style={{
                        color: location.pathname === '/download-all' ? 'var(--primary)' : 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderBottom: location.pathname === '/download-all' ? '2px solid var(--primary)' : '2px solid transparent',
                        paddingBottom: '0.25rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Download ZIP
                </Link>
                <Link
                    to="/about"
                    style={{
                        color: location.pathname === '/about' ? 'var(--primary)' : 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderBottom: location.pathname === '/about' ? '2px solid var(--primary)' : '2px solid transparent',
                        paddingBottom: '0.25rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    About Us
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <a href="https://github.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', transition: 'color 0.2s ease' }}>
                    <GithubIcon />
                </a>
                <a href="https://linkedin.com/in/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', transition: 'color 0.2s ease' }}>
                    <LinkedinIcon />
                </a>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </nav>
    );
}
