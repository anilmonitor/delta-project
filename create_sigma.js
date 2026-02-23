const https = require('https');
const fs = require('fs');

const url = 'https://unlockedcodingsite.vercel.app/_next/data/mrOTgcama_JAgupulhgtY/teacher/apna-college/SIGMA-9-MERN.json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const videos = json.pageProps.course.videos;
        fs.writeFileSync('./src/sigma_videos.json', JSON.stringify(videos, null, 2));
        console.log(`Written ${videos.length} SIGMA videos to src/sigma_videos.json`);
    });
}).on('error', (err) => {
    console.error('Error fetching:', err.message);
});
