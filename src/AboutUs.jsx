import React from 'react';

export default function AboutUs() {
    return (
        <div className="app-container" style={{ animation: 'fadeIn 0.8s ease-out both' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>About the Creator</h1>
                <p className="header-subtitle" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Hi, I’m <strong>Anil</strong>.<br />
                    I’m a tech content creator with a strong passion for Web Development and teaching.
                </p>
            </header>

            <main style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* Hero Bio Section */}
                <div className="video-card" style={{ display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'center', padding: '3rem', flexWrap: 'wrap-reverse' }}>
                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)' }}>Who am I?</h2>
                        <div style={{ width: '50px', height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>

                        <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            I’m a Tech Content Creator on YouTube – <a href="https://www.youtube.com/@ANILMONITOR" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@anilmonitor</a> and <a href="https://www.youtube.com/@ANILENGINEER" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@anilengineer</a>, where I share valuable content related to technology.
                        </p>
                        <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            I am deeply passionate about Web Development and constantly exploring new technologies to improve my skills and share practical knowledge with my audience.
                        </p>
                        <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            Outside of coding, I love exploring new places and creating vlog content on <a href="https://www.youtube.com/@VLOGANIl" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>@anilmonitorvlog</a>.
                        </p>
                    </div>

                    <div style={{ flex: '1 1 250px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, var(--primary), #a78bfa)', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}>
                            <img
                                src="https://xpertbite.in/wp-content/uploads/2024/10/MrAnil-768x1319.jpg"
                                alt="Anil Monitor"
                                style={{ width: '100%', maxWidth: '320px', borderRadius: '18px', display: 'block', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>

                {/* About Platform Section */}
                <div className="video-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)' }}></div>

                    <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span role="img" aria-label="globe" style={{ fontSize: '2rem' }}>🌐</span> About This Platform
                    </h2>

                    <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                        I created this platform to help students learn, grow, and achieve their goal of getting a job in their dream company.
                    </p>
                    <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                        Whenever someone learns something new or gets help through my content, it truly makes me happy. I am committed to regularly sharing important and practical articles that can support your career journey.
                    </p>

                    <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                            Thank you all for your support and love.<br />
                            <span style={{ color: 'var(--primary)', display: 'inline-block', marginTop: '0.5rem' }}>Let’s grow together 🚀💙</span>
                        </p>
                    </div>
                </div>

                {/* Social Links Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, margin: 0 }}>Connect with me</h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                            { name: 'Instagram', url: 'https://instagram.com/anilmonitor' },
                            { name: 'YouTube', url: 'https://youtube.com/anilmonitor' },
                            { name: 'LinkedIn', url: 'https://linkedin.com/in/anilmonitor' },
                            { name: 'GitHub', url: 'https://github.com/anilmonitor' },
                            { name: 'Telegram', url: 'https://t.me/ANIlMONITOR' },
                            { name: 'Twitter', url: 'https://twitter.com/anilmonitor' },
                            { name: 'Facebook', url: 'https://www.facebook.com/anilmonitorvlog?mibextid=ZbWKwL' }
                        ].map(social => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noreferrer"
                                className="download-btn"
                                style={{
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 500,
                                    borderRadius: '30px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary)';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--card-bg)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                {social.name}
                            </a>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
