import React from 'react';
import { IconBag, IconRefresh, IconInvoice, IconUser } from '../common/Icons';

export default function LandingPage({ onShopNow, userSession, handleLogout, activeTab, setActiveTab, isCartOpen, setIsCartOpen, cartTotalQuantity, cartData }) {
  const count = cartTotalQuantity !== undefined
    ? cartTotalQuantity
    : (cartData?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);

  return (
    <div className="landing-page-wrapper screen-container">
      {/* Top Navbar matching the design */}
      <nav className="landing-nav">
        <div className="landing-nav-left">
          <button type="button" className="landing-nav-link" onClick={onShopNow}>COLLECTIONS</button>
          <button type="button" className="landing-nav-link" onClick={onShopNow}>ABOUT</button>
          <button type="button" className="landing-nav-link" onClick={onShopNow}>STORY</button>
          <button type="button" className="landing-nav-link" onClick={onShopNow}>CONTACT</button>
        </div>

        <div className="landing-nav-center" onClick={() => setActiveTab('landing')}>
          <div className="landing-brand-logo">
            <span className="brand-gold-l">L</span>AURITE
          </div>
          <div className="landing-brand-sub">HAUTE COUTURE</div>
        </div>

        <div className="landing-nav-right">
          <button type="button" className="landing-shop-now-btn" onClick={onShopNow}>
            SHOP NOW <IconBag />
            {count > 0 && <span className="cart-badge-count inline-badge">{count}</span>}
          </button>
          <button type="button" className="landing-nav-link orders-link" onClick={() => setActiveTab('orders')}>
            My Orders
          </button>
          <button type="button" className="landing-nav-link signout-link" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            <span className="title-row">Timeless</span>
            <span className="title-row title-gold">Elegance</span>
            <span className="title-row">Endless Choices</span>
          </h1>

          <div className="landing-divider">
            <span className="divider-line"></span>
            <span className="divider-diamond">✦</span>
            <span className="divider-line"></span>
          </div>

          <p className="landing-subtitle">Curated luxury for every moment</p>

          <button type="button" className="landing-hero-cta" onClick={onShopNow}>
            SHOP NOW <span className="cta-arrow">→</span>
          </button>
        </div>

        <div className="landing-hero-image-wrapper">
          <img
            src="/landing_bg.jpg"
            alt="LAURITE Haute Couture - Timeless Elegance"
            className="landing-hero-img"
          />
          <div className="landing-img-overlay"></div>
        </div>
      </div>

      {/* Bottom Feature Pillars Bar */}
      <div className="landing-features-bar">
        <div className="landing-feature-item">
          <div className="feature-icon-circle">📦</div>
          <span className="feature-label">PREMIUM QUALITY</span>
        </div>
        <div className="landing-feature-divider"></div>

        <div className="landing-feature-item">
          <div className="feature-icon-circle">🛡️</div>
          <span className="feature-label">SECURE PAYMENTS</span>
        </div>
        <div className="landing-feature-divider"></div>

        <div className="landing-feature-item">
          <div className="feature-icon-circle">🚚</div>
          <span className="feature-label">FAST DELIVERY</span>
        </div>
        <div className="landing-feature-divider"></div>

        <div className="landing-feature-item">
          <div className="feature-icon-circle">🎧</div>
          <span className="feature-label">24/7 SUPPORT</span>
        </div>
      </div>
    </div>
  );
}
