import React from 'react';
import { IconBag, IconRefresh, IconInvoice, IconUser, IconSearch } from '../common/Icons';

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
      {/* Search bar & iOS Category Pills */}
      <section className="category-filter-wrapper reveal-on-scroll screen-container" id="catalog-grid-anchor">
        <div className="search-input-box">
          <span className="search-icon-left"><IconSearch /></span>
          <input 
            type="text" 
            placeholder="Search luxury products in LAURITE catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills-container" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      {storefrontLoading && displayProducts.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      ) : storefrontError && displayProducts.length === 0 ? (
        <div className="error-state-card screen-container" style={{ background: '#fff', borderRadius: '24px', padding: '3rem', textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="error-state-title">Connection Error</h2>
          <p className="error-state-desc" style={{ color: 'var(--text-muted)' }}>{storefrontError}</p>
          <button type="button" className="btn-primary btn-retry" onClick={fetchProducts} style={{ width: 'auto', marginTop: '1rem' }}>
            Retry Fetching Catalog
          </button>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="empty-state screen-container" style={{ background: '#fff', borderRadius: '24px', padding: '4rem', textAlign: 'center', marginBottom: '4rem', border: '1px solid rgba(212,197,185,0.4)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Products Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try modifying your search query or selecting a different category.</p>
        </div>
      ) : (
        <main className="product-grid reveal-on-scroll screen-container">
          {displayProducts.map(product => {
            const inv = adminInventory.find(i => i.productId === product.productId);
            const qty = inv ? inv.availableQuantity : null;
            const threshold = inv && inv.lowStockThreshold !== undefined ? inv.lowStockThreshold : 5;
            const isLow = qty !== null && qty > 0 && qty <= threshold;
            const isOut = qty !== null && qty === 0;
            const cartItem = cartData?.items?.find(i => i.productId === product.productId);
            const currentCartQty = cartItem ? cartItem.quantity : 0;
            const isMaxReached = qty !== null && currentCartQty >= qty;
            
            return (
            <div key={product.productId} className="product-card">
              <div className="product-image-container">
                {product.imageUrl || product.image ? (
                  <img 
                    className="product-image" 
                    src={product.imageUrl || product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div 
                  className="product-image-placeholder"
                  style={{ display: (product.imageUrl || product.image) ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="placeholder-icon" style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}><IconBag /></span>
                  <span className="placeholder-text" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{product.category || 'LUXURY'}</span>
                </div>

                {/* Stock Badge */}
                {qty !== null && (
                  <div className={`stock-badge-pill ${isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'}`}>
                    {isOut ? 'Out of Stock' : isLow ? `Only ${qty} left` : 'In Stock'}
                  </div>
                )}
              </div>

              <div className="product-info">
                <span className="product-category-label">{product.category || 'General'}</span>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description || 'Exquisite quality product from our signature luxury catalog.'}</p>
                {isLow && !isOut && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                    Only {qty} is left
                  </p>
                )}
                
                <div className="product-footer">
                  <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
                  <button 
                    type="button" 
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product)}
                    disabled={cartLoading || isOut || isMaxReached}
                    style={(isOut || isMaxReached) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {isOut ? 'Out of Stock' : isMaxReached ? 'Max Reached' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </main>
      )}
    </>
  );
}
