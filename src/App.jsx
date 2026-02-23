import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import videosData from './videos.json';
import Navbar from './Navbar';
import DownloadAll from './DownloadAll';
import AboutUs from './AboutUs';
import Footer from './Footer';
import Sigma from './Sigma';
import { formatBytes } from './utils';

// Helper to extract Wistia ID from URL like "https://fast.wistia.com/embed/medias/ocl4ate6f4.m3u8"
function getWistiaId(url) {
  const match = url.match(/\/medias\/([a-zA-Z0-9]+)\./);
  return match ? match[1] : null;
}

function AdBanner() {
  const banner = useRef(null);

  useEffect(() => {
    if (!banner.current || banner.current.firstChild) return;

    const conf = document.createElement('script');
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = "//www.highperformanceformat.com/0d401675cc48579a59d4ba8c1fb0d6b7/invoke.js";

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
      <div ref={banner} style={{ transform: 'scale(0.8)', transformOrigin: 'top center', maxHeight: '200px' }}></div>
    </div>
  );
}

// ─── Progress Bar (shared with Delta cards) ───────────────────────────────────
function ProgressBar({ pct, downloaded, total, speed }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  const eta = speed > 0 && total > 0 ? Math.ceil((total - downloaded) / speed) : null;
  return (
    <div style={{ marginTop: '0.7rem', width: '100%' }}>
      <div style={{
        width: '100%', height: '8px', borderRadius: '99px',
        background: 'rgba(59,130,246,0.15)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${clampedPct}%`, borderRadius: '99px',
          background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)',
          transition: 'width 0.25s ease',
          boxShadow: '0 0 10px rgba(59,130,246,0.55)',
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
      }}>
        <span>
          {formatBytes(downloaded)} / {formatBytes(total)}
          {speed > 0 && (
            <span style={{ marginLeft: '0.5rem', color: '#60a5fa' }}>
              @ {formatBytes(speed)}/s
            </span>
          )}
        </span>
        <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.82rem' }}>
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

// ─── Delta Video Card ─────────────────────────────────────────────────────────
function VideoItem({ video, index }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState({ pct: 0, downloaded: 0, total: 0, speed: 0 });

  const wistiaId = getWistiaId(video.url);
  const watchUrl = wistiaId ? `https://fast.wistia.com/medias/${wistiaId}` : null;
  const sizeBadge = video.size ? formatBytes(video.size) : 'MP4';

  const handleDownload = async () => {
    setStatus('downloading');
    setErrorMsg('');
    setProgress({ pct: 0, downloaded: 0, total: 0, speed: 0 });

    try {
      let mp4Url = video.mp4Url;

      if (!mp4Url && wistiaId) {
        const metaRes = await fetch(`https://fast.wistia.com/embed/medias/${wistiaId}.json`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const assets = meta?.media?.assets ?? [];
          const original = assets.find(a => a.type === 'original');
          const mp4s = assets.filter(a => a.container === 'mp4' || a.ext === 'mp4');
          mp4s.sort((a, b) => (b.width || 0) - (a.width || 0));
          const best = original || mp4s[0];
          if (best) mp4Url = best.url;
        }
      }

      if (!mp4Url) throw new Error('No MP4 source found.\nTry the Watch button to view online.');

      const resp = await fetch(mp4Url);
      if (!resp.ok) throw new Error(`Server returned ${resp.status}. The link may have expired.`);

      const contentLength = Number(resp.headers.get('Content-Length')) || video.size || 0;
      const reader = resp.body.getReader();
      const chunks = [];
      let received = 0;
      let lastTime = Date.now();
      let lastReceived = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;

        const now = Date.now();
        const elapsed = (now - lastTime) / 1000;
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

  return (
    <div
      className="video-card"
      style={{ animationDelay: `${(index % 10) * 0.05}s`, flexDirection: 'column', alignItems: 'stretch' }}
    >
      {/* Top row */}
      <div className="sigma-top-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
        {/* Left: index + info */}
        <div className="video-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="video-index">{index + 1}</div>
          <div style={{ minWidth: 0 }}>
            <h3 className="video-title">{video.title}</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {sizeBadge}
            </span>
          </div>
        </div>

        {/* Right: buttons */}
        <div className="sigma-btn-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          {status === 'error' && (
            <span style={{ color: '#ef4444', fontSize: '0.78rem', maxWidth: '180px', textAlign: 'right', whiteSpace: 'pre-line' }}>
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
                transition: 'background 0.2s ease', whiteSpace: 'nowrap',
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

          {/* Download */}
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={status === 'downloading'}
            style={{
              ...(status === 'done' ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}),
              minWidth: '160px',
            }}
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
        </div>
      </div>

      {/* Progress bar — visible only while downloading */}
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

function Home() {
  return (
    <div className="app-container">
      <header>
        <h1>Apna College Delta Project</h1>
        <p className="header-subtitle">Download all Delta 8.0 : Complete Web Development!. Projects Video in one click.</p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed #ef4444', borderRadius: '12px', display: 'inline-block', maxWidth: '800px' }}>
          <h2 style={{ color: '#ef4444', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>⚠️</span>
            WARNING: DOWNLOAD ALL LECTURES BEFORE THEY EXPIRE!
            <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>⚠️</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>
            These video links are temporary and will be removed soon. Please download them to your device immediately to avoid losing access!
          </p>
        </div>
      </header>

      {videosData.length > 0 && videosData[0].mp4Url && (
        <div style={{ marginBottom: '3rem', marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Preview: {videosData[0].title}</h2>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <video
              src={videosData[0].mp4Url}
              autoPlay
              loop
              muted
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      )}

      <AdBanner />

      <main className="video-list">
        {videosData.map((video, index) => (
          <React.Fragment key={index}>
            <VideoItem video={video} index={index} />
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <a
                href="https://www.effectivegatecpm.com/xhbwufw17?key=e5c036ac8f77ae8e4cabf6cd365aca39"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#60a5fa', fontSize: '0.9rem', textDecoration: 'none', padding: '0.4rem 1rem', background: 'transparent', borderRadius: '4px', display: 'inline-block' }}
              >
                don't click me 😂
              </a>
            </div>
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sigma" element={<Sigma />} />
        <Route path="/download-all" element={<DownloadAll />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
