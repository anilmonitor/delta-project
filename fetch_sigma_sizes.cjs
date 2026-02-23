const https = require('https');
const fs = require('fs');
const path = require('path');

const SIGMA_PATH = path.join(__dirname, 'src', 'sigma_videos.json');
const videos = JSON.parse(fs.readFileSync(SIGMA_PATH, 'utf8'));

function getWistiaId(url) {
    const m = url && url.match(/\/medias\/([a-zA-Z0-9]+)\./);
    return m ? m[1] : null;
}

function fetchMeta(wistiaId) {
    const url = `https://fast.wistia.com/embed/medias/${wistiaId}.json`;
    return new Promise((resolve) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    const assets = (j.media && j.media.assets) ? j.media.assets : [];
                    // Prefer 'original' asset, then highest-res mp4
                    const original = assets.find(a => a.type === 'original');
                    const mp4s = assets.filter(a => a.container === 'mp4' || a.ext === 'mp4' || a.codec === 'h264');
                    mp4s.sort((a, b) => (b.width || 0) - (a.width || 0));
                    const best = original || mp4s[0];
                    if (best) {
                        resolve({ mp4Url: best.url, size: best.size || 0 });
                    } else {
                        resolve({ mp4Url: null, size: 0 });
                    }
                } catch { resolve({ mp4Url: null, size: 0 }); }
            });
        });
        req.on('error', () => resolve({ mp4Url: null, size: 0 }));
        req.setTimeout(12000, () => { req.destroy(); resolve({ mp4Url: null, size: 0 }); });
    });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    // Check if already partially processed
    const alreadyDone = videos.filter(v => v.mp4Url).length;
    console.log(`\n🚀 Fetching Wistia metadata for ${videos.length} SIGMA videos`);
    console.log(`   Already have mp4Url: ${alreadyDone}`);

    const CONCURRENCY = 8; // parallel requests
    let processed = 0;
    let found = 0;
    let skipped = 0;

    // Process in chunks
    for (let i = 0; i < videos.length; i += CONCURRENCY) {
        const chunk = videos.slice(i, i + CONCURRENCY);
        const results = await Promise.all(chunk.map(async (v, ci) => {
            const idx = i + ci;
            // Skip if already has url
            if (v.mp4Url) { skipped++; return; }
            const wistiaId = getWistiaId(v.url);
            if (!wistiaId) { processed++; return; }
            const { mp4Url, size } = await fetchMeta(wistiaId);
            if (mp4Url) {
                videos[idx].mp4Url = mp4Url;
                found++;
            }
            if (size) {
                videos[idx].size = size;
            }
            processed++;
        }));

        const total = processed + skipped;
        const pct = Math.round((total / videos.length) * 100);
        process.stdout.write(`\r   Progress: ${total}/${videos.length} (${pct}%) — found: ${found + alreadyDone}`);

        // Save checkpoint every 50 videos
        if (total % 50 === 0 || total === videos.length - skipped) {
            fs.writeFileSync(SIGMA_PATH, JSON.stringify(videos, null, 2));
        }

        // Small delay to be polite to Wistia's API
        await sleep(100);
    }

    // Final save
    fs.writeFileSync(SIGMA_PATH, JSON.stringify(videos, null, 2));
    const totalFound = videos.filter(v => v.mp4Url).length;
    const totalSized = videos.filter(v => v.size).length;
    console.log(`\n\n✅ Done! mp4Url found: ${totalFound}/${videos.length}, sizes found: ${totalSized}/${videos.length}`);
    console.log(`📁 Saved to: ${SIGMA_PATH}`);
}

main().catch(console.error);
