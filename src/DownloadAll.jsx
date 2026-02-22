import React, { useState } from 'react';
import videosData from './videos.json';

export default function DownloadAll() {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    const handleDownloadZip = () => {
        setDownloading(true);
        setError(null);
        try {
            // Trigger the backend download zip endpoint
            window.location.href = '/api/download-zip';
        } catch (err) {
            setError(err.message);
        } finally {
            // Keep it true for aesthetics, assuming the zip download prompts in browser
            setTimeout(() => setDownloading(false), 5000);
        }
    };

    return (
        <div className="app-container" style={{ animation: 'fadeIn 0.6s ease-out both' }}>
            <header>
                <h1>Complete Course Archive</h1>
                <p className="header-subtitle">Download all {videosData.length} video lectures with titles and serial numbers in a single ZIP file.</p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
                <div className="video-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem 2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Full Course Bundle</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        This will package all <strong>{videosData.length}</strong> videos into a single <code style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>ZIP FORMAT</code> file.
                        <br /><br />
                        Because of the immense file size, the download will begin streaming directly to your local computer. It may take some time depending on your internet connection. Plase do not close the window while it is downloading.
                    </p>

                    <button
                        className="download-btn"
                        onClick={handleDownloadZip}
                        disabled={downloading}
                        style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', margin: '1rem auto 0 auto', width: 'fit-content' }}
                    >
                        {downloading ? (
                            <>
                                <span className="loader" style={{ width: '18px', height: '18px' }}></span>
                                Preparing ZIP Stream...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download All ({videosData.length} Videos) File
                            </>
                        )}
                    </button>

                    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                </div>
            </main>
        </div>
    );
}
