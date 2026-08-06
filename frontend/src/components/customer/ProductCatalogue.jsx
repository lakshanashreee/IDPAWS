import React from 'react';
import { IconBag, IconSearch } from '../common/Icons';

export default function ProductCatalogue({
  products = [],
  searchQuery,
  setSearchQuery,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  storefrontLoading,
  storefrontError,
  fetchProducts,
  filteredProducts,
  adminInventory = [],
  cartData,
  handleAddToCart,
  cartLoading
}) {
  const displayProducts = filteredProducts !== undefined ? filteredProducts : products;

  return (
    <>
      <section className="category-filter-wrapper reveal-on-scroll screen-container" id="catalog-grid-anchor">
        <div className="search-input-box" style={{ marginBottom: '2rem' }}>
          <span className="search-icon-left"><IconSearch /></span>
          <input 
            type="text" 
            placeholder="Search luxury products in LAURITE catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedCategory !== 'ALL' && (
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn-primary btn-secondary" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => setSelectedCategory('ALL')}
            >
              &larr; Back to Collections
            </button>
            <h2 style={{ margin: '0 0 0 1.5rem', fontFamily: 'var(--font-serif)', color: '#1c1917' }}>
              {selectedCategory}
            </h2>
          </div>
        )}
      </section>

      <section className="product-grid-section screen-container">
        {storefrontLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Curating your luxury experience...</p>
          </div>
        ) : storefrontError ? (
          <div className="error-state">
            <p>{storefrontError}</p>
            <button className="btn-primary btn-secondary" onClick={fetchProducts} style={{ width: 'auto' }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {selectedCategory === 'ALL' && !searchQuery ? (
              // Collections Intro Page
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
                {categories.map(cat => (
                  <div 
                    key={cat.categoryId} 
                    className="product-card"
                    style={{ cursor: 'pointer', overflow: 'hidden' }}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <div style={{ position: 'relative', height: '350px', background: '#faf8f5' }}>
                      {cat.imageUrl ? (
                        <img 
                          src={cat.imageUrl} 
                          alt={cat.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          className="product-image" 
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                          No Image
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)' }}></div>
                      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                        <h3 style={{ color: '#fff', fontFamily: 'var(--font-serif)', margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{cat.name}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>{cat.description || 'Explore Collection'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <p>No collections available yet.</p>
                  </div>
                )}
              </div>
            ) : (
              // Product List (Filtered by Search or Category)
              <>
                <div className="product-grid">
                  {displayProducts.map(product => {
                    const inv = adminInventory.find(i => i.productId === product.productId);
                    const qty = inv ? inv.availableQuantity : null;
                    const isOutOfStock = qty === 0 || qty === null;

                    return (
                      <div key={product.productId} className="product-card">
                        <div className="product-image-container">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                          ) : (
                            <div className="product-image-placeholder">No Image</div>
                          )}
                          {isOutOfStock && (
                            <div className="out-of-stock-badge">Out of Stock</div>
                          )}
                        </div>
                        <div className="product-info">
                          <span className="product-category">{product.category}</span>
                          <h3 className="product-title">{product.name}</h3>
                          <p className="product-desc">{product.description}</p>
                          <div className="product-bottom-row">
                            <span className="product-price">₹{product.price.toFixed(2)}</span>
                            <button
                              type="button"
                              className="btn-primary add-to-bag-btn"
                              disabled={cartLoading || isOutOfStock}
                              onClick={() => handleAddToCart(product)}
                            >
                              <IconBag />
                              <span style={{ marginLeft: '6px' }}>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {displayProducts.length === 0 && (
                  <div className="empty-state">
                    <p>No products found {selectedCategory !== 'ALL' ? `in ${selectedCategory}` : ''}.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
