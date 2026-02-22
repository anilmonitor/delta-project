import React from 'react';

export default function AboutUs() {
    return (
        <div className="app-container" style={{ animation: 'fadeIn 0.6s ease-out both', lineHeight: '1.8' }}>
            <header>
                <h1 style={{ textAlign: 'center' }}>About Us</h1>
                <p className="header-subtitle" style={{ textAlign: 'center' }}>My self Anil and I’m a tech content creator.</p>
            </header>

            <main className="video-card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>

                <img
                    src="https://xpertbite.in/wp-content/uploads/2024/10/MrAnil-768x1319.jpg"
                    alt="Anil Monitor"
                    style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', marginBottom: '1rem' }}
                />

                <div style={{ textAlign: 'left', width: '100%' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        I am a tech content creator at YouTube – <a href="https://www.youtube.com/@ANILMONITOR" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@anilmonitor</a>, <a href="https://www.youtube.com/@ANILENGINEER" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@anilengineer</a>.
                        I love exploring new places and making vlog videos – <a href="https://www.youtube.com/@VLOGANIl" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@anilmonitorvlog</a>. &lt;– Subscribe us 💌
                    </p>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        I created this platform to share tech articles and content. Whenever people get help through my content, I feel very happy 😊
                    </p>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        I will keep posting more important articles on my site for all of you. Please give your support and love.
                        For more information or any help let me know: – <a href="mailto:help@xpertbite.in" style={{ color: 'var(--primary)', textDecoration: 'none' }}>help@xpertbite.in</a>
                    </p>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Thanks you all 😊!!</p>

                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>We are at 👇:-</h3>
                    <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <li><a href="https://instagram.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>Instagram</a></li>
                        <li><a href="https://youtube.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>YouTube</a></li>
                        <li><a href="https://linkedin.com/in/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>LinkedIn</a></li>
                        <li><a href="https://github.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>GitHub</a></li>
                        <li><a href="https://t.me/ANIlMONITOR" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>Telegram</a></li>
                        <li><a href="https://twitter.com/anilmonitor" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>Twitter</a></li>
                        <li><a href="https://www.facebook.com/anilmonitorvlog?mibextid=ZbWKwL" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}>Facebook</a></li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
