import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import videosData from './videos.json';
import Navbar from './Navbar';
import DownloadAll from './DownloadAll';
import AboutUs from './AboutUs';
import Footer from './Footer';
import { formatBytes } from './utils';

// Helper to extract Wistia ID from URL like "https://fast.wistia.com/embed/medias/ocl4ate6f4.m3u8"
function getWistiaId(url) {
  const match = url.match(/\/medias\/([a-zA-Z0-9]+)\./);
  return match ? match[1] : null;
}

function AdBanner() {
  const banner = useRef(null);

  useEffect(() => {
    // React blocks raw <script> tags inside JSX for security reasons,
    // so we must inject your exact ad code this way in order for it to work.
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
    <div style={{ display: 'flex', justifyContent: 'center', margin: '0', width: '100%' }}>
      {/* We apply a CSS scale to make the 300x250 ad visually smaller as requested */}
      <div ref={banner} style={{ transform: 'scale(0.7)', transformOrigin: 'center center', maxHeight: '175px' }}></div>
    </div>
  );
}

function VideoItem({ video, index }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    const wistiaId = getWistiaId(video.url);
    if (!wistiaId) {
      setError("Invalid Wistia ID");
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      let targetUrl = video.mp4Url;
      if (!targetUrl) throw new Error("No MP4 source found in video data");

      // Fetch the video completely client-side. Wistia supports CORS natively!
      // This bypasses Vercel/Netlify proxy limits (404s/payload caps) entirely.
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("Video stream blocked or timed out");

      const blob = await res.blob();
      const localBlobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = localBlobUrl;
      a.download = `${video.title.replace(/[^a-z0-9\s]/gi, '').trim()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(localBlobUrl), 10000);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      // Minor delay to let the animation show
      setTimeout(() => setDownloading(false), 500);
    }
  }

  return (
    <div className="video-card" style={{ animationDelay: `${(index % 10) * 0.05}s` }}>
      <div className="video-info">
        <div className="video-index">{index + 1}</div>
        <div>
          <h3 className="video-title">{video.title}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatBytes(video.size)}</span>
        </div>
      </div>
      <div>
        {error ? (
          <span style={{ color: '#ef4444', fontSize: '0.85rem', marginRight: '1rem' }}>{error}</span>
        ) : null}
        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="loader"></span>
              Downloading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download MP4
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Home() {
  return (
    <div className="app-container">
      <header>
        <h1>Apna College Delta Project</h1>
        <p className="header-subtitle">Download all Delta 8.0 : Complete Web Development!. Projects Video in one click.</p>
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

      <main className="video-list">
        {videosData.map((video, index) => (
          <React.Fragment key={index}>
            <VideoItem video={video} index={index} />
            {/* Show Ad after every 2 lectures */}
            {(index + 1) % 2 === 0 && <AdBanner />}
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
        <Route path="/download-all" element={<DownloadAll />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
