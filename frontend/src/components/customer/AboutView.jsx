import React from 'react';
import { IconBag, IconUser, IconRefresh, IconInvoice } from '../common/Icons';

export default function AboutView({ onExploreCatalog }) {
  return (
    <div className="about-page-container screen-container">
      {/* Editorial Header */}
      <section className="about-hero-section">
        <span className="about-label">OUR LEGACY</span>
        <h1 className="about-title">The Art of Timeless Elegance</h1>
        <p className="about-subtitle">
          Founded on the principles of immaculate craftsmanship and contemporary luxury, 
          LAURITE Style defines the intersection of tradition and modern elegance.
        </p>
      </section>

      {/* Grid Content Showcase */}
      <div className="about-content-grid">
        <div className="about-text-card">
          <h2 className="about-card-title">Craftsmanship & Vision</h2>
          <p className="about-card-desc">
            At LAURITE, every piece in our curated collection is crafted with painstaking attention 
            to detail. We source only the finest sustainable materials, collaborating with artisan masters 
            world-wide to bring you collections that inspire confidence and sophistication.
          </p>
          <p className="about-card-desc">
            Our vision is simple: to offer timeless wardrobe centerpieces and lifestyle luxuries 
            that transcend fleeting trends and become cherished essentials for a lifetime.
          </p>
        </div>

        <div className="about-image-card">
          <img 
            src="/landing_bg.jpg" 
            alt="LAURITE Craftsmanship" 
            className="about-img"
          />
        </div>
      </div>

      {/* Core Values Section */}
      <section className="about-values-section">
        <h2 className="about-values-title">Why Choose LAURITE</h2>
        <div className="about-values-grid">
          <div className="value-card">
            <div className="value-icon"><IconBag /></div>
            <h3>Curated Collections</h3>
            <p>Every product is hand-selected and quality tested by our style fashion experts.</p>
          </div>
          <div className="value-card">
            <div className="value-icon"><IconRefresh /></div>
            <h3>Ethical Sourcing</h3>
            <p>Committed to sustainable practices, eco-conscious packaging, and ethical production.</p>
          </div>
          <div className="value-card">
            <div className="value-icon"><IconInvoice /></div>
            <h3>Bespoke Quality</h3>
            <p>Uncompromising standards guaranteed with dedicated 100% encrypted luxury checkout.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="about-cta-card">
        <h2>Experience LAURITE Style</h2>
        <p>Explore our latest seasonal collections and elevate your everyday lifestyle.</p>
        <button type="button" className="btn-primary btn-gold" onClick={onExploreCatalog} style={{ width: 'auto', padding: '0.85rem 2.2rem', marginTop: '1rem' }}>
          EXPLORE CATALOG →
        </button>
      </div>
    </div>
  );
}
