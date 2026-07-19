import React from 'react';
import { IconTrash } from '../common/Icons';

export default function ShoppingBagDrawer({
  isCartOpen,
  setIsCartOpen,
  cartData,
  handleUpdateQuantity,
  handleRemoveItem,
  cartLoading,
  cartSubtotal,
  handleCheckout
}) {
  if (!isCartOpen) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-wrapper" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', borderBottom: '1px solid rgba(212,197,185,0.4)', background: '#fff' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#1c1917', margin: 0 }}>Shopping Bag</h2>
          <button type="button" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#57534e' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
          {cartData.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#57534e' }}>
              <p style={{ fontWeight: 600, color: '#1c1917', fontSize: '1.1rem' }}>Your shopping bag is empty.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Explore our catalog to add luxury items.</p>
            </div>
          ) : (
            cartData.items.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(212,197,185,0.3)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1c1917' }}>{item.productName}</h4>
                  <span style={{ fontSize: '0.82rem', color: '#57534e' }}>₹{Number(item.price).toFixed(2)} each</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '9999px', padding: '0.2rem 0.6rem' }}>
                    <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem', fontWeight: 700 }}>-</button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.4rem', color: '#1c1917' }}>{item.quantity}</span>
                    <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem', fontWeight: 700 }}>+</button>
                  </div>

                  <button type="button" onClick={() => handleRemoveItem(item.productId)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem' }}>
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartData.items.length > 0 && (
          <div style={{ padding: '1.75rem', borderTop: '1px solid rgba(212,197,185,0.4)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#57534e' }}>
              <span>Subtotal</span>
              <span style={{ color: '#1c1917', fontWeight: 600 }}>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.88rem', color: '#57534e' }}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>COMPLIMENTARY</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#1c1917', borderTop: '1px solid rgba(212,197,185,0.4)', paddingTop: '0.75rem' }}>
              <span>Total Amount</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>

            <button type="button" className="btn-primary btn-gold" onClick={handleCheckout} disabled={cartLoading} style={{ width: '100%', padding: '0.85rem' }}>
              {cartLoading ? <div className="spinner"></div> : 'Proceed to Checkout →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
