import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'

function wistiaDownloader() {
  return {
    name: 'wistia-downloader',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // --- 1. PROXY FOR SINGLE JSON METADATA ---
        if (req.url.startsWith('/api/wistia/')) {
          const id = req.url.split('?')[0].split('/').pop();
          try {
            const response = await fetch(`https://fast.wistia.com/embed/medias/${id}.json`, {
              headers: {
                'Origin': 'https://unlockedcodingsite.vercel.app',
                'Referer': 'https://unlockedcodingsite.vercel.app/'
              }
            });
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // --- 2. SINGLE DOWNLOAD STREAM PROXY ---
        if (req.url.startsWith('/api/download?') || req.url === '/api/download') {
          const urlParams = new URLSearchParams(req.url.split('?')[1]);
          const targetUrl = urlParams.get('url');
          let title = urlParams.get('title') || 'video';
          title = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

          if (!targetUrl) return next();

          https.get(targetUrl, (streamParams) => {
            res.setHeader('Content-Type', streamParams.headers['content-type'] || 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
            if (streamParams.headers['content-length']) {
              res.setHeader('Content-Length', streamParams.headers['content-length']);
            }
            streamParams.pipe(res);
          }).on('error', (e) => {
            res.statusCode = 500;
            res.end(`Error: ${e.message}`);
          });
          return;
        }

        // --- 3. BATCH ZIP DOWNLOAD ---
        if (req.url.startsWith('/api/download-zip')) {
          // Read the videos JSON data securely from fs
          const videosFile = path.resolve(__dirname, 'src/videos.json');
          const videos = JSON.parse(fs.readFileSync(videosFile, 'utf-8'));

          // Set immediate headers so the browser triggers a file download instantly
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', 'attachment; filename="Delta_8.0_Complete_Course.zip"');

          // Initialize the Archiver instance and pipe to HTTP response explicitly
          const archive = archiver('zip', {
            zlib: { level: 0 } // Level 0 (Store) ensures it doesn't max out CPU doing pointless compression on already compressed mp4s
          });

          archive.on('error', function (err) {
            console.error('Archive Error', err);
            // Too late to change headers or status
            res.end();
          });

          archive.pipe(res);

          const total = videos.length;

          // An async loop appending streams cleanly to the archiver without loading them in RAM
          (async function processBatch() {
            try {
              for (let i = 0; i < total; i++) {
                const video = videos[i];
                console.log(`[ZIP] Fetching metadata for ${i + 1}/${total}: ${video.title}`);

                // Helper to extract Wistia ID from URL inside Node context
                const match = video.url.match(/\/medias\/([a-zA-Z0-9]+)\./);
                if (!match) continue;
                const wistiaId = match[1];

                // Fetch Wistia JSON locally exactly as we do
                const metadataRes = await fetch(`https://fast.wistia.com/embed/medias/${wistiaId}.json`, {
                  headers: {
                    'Origin': 'https://unlockedcodingsite.vercel.app',
                    'Referer': 'https://unlockedcodingsite.vercel.app/'
                  }
                });

                if (!metadataRes.ok) continue;
                const metadata = await metadataRes.json();

                if (metadata.error || !metadata.media || !metadata.media.assets) continue;

                const assets = metadata.media.assets;
                let bestAsset = assets.find(a => a.type === 'original' && a.ext === 'mp4');
                if (!bestAsset) bestAsset = [...assets].reverse().find(a => a.ext === 'mp4');
                if (!bestAsset || !bestAsset.url) continue;

                // Make safe filename
                const safeTitle = video.title.replace(/[^a-z0-9]/gi, '_');
                const zipFilename = `videos/${String(i + 1).padStart(3, '0')}_${safeTitle}.mp4`;

                // Add to archive natively! This buffers it internally.
                console.log(`[ZIP] Appending stream for ${zipFilename}`);

                // Wrapping the stream push inside a Promise to wait for end event
                await new Promise((resolve, reject) => {
                  https.get(bestAsset.url, (mediaStream) => {
                    archive.append(mediaStream, { name: zipFilename });

                    // We need to wait for appending to FINISH before beginning the next fetch.
                    mediaStream.on('end', resolve);
                    mediaStream.on('error', reject);
                  }).on('error', reject);
                });

                // Optional short delay between fetches so api isn't abused
                await new Promise(r => setTimeout(r, 500));
              }

              // After iterating through all, explicitly finalize
              archive.finalize();

            } catch (err) {
              console.error("[ZIP] Critical processing loop err", err);
              archive.finalize();
            }
          })();

          return;
        }

        next();
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), wistiaDownloader()],
})
