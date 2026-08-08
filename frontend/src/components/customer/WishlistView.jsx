import React, { useState } from 'react';
import { IconBag, IconHeartFilled } from '../common/Icons';
import { notifyRestock } from '../../utils/api';

export default function WishlistView({
  wishlistItems = [],
  products = [],
  adminInventory = [],
  cartData,
  handleAddToCart,
  cartLoading,
  toggleWishlist,
  setActiveTab,
  userSession
}) {
  const [notifiedProducts, setNotifiedProducts] = useState(new Set());
  const [notifyingIds, setNotifyingIds] = useState(new Set());

  const handleNotifyMe = async (product) => {
    if (!userSession || !userSession.payload || !userSession.payload.email) {
      alert('Please log in to use this feature.');
      return;
    }
    const productId = product.productId;
    setNotifyingIds(prev => new Set(prev).add(productId));
    try {
      await notifyRestock(productId, userSession.payload.email, product.imageUrl, product.name);
      setNotifiedProducts(prev => new Set(prev).add(productId));
    } catch (error) {
      console.error('Failed to set notification:', error);
      alert('Could not set notification. Please try again.');
    } finally {
      setNotifyingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

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
          {wishlistItems.map(wishlistItem => {
            const product = products?.find(p => p.productId === wishlistItem.productId) || wishlistItem;
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
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="product-image" 
                      loading="lazy" 
                      style={{ objectFit: 'contain' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/f4efe6/c5a059?text=No+Image'; }}
                    />
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
                    {isOutOfStock ? (
                      <button
                        type="button"
                        className="btn-primary add-to-bag-btn"
                        disabled={notifyingIds.has(product.productId) || notifiedProducts.has(product.productId)}
                        onClick={() => handleNotifyMe(product)}
                        style={{ background: '#57534e', border: 'none' }}
                      >
                        <span>
                          {notifyingIds.has(product.productId) ? 'Setting up...' 
                            : notifiedProducts.has(product.productId) ? 'We\'ll email you!' 
                            : 'Notify Me'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary add-to-bag-btn"
                        disabled={cartLoading}
                        onClick={() => handleAddToCart(product)}
                      >
                        <IconBag />
                        <span style={{ marginLeft: '6px' }}>Add to Bag</span>
                      </button>
                    )}
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
