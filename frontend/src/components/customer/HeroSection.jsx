import React from 'react';

export default function HeroSection({ onShopNow }) {
  const handleShopNowClick = () => {
    if (onShopNow) {
      onShopNow();
    } else {
      const anchor = document.getElementById('catalog-grid-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="home-hero-container screen-container" id="home-top">
      {/* Main Luxury Hero Section */}
      <div className="home-hero-grid">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            <span className="title-row">Timeless</span>
            <span className="title-row title-gold">Elegance</span>
            <span className="title-row">Endless Choices</span>
          </h1>

          <div className="home-hero-divider">
            <span className="divider-line"></span>
            <span className="divider-diamond">✦</span>
            <span className="divider-line"></span>
          </div>

          <p className="home-hero-subtitle">Curated collections</p>

          <button type="button" className="home-hero-cta-btn" onClick={handleShopNowClick}>
            SHOP NOW <span className="cta-arrow">→</span>
          </button>
        </div>

        <div className="home-hero-image-box">
          <img 
            src="/landing_bg.jpg" 
            alt="LAURITE Haute Couture - Timeless Elegance" 
            className="home-hero-img"
          />
        </div>
      </div>

      {/* 4 Pillars Bar */}
      <div className="home-pillars-bar">
        <div className="home-pillar-item">
          <div className="pillar-icon">📦</div>
          <span className="pillar-label">MAJESTIC QUALITY</span>
        </div>
        <div className="pillar-separator"></div>

        <div className="home-pillar-item">
          <div className="pillar-icon">🛡️</div>
          <span className="pillar-label">SECURE PAYMENTS</span>
        </div>
        <div className="pillar-separator"></div>

        <div className="home-pillar-item">
          <div className="pillar-icon">🚚</div>
          <span className="pillar-label">FAST DELIVERY</span>
        </div>
        <div className="pillar-separator"></div>

        <div className="home-pillar-item">
          <div className="pillar-icon">🎧</div>
          <span className="pillar-label">24/7 SUPPORT</span>
        </div>
      </div>
    </div>
  );
}
