import React, { useState, useRef, useEffect } from 'react';
import sigmaVideos from './sigma_videos.json';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWistiaId(url) {
    const match = url && url.match(/\/medias\/([a-zA-Z0-9]+)\./);
    return match ? match[1] : null;
}

// ─── Ad Banner ────────────────────────────────────────────────────────────────
function AdBanner() {
    const banner = useRef(null);
    useEffect(() => {
        if (!banner.current || banner.current.firstChild) return;
        const conf = document.createElement('script');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.highperformanceformat.com/0d401675cc48579a59d4ba8c1fb0d6b7/invoke.js';
        conf.type = 'text/javascript';
        conf.innerHTML = `atOptions = {
      'key' : '0d401675cc48579a59d4ba8c1fb0d6b7',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };`;
        banner.current.append(conf);
        banner.current.append(script);
    }, []);
    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0 3rem 0', width: '100%' }}>
            <div ref={banner} style={{ transform: 'scale(0.8)', transformOrigin: 'top center', maxHeight: '200px' }} />
        </div>
    );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function SigmaVideoItem({ video, index }) {
    const [status, setStatus] = useState('idle'); // idle | downloading | done | error
    const [errorMsg, setErrorMsg] = useState('');

    const wistiaId = getWistiaId(video.url);
    const watchUrl = wistiaId
        ? `https://fast.wistia.com/medias/${wistiaId}`
        : null;

    const handleDownload = async () => {
        if (!wistiaId) { setErrorMsg('Invalid Wistia ID'); setStatus('error'); return; }
        setStatus('downloading');
        setErrorMsg('');
        try {
            // Try to resolve the best MP4 from Wistia's public JSON metadata
            const metaRes = await fetch(`https://fast.wistia.com/embed/medias/${wistiaId}.json`);
            if (!metaRes.ok) throw new Error('Could not reach Wistia metadata');
            const meta = await metaRes.json();

            // Collect all MP4 assets and pick highest resolution
            const assets = meta?.media?.assets ?? [];
            const mp4s = assets.filter(a => a.type === 'original' || a.container === 'mp4' || (a.ext === 'mp4'));
            if (!mp4s.length) throw new Error('No downloadable MP4 found for this video.\nTry the Watch button to view it online.');

            mp4s.sort((a, b) => (b.width || 0) - (a.width || 0));
            const best = mp4s[0];
            const mp4Url = best.url;

            const resp = await fetch(mp4Url);
            if (!resp.ok) throw new Error('Video stream blocked or timed out');
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${video.title.replace(/[^a-z0-9\s]/gi, '').trim() || `lecture_${index + 1}`}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            setStatus('done');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="video-card" style={{ animationDelay: `${(index % 10) * 0.05}s` }}>
            <div className="video-info">
                <div className="video-index">{index + 1}</div>
                <div>
                    <h3 className="video-title">{video.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        ID: {wistiaId || 'N/A'}
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {status === 'error' && (
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', maxWidth: '200px', textAlign: 'right', whiteSpace: 'pre-line' }}>
                        {errorMsg}
                    </span>
                )}
                {/* Watch Online button */}
                {watchUrl && (
                    <a
                        href={watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.9rem',
                            fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
                            background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.3)',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch
                    </a>
                )}
                {/* Download button */}
                <button
                    className="download-btn"
                    onClick={handleDownload}
                    disabled={status === 'downloading'}
                    style={status === 'done' ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}}
                >
                    {status === 'downloading' ? (
                        <><span className="loader" />Downloading…</>
                    ) : status === 'done' ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download MP4
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Filter / Search bar ──────────────────────────────────────────────────────
function SearchBar({ query, onChange }) {
    return (
        <div style={{
            position: 'relative', maxWidth: '500px', margin: '0 auto 2rem auto',
        }}>
            <svg
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }}
                xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                placeholder="Search lectures…"
                value={query}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                    borderRadius: '10px', border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)', color: 'var(--text-primary)',
                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            {query && (
                <button
                    onClick={() => onChange('')}
                    style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                        fontSize: '1.1rem', lineHeight: 1, padding: 0,
                    }}
                >✕</button>
            )}
        </div>
    );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ total, shown }) {
    return (
        <div style={{
            display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: '2rem',
        }}>
            {[
                { label: 'Total Lectures', value: total, icon: '🎬' },
                { label: 'Showing', value: shown, icon: '🔍' },
                { label: 'Course', value: 'SIGMA 9.0', icon: '⚡' },
                { label: 'Stack', value: 'MERN', icon: '💻' },
            ].map(s => (
                <div key={s.label} style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '0.75rem 1.5rem', textAlign: 'center',
                    minWidth: '110px',
                }}>
                    <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.label}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Sigma() {
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? sigmaVideos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()))
        : sigmaVideos;

    return (
        <div className="app-container">
            {/* Header */}
            <header>
                <h1 style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Apna College SIGMA 9.0 — MERN Stack
                </h1>
                <p className="header-subtitle">
                    All {sigmaVideos.length} lecture videos by Apna College. Watch online or download MP4 in one click.
                </p>

                {/* Warning */}
                <div style={{
                    marginTop: '1.5rem', padding: '1rem 1.5rem',
                    background: 'rgba(239,68,68,0.1)', border: '2px dashed #ef4444',
                    borderRadius: '12px', display: 'inline-block', maxWidth: '800px',
                }}>
                    <h2 style={{ color: '#ef4444', fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span role="img" aria-label="warning">⚠️</span>
                        DOWNLOAD ALL LECTURES BEFORE THEY EXPIRE!
                        <span role="img" aria-label="warning">⚠️</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 500, marginBottom: 0 }}>
                        These video links are temporary and will be removed soon. Save them to your device immediately!
                    </p>
                </div>
            </header>

            {/* Stats */}
            <StatsBar total={sigmaVideos.length} shown={filtered.length} />

            {/* Search */}
            <SearchBar query={query} onChange={setQuery} />

            <AdBanner />

            {/* Video list */}
            <main className="video-list">
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <p>No lectures found for "<strong>{query}</strong>"</p>
                    </div>
                ) : (
                    filtered.map((video, i) => (
                        <React.Fragment key={video.url + i}>
                            <SigmaVideoItem video={video} index={i} />
                            {(i + 1) % 5 === 0 && (
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                                    <a
                                        href="https://www.effectivegatecpm.com/xhbwufw17?key=e5c036ac8f77ae8e4cabf6cd365aca39"
                                        target="_blank" rel="noreferrer"
                                        style={{ color: '#60a5fa', fontSize: '0.9rem', textDecoration: 'none', padding: '0.4rem 1rem', display: 'inline-block' }}
                                    >
                                        don't click me 😂
                                    </a>
                                </div>
                            )}
                        </React.Fragment>
                    ))
                )}
            </main>
        </div>
    );
}
