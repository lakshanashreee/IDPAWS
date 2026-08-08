import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../utils/api';

export default function CheckoutView({
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  handleConfirmPurchase,
  setView,
  setActiveTab,
  cartLoading,
  cartSubtotal,
  cartData,
  userSession
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      if (!userSession) return;
      setLoadingAddresses(true);
      try {
        const profile = await getUserProfile(userSession.payload.sub);
        if (profile && profile.addresses && profile.addresses.length > 0) {
          setAddresses(profile.addresses);
          setSelectedAddress(profile.addresses[0].addressLine);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [userSession]);
  return (
    <div className="checkout-container animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap', zIndex: 1 }}>
      {/* Left side: payment form */}
      <div className="checkout-main" style={{ flex: '1 1 500px', maxWidth: 'none', background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Payment & Shipping</h2>
        <p className="subtitle" style={{ marginBottom: '2.5rem', color: 'var(--text-muted)' }}>Select your preferred shipping address and payment method</p>

        <form onSubmit={(e) => { e.preventDefault(); handleConfirmPurchase(selectedAddress); }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="form-group">
            <label htmlFor="shipping-address" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shipping Address</label>
            {loadingAddresses ? (
              <p>Loading addresses...</p>
            ) : addresses.length > 0 ? (
              <select
                id="shipping-address"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                required
              >
                {addresses.map((addr, idx) => (
                  <option key={idx} value={addr.addressLine}>
                    {addr.tag} - {addr.addressLine}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                No addresses found. Please add a shipping address in your Profile first.
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="pay-method" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Payment Method</label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
            >
              <option value="COD">💵 Cash on Delivery (COD)</option>
              <option value="CARD">💳 Credit/Debit Card</option>
            </select>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="card-details-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem', padding: '2rem', background: '#fff', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div className="form-group">
                <label htmlFor="card-number" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Card Number</label>
                <input
                  type="text"
                  id="card-number"
                  placeholder="7890 4567 6567 5678"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  required={paymentMethod === 'CARD'}
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'var(--transition-fast)' }}
                  onFocus={(e) => e.target.style.border = '1px solid var(--accent-gold)'}
                  onBlur={(e) => e.target.style.border = '1px solid transparent'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="card-holder" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Cardholder Name</label>
                <input
                  type="text"
                  id="card-holder"
                  placeholder="Kira"
                  value={cardDetails.cardHolder}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                  required={paymentMethod === 'CARD'}
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'var(--transition-fast)' }}
                  onFocus={(e) => e.target.style.border = '1px solid var(--accent-gold)'}
                  onBlur={(e) => e.target.style.border = '1px solid transparent'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-expiry" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Expiry Date</label>
                  <input
                    type="text"
                    id="card-expiry"
                    placeholder="03/56"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    required={paymentMethod === 'CARD'}
                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'var(--transition-fast)' }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--accent-gold)'}
                    onBlur={(e) => e.target.style.border = '1px solid transparent'}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-cvv" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>CVV</label>
                  <input
                    type="password"
                    id="card-cvv"
                    placeholder="•••"
                    maxLength="3"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    required={paymentMethod === 'CARD'}
                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212,197,185,0.15)', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'var(--transition-fast)' }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--accent-gold)'}
                    onBlur={(e) => e.target.style.border = '1px solid transparent'}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => { setView('customer_hub'); setActiveTab('catalog'); }}
              style={{ flex: 1, padding: '1rem', background: '#fff', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.target.style.background = 'var(--bg-secondary)'}
              onMouseOut={(e) => e.target.style.background = '#fff'}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={cartLoading || addresses.length === 0}
              style={{ flex: 2, padding: '1rem', background: 'var(--accent-gold)', border: 'none', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-fast)', opacity: (cartLoading || addresses.length === 0) ? 0.7 : 1 }}
              onMouseOver={(e) => { if(!cartLoading && addresses.length > 0) e.target.style.background = 'var(--accent-gold-hover)' }}
              onMouseOut={(e) => { if(!cartLoading && addresses.length > 0) e.target.style.background = 'var(--accent-gold)' }}
            >
              {cartLoading ? <div className="spinner"></div> : (paymentMethod === 'CARD' ? `Pay ₹${cartSubtotal.toFixed(2)}` : 'Confirm Order →')}
            </button>
          </div>
        </form>
      </div>

      <div className="checkout-summary" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '0 1rem', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Order Summary</h3>
        <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Review the items in your order</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '2rem' }}>
          {cartData.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.productName}</span>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Qty: {item.quantity}</span>
              </div>
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ color: 'var(--text-main)' }}>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--text-main)' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 700, marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--glass-border)', color: 'var(--text-main)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-gold)' }}>₹{cartSubtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
