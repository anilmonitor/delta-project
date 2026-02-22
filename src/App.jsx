import React, { useState } from 'react';
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
      // Fetch wistia embed metadata through our local Vite proxy
      const res = await fetch(`/api/wistia/${wistiaId}`);
      if (!res.ok) throw new Error("Metadata limit or CORS block");
      const metadata = await res.json();

      if (metadata.error) {
        throw new Error("Wistia block error");
      }

      // Find original mp4 asset
      const assets = metadata.media?.assets || [];
      // Prefer "original" type or at least an mp4 format
      let bestAsset = assets.find(a => a.type === 'original' && a.ext === 'mp4');
      if (!bestAsset) {
        bestAsset = assets.reverse().find(a => a.ext === 'mp4');
      }

      if (!bestAsset || !bestAsset.url) {
        throw new Error("No MP4 source found");
      }

      // Directly downloading the `.bin` or triggering local proxy download
      const targetUrl = bestAsset.url;
      // Redirect to the proxy local download endpoint which converts it to a standard MP4 file download attachment
      const b64Url = btoa(targetUrl);
      const downloadLink = `/api/download?b64=${b64Url}&title=${encodeURIComponent(video.title)}`;

      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

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
              src={`/api/download?b64=${btoa(videosData[0].mp4Url)}&title=preview`}
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
          <VideoItem key={index} video={video} index={index} />
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
