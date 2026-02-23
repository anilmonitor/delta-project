import React, { useState, useRef, useEffect } from 'react';
import sigmaVideos from './sigma_videos.json';
import { formatBytes } from './utils';

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

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, downloaded, total, speed }) {
    const clampedPct = Math.min(100, Math.max(0, pct));
    const eta = speed > 0 && total > 0
        ? Math.ceil((total - downloaded) / speed)
        : null;
    return (
        <div style={{ marginTop: '0.7rem', width: '100%' }}>
            {/* Bar track */}
            <div style={{
                width: '100%', height: '8px', borderRadius: '99px',
                background: 'rgba(99,102,241,0.15)',
                overflow: 'hidden', position: 'relative',
            }}>
                <div style={{
                    height: '100%',
                    width: `${clampedPct}%`,
                    borderRadius: '99px',
                    background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',
                    transition: 'width 0.25s ease',
                    boxShadow: '0 0 10px rgba(99,102,241,0.6)',
                }} />
            </div>
            {/* Labels */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
            }}>
                <span>
                    {formatBytes(downloaded)} / {formatBytes(total)}
                    {speed > 0 && (
                        <span style={{ marginLeft: '0.5rem', color: '#818cf8' }}>
                            @ {formatBytes(speed)}/s
                        </span>
                    )}
                </span>
                <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.82rem' }}>
                    {clampedPct.toFixed(1)}%
                    {eta !== null && (
                        <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                            ~{eta < 60 ? `${eta}s` : `${Math.ceil(eta / 60)}m`} left
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}

// ─── Single Video Card ────────────────────────────────────────────────────────
function SigmaVideoItem({ video, index, previewOnly = false }) {
    const [status, setStatus] = useState('idle'); // idle | downloading | done | error
    const [errorMsg, setErrorMsg] = useState('');
    const [progress, setProgress] = useState({ pct: 0, downloaded: 0, total: 0, speed: 0 });

    const wistiaId = getWistiaId(video.url);
    const watchUrl = wistiaId ? `https://fast.wistia.com/medias/${wistiaId}` : null;
    const hasMp4 = Boolean(video.mp4Url);

    const handleDownload = async () => {
        setStatus('downloading');
        setErrorMsg('');
        setProgress({ pct: 0, downloaded: 0, total: 0, speed: 0 });

        try {
            let mp4Url = video.mp4Url;

            // Fallback: try to resolve on-the-fly via Wistia public metadata
            if (!mp4Url && wistiaId) {
                const metaRes = await fetch(
                    `https://fast.wistia.com/embed/medias/${wistiaId}.json`
                );
                if (metaRes.ok) {
                    const meta = await metaRes.json();
                    const assets = meta?.media?.assets ?? [];
                    const original = assets.find(a => a.type === 'original');
                    const mp4s = assets.filter(
                        a => a.container === 'mp4' || a.ext === 'mp4' || a.codec === 'h264'
                    );
                    mp4s.sort((a, b) => (b.width || 0) - (a.width || 0));
                    const best = original || mp4s[0];
                    if (best) mp4Url = best.url;
                }
            }

            if (!mp4Url) {
                throw new Error(
                    'No downloadable MP4 found.\nUse the Watch button to view this video online.'
                );
            }

            // ── Streamed fetch with progress tracking ──────────────────────
            const resp = await fetch(mp4Url);
            if (!resp.ok) throw new Error(`Server returned ${resp.status}. The link may have expired.`);

            const contentLength = Number(resp.headers.get('Content-Length')) || video.size || 0;
            const reader = resp.body.getReader();
            const chunks = [];
            let received = 0;
            let startTime = Date.now();
            let lastTime = startTime;
            let lastReceived = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;

                const now = Date.now();
                const elapsed = (now - lastTime) / 1000; // seconds since last speed update
                let speed = 0;
                if (elapsed >= 0.5) {
                    speed = (received - lastReceived) / elapsed;
                    lastTime = now;
                    lastReceived = received;
                }

                const pct = contentLength > 0 ? (received / contentLength) * 100 : 0;
                setProgress(prev => ({
                    pct,
                    downloaded: received,
                    total: contentLength,
                    speed: elapsed >= 0.5 ? speed : prev.speed,
                }));
            }

            // Reassemble and trigger save
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${video.title.replace(/[^a-z0-9\s]/gi, '').trim() || `lecture_${index + 1}`}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);

            setProgress(p => ({ ...p, pct: 100 }));
            setStatus('done');
            setTimeout(() => { setStatus('idle'); setProgress({ pct: 0, downloaded: 0, total: 0, speed: 0 }); }, 3500);
        } catch (err) {
            console.error('Download error:', err);
            setErrorMsg(err.message);
            setStatus('error');
            setProgress({ pct: 0, downloaded: 0, total: 0, speed: 0 });
        }
    };

    // ---- size badge ----
    const sizeBadge = video.size
        ? formatBytes(video.size)
        : hasMp4
            ? 'Size pending'
            : '–';

    const sizeColor = video.size
        ? 'var(--text-secondary)'
        : '#64748b';

    return (
        <div
            className="video-card"
            style={{
                animationDelay: `${(index % 10) * 0.05}s`,
                flexDirection: 'column',      /* stack vertically when progress bar shows */
                alignItems: 'stretch',
            }}
        >
            {/* Top row: index + title + buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                {/* Left */}
                <div className="video-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="video-index">{index + 1}</div>
                    <div style={{ minWidth: 0 }}>
                        <h3 className="video-title">{video.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                            {/* Size */}
                            <span style={{
                                fontSize: '0.82rem', color: sizeColor,
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                {sizeBadge}
                            </span>
                            {/* Wistia ID */}
                            <span style={{ fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace' }}>
                                {wistiaId || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: error + buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                    {status === 'error' && (
                        <span style={{
                            color: '#ef4444', fontSize: '0.78rem',
                            maxWidth: '200px', textAlign: 'right', whiteSpace: 'pre-line',
                        }}>
                            {errorMsg}
                        </span>
                    )}

                    {/* Watch Online */}
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
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch
                        </a>
                    )}

                    {/* Download — hidden for the preview lecture */}
                    {previewOnly ? (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
                            fontWeight: 600, color: '#f87171',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            whiteSpace: 'nowrap',
                        }}>
                            🔒 Preview Only
                        </span>
                    ) : (
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                            disabled={status === 'downloading'}
                            style={{
                                ...(status === 'done'
                                    ? { background: 'linear-gradient(135deg,#10b981,#059669)' }
                                    : !hasMp4 ? { opacity: 0.7 } : {}),
                                minWidth: '160px',
                            }}
                            title={!hasMp4 ? 'MP4 not yet resolved — will try live fetch' : `Download ${sizeBadge}`}
                        >
                            {status === 'downloading' ? (
                                <>
                                    <span className="loader" />
                                    {progress.pct > 0 ? `${progress.pct.toFixed(1)}%` : 'Starting…'}
                                </>
                            ) : status === 'done' ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download {video.size ? `(${formatBytes(video.size)})` : 'MP4'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar — only visible while downloading */}
            {status === 'downloading' && (
                <ProgressBar
                    pct={progress.pct}
                    downloaded={progress.downloaded}
                    total={progress.total || video.size || 0}
                    speed={progress.speed}
                />
            )}
        </div>
    );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ query, onChange }) {
    return (
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            <svg
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.45, pointerEvents: 'none' }}
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
                    width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.8rem',
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
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1, padding: 0,
                    }}
                >✕</button>
            )}
        </div>
    );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ total, shown }) {
    const withMp4 = sigmaVideos.filter(v => v.mp4Url).length;

    return (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
                { label: 'Total Lectures', value: total, icon: '🎬' },
                { label: 'Showing', value: shown, icon: '🔍' },
                { label: 'Downloadable', value: withMp4, icon: '✅' },
                { label: 'Stack', value: 'MERN', icon: '💻' },
            ].map(s => (
                <div key={s.label} style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '0.75rem 1.5rem', textAlign: 'center', minWidth: '110px',
                }}>
                    <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.label}</div>
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
            <header>
                <h1 style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Apna College SIGMA 9.0 — MERN Stack
                </h1>
                <p className="header-subtitle">
                    All {sigmaVideos.length} lecture videos · Watch online or download MP4 directly to your device.
                </p>

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
                        These video links are temporary. Save them to your device immediately to avoid losing access!
                    </p>
                </div>
            </header>

            <StatsBar total={sigmaVideos.length} shown={filtered.length} />
            <SearchBar query={query} onChange={setQuery} />

            {/* ── Preview video (lecture 0) ──────────────────────────────── */}
            {sigmaVideos[0]?.mp4Url && (
                <div style={{ marginBottom: '2.5rem', marginTop: '-0.5rem' }}>
                    {/* Label */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        marginBottom: '0.75rem', justifyContent: 'center',
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', padding: '0.25rem 0.9rem',
                            borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                        }}>🎬 Preview</span>
                        <h2 style={{
                            margin: 0, fontSize: '1.15rem',
                            color: 'var(--text-primary)', fontWeight: 600,
                        }}>
                            {sigmaVideos[0].title}
                        </h2>
                        <span style={{
                            background: 'rgba(239,68,68,0.12)',
                            color: '#f87171', padding: '0.2rem 0.75rem',
                            borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                            border: '1px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                            🔒 Download disabled
                        </span>
                    </div>

                    {/* Player wrapper */}
                    <div style={{
                        borderRadius: '14px', overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 12px 40px -8px rgba(99,102,241,0.35)',
                        maxWidth: '860px', margin: '0 auto',
                        position: 'relative',
                    }}>
                        <video
                            src={sigmaVideos[0].mp4Url}
                            controls
                            controlsList="nodownload"
                            onContextMenu={e => e.preventDefault()}
                            style={{ width: '100%', display: 'block', background: '#000' }}
                            poster=""
                        />
                    </div>
                </div>
            )}


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
