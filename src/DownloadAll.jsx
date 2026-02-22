import React, { useState } from 'react';
import videosData from './videos.json';
import { formatBytes } from './utils';

export default function DownloadAll() {
    const [downloading, setDownloading] = useState(null);

    const handleDownloadPart = async (start, end, partNum) => {
        if (!window.confirm(`This will download ${end - start} videos sequentially directly into your Downloads folder. \n\nPlease allow your browser to download multiple files when prompted.`)) return;

        setDownloading(partNum);
        try {
            for (let i = start; i < end; i++) {
                const video = videosData[i];
                if (!video || !video.mp4Url) continue;

                // Fetch the video client-side one-by-one.
                const res = await fetch(video.mp4Url);
                if (!res.ok) continue;

                const blob = await res.blob();
                const localBlobUrl = URL.createObjectURL(blob);

                const safeName = video.title.replace(/[^a-z0-9\s]/gi, '').trim() || `video_${i + 1}`;
                const filename = `${String(i + 1).padStart(3, '0')}_${safeName}.mp4`;

                const a = document.createElement('a');
                a.href = localBlobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Keep the object in memory for a short time so browser can read it, then clean up
                setTimeout(() => URL.revokeObjectURL(localBlobUrl), 15000);

                // Pause for 1 second between files
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error("Batch download error:", err);
            alert("An error occurred during batch download: " + err.message);
        } finally {
            setDownloading(null);
        }
    };

    const parts = [
        { label: 'Part 1 (Videos 1 to 56)', start: 0, end: 56 },
        { label: 'Part 2 (Videos 57 to 112)', start: 56, end: 112 },
        { label: 'Part 3 (Videos 113 to 168)', start: 112, end: 168 },
        { label: 'Part 4 (Videos 169 to 204)', start: 168, end: 204 },
        { label: 'Part 5 (Videos 205 to 224)', start: 204, end: 224 }
    ];

    return (
        <div className="app-container" style={{ animation: 'fadeIn 0.6s ease-out both' }}>
            <header>
                <h1>Complete Course Archive</h1>
                <p className="header-subtitle">Download all {videosData.length} video lectures separated into 5 manageable ZIP bundles.</p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
                <div className="video-card" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem 2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Full Course Bundles</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                            To make downloading robust, the {videosData.length} videos have been split into 5 <code style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>MP4 BATCHES</code>. Clicking one will download the videos directly to your device sequentially.
                            <br /><br />
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Total course size: {formatBytes(videosData.reduce((acc, curr) => acc + (curr.size || 0), 0))}</span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {parts.map((p, i) => {
                            const partSize = videosData.slice(p.start, p.end).reduce((acc, curr) => acc + (curr.size || 0), 0);
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.label}</h3>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Size: {formatBytes(partSize)}</span>
                                    </div>
                                    <button
                                        className="download-btn"
                                        onClick={() => handleDownloadPart(p.start, p.end, i + 1)}
                                        disabled={downloading !== null && downloading !== i + 1}
                                        style={{ padding: '0.8rem 1.5rem', opacity: (downloading !== null && downloading !== i + 1) ? 0.5 : 1 }}
                                    >
                                        {downloading === i + 1 ? (
                                            <>
                                                <span className="loader" style={{ width: '16px', height: '16px' }}></span>
                                                Preparing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                Download Bundle
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
