import React from 'react';
import { IconBag, IconHeartFilled } from '../common/Icons';

export default function WishlistView({
  wishlistItems = [],
  adminInventory = [],
  cartData,
  handleAddToCart,
  cartLoading,
  toggleWishlist,
  setActiveTab
}) {

  return (
    <div className="screen-container" style={{ padding: '2rem 1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem', color: '#1c1917' }}>My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is currently empty.</p>
          <button className="btn-primary" style={{ width: 'auto', marginTop: '1rem' }} onClick={() => setActiveTab('catalog')}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map(product => {
            const inv = adminInventory.find(i => i.productId === product.productId);
            const qty = inv ? inv.availableQuantity : null;
            const isOutOfStock = qty === 0 || qty === null;

            return (
              <div key={product.productId} className="product-card">
                <div className="product-image-container" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(product); }}
                    style={{
                      position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                      background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  >
                    <IconHeartFilled />
                  </button>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" style={{ objectFit: 'contain' }} />
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
      )}
    </div>
  );
}
