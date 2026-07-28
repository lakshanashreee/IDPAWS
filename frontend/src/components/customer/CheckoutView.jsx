import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../utils/api';

export default function CheckoutView({
  userSession,
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  handleConfirmPurchase,
  setView,
  setActiveTab,
  cartLoading,
  cartSubtotal,
  cartData
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    async function fetchAddresses() {
      if (userSession && userSession.payload.sub) {
        try {
          const profile = await getUserProfile(userSession.payload.sub);
          if (profile && profile.addresses) {
            setAddresses(profile.addresses);
            if (profile.addresses.length > 0) {
              setSelectedAddressId(profile.addresses[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load addresses:', err);
        }
      }
    }
    fetchAddresses();
  }, [userSession]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="checkout-container animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap', zIndex: 1 }}>
      {/* Left side: payment form */}
      <div className="checkout-main glass-card" style={{ flex: '1 1 500px', maxWidth: 'none', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Checkout</h2>
        <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Provide your shipping and payment information</p>

        <form onSubmit={(e) => { e.preventDefault(); handleConfirmPurchase(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label htmlFor="shipping-address" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Shipping Address</label>
            {addresses.length === 0 ? (
              <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid rgba(212, 197, 185, 0.4)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You don't have any saved addresses. Add one in your Profile.</p>
                <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', width: 'auto' }} onClick={() => { setView('customer_hub'); setActiveTab('profile'); }}>
                  Go to Profile
                </button>
              </div>
            ) : (
              <>
                <select
                  id="shipping-address"
                  className="premium-input"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                >
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>{a.title} - {a.name}</option>
                  ))}
                </select>
                {selectedAddress && (
                  <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8f7f5', borderRadius: '12px', border: '1px solid rgba(212, 197, 185, 0.4)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    <strong>{selectedAddress.name}</strong><br />
                    {selectedAddress.street}<br />
                    {selectedAddress.city}, {selectedAddress.zip}<br />
                    {selectedAddress.country}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pay-method" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Payment Method</label>
            <select
              id="pay-method"
              className="premium-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="COD">💵 Cash on Delivery (COD)</option>
              <option value="CARD">💳 Credit/Debit Card</option>
              <option value="UPI">📱 UPI</option>
              <option value="RAZORPAY">⚡ Razorpay</option>
            </select>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="card-details-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', padding: '1.25rem', background: '#fff', border: '1px solid rgba(212, 197, 185, 0.4)', borderRadius: '16px' }}>
              <div className="form-group">
                <label htmlFor="card-number" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card Number</label>
                <input
                  type="text"
                  id="card-number"
                  className="premium-input"
                  placeholder="4111 2222 3333 4444"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  required={paymentMethod === 'CARD'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="card-holder" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cardholder Name</label>
                <input
                  type="text"
                  id="card-holder"
                  className="premium-input"
                  placeholder="John Doe"
                  value={cardDetails.cardHolder}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                  required={paymentMethod === 'CARD'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-expiry" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                  <input
                    type="text"
                    id="card-expiry"
                    className="premium-input"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    required={paymentMethod === 'CARD'}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-cvv" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CVV</label>
                  <input
                    type="password"
                    id="card-cvv"
                    className="premium-input"
                    placeholder="123"
                    maxLength="3"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    required={paymentMethod === 'CARD'}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => { setView('customer_hub'); setActiveTab('storefront'); }}
              style={{ flex: 1, margin: 0, padding: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={cartLoading || (addresses.length === 0)}
              style={{ flex: 2, margin: 0, padding: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              {cartLoading ? <div className="spinner"></div> : (['CARD', 'UPI', 'RAZORPAY'].includes(paymentMethod) ? `Pay ₹${cartSubtotal.toFixed(2)}` : 'Confirm Order →')}
            </button>
          </div>
        </form>
      </div>

      {/* Right side: order summary */}
      <div className="checkout-summary glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2.5rem', height: 'fit-content', background: '#fff', border: '1px solid rgba(212, 197, 185, 0.4)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order Summary</h3>
        <p className="subtitle" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Review the items in your order</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
          {cartData.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(212, 197, 185, 0.2)' }}>
              <div>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.productName}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
              </div>
              <span style={{ fontWeight: 600 }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(212, 197, 185, 0.4)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(212, 197, 185, 0.4)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--text-main)' }}>₹{cartSubtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
