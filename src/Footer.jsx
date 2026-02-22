import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            marginTop: '4rem',
            padding: '2rem 1rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)'
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Extracted by ANIL MONITOR
                </p>
                <Link to="/about" style={{ color: 'var(--primary)', textDecoration: 'none', margin: '0 0.5rem' }}>About Us</Link>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                <a href="https://instagram.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Instagram
                </a>
                <a href="https://www.youtube.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    YouTube
                </a>
                <a href="https://linkedin.com/in/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    LinkedIn
                </a>
                <a href="https://github.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    GitHub
                </a>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.6 }}>
                &copy; {new Date().getFullYear()} Apna College Delta Project Archive. All rights reserved.
            </p>
        </footer>
    );
}
