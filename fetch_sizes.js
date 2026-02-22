const fs = require('fs');

async function fetchSizes() {
    const videos = JSON.parse(fs.readFileSync('src/videos.json', 'utf8'));
    console.log(`Fetching metadata for ${videos.length} videos...`);

    let totalSize = 0;

    // Process in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize);
        await Promise.all(batch.map(async (video, index) => {
            const match = video.url.match(/\/medias\/([a-zA-Z0-9]+)\./);
            if (!match) return;
            const id = match[1];

            try {
                const res = await fetch(`https://fast.wistia.com/embed/medias/${id}.json`, {
                    headers: {
                        'Origin': 'https://unlockedcodingsite.vercel.app',
                        'Referer': 'https://unlockedcodingsite.vercel.app/'
                    }
                });
                if (!res.ok) return;
                const data = await res.json();

                const assets = data.media?.assets || [];
                let bestAsset = assets.find(a => a.type === 'original' && a.ext === 'mp4');
                if (!bestAsset) bestAsset = [...assets].reverse().find(a => a.ext === 'mp4');

                if (bestAsset) {
                    video.size = bestAsset.size; // in bytes
                    video.mp4Url = bestAsset.url;
                }
            } catch (err) {
                console.error(`Failed to fetch ${id}: ${err.message}`);
            }
        }));

        console.log(`Processed ${Math.min(i + batchSize, videos.length)}/${videos.length}`);
    }

    fs.writeFileSync('src/videos.json', JSON.stringify(videos, null, 2));
    console.log('Done!');
}

fetchSizes();
