import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    return (
        <nav style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1rem'
        }}>
            <Link
                to="/"
                style={{
                    color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderBottom: location.pathname === '/' ? '2px solid var(--primary)' : 'none',
                    paddingBottom: '0.25rem'
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
                    borderBottom: location.pathname === '/download-all' ? '2px solid var(--primary)' : 'none',
                    paddingBottom: '0.25rem'
                }}
            >
                Download Full ZIP
            </Link>
        </nav>
    );
}
