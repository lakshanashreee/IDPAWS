import React from 'react';

export default function HeroSection({ selectedCategory, setSelectedCategory }) {
  return (
    <section className="hero-editorial-section reveal-on-scroll screen-container">
      <h1 className="hero-heading-editorial">Elevate Your Everyday Style</h1>
      <p className="hero-subtitle-editorial">Curated luxury collections handcrafted for timeless elegance.</p>
      {selectedCategory !== 'ALL' && (
        <div style={{ marginTop: '0.75rem' }}>
          <button 
            className="category-pill-btn active" 
            onClick={() => setSelectedCategory('ALL')}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
          >
            Filter: {selectedCategory} ✕
          </button>
        </div>
      )}
    </section>
  );
}
