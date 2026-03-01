interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">✨</span> Template Crafter
          </div>
          <nav className="landing-nav">
            <a href="#" className="landing-nav-link">Features</a>
            <a href="#" className="landing-nav-link">Showcase</a>
            <button onClick={onStart} className="landing-btn-primary small">Launch Editor</button>
          </nav>
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            Create Stunning App Store Screenshots <br />
            <span className="text-gradient">In Minutes</span>
          </h1>
          <p className="landing-subtitle">
            Stop struggling with complex design tools. Generate professional, compliant screenshots for iOS and Android instantly.
          </p>
          <div className="landing-actions">
            <button onClick={onStart} className="landing-btn-primary large">
              <span className="material-symbols-rounded">rocket_launch</span>
              Start Creating for Free
            </button>
            <button className="landing-btn-secondary large">
              <span className="material-symbols-rounded">play_circle</span>
              Watch Demo
            </button>
          </div>

          <div className="landing-stats">
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Client-Side</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">4k+</span>
              <span className="stat-label">Export Quality</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">0$</span>
              <span className="stat-label">Free Forever</span>
            </div>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hero-card hero-card--main">
            <div className="hero-card-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="hero-card-preview"></div>
          </div>
          <div className="hero-card hero-card--floating float-1">
            <span className="material-symbols-rounded">bolt</span>
            <span>Bulk Export</span>
          </div>
          <div className="hero-card hero-card--floating float-2">
            <span className="material-symbols-rounded">devices</span>
            <span>All Devices</span>
          </div>
        </div>
      </main>

      <section className="landing-features">
        <div className="feature-card highlighted">
          <div className="feature-icon"><span className="material-symbols-rounded">download_for_offline</span></div>
          <h3>Bulk Export</h3>
          <p>Export all required App Store sizes (6.5", 5.5", 12.9") in a single click. No more manual resizing.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><span className="material-symbols-rounded">smartphone</span></div>
          <h3>Device Frames</h3>
          <p>Pre-loaded with accurate iPhone 14 Pro, Pro Max, and iPad frames. Drag, drop, and customize.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><span className="material-symbols-rounded">palette</span></div>
          <h3>Smart Styling</h3>
          <p>Global color controls, gradient backgrounds, and smart text layouts that adapt to your content.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 AppScreenStudio. Built for developers.</p>
      </footer>
    </div>
  );
}
