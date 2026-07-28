import React from 'react';

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
  cartData
}) {
  return (
    <div className="checkout-container animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap', zIndex: 1 }}>
      {/* Left side: payment form */}
      <div className="checkout-main glass-card" style={{ flex: '1 1 500px', maxWidth: 'none', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Information</h2>
        <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Select your preferred payment method and complete purchase</p>

        <form onSubmit={(e) => { e.preventDefault(); handleConfirmPurchase(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="pay-method" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Payment Method</label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem', outline: 'none' }}
            >
              <option value="COD">💵 Cash on Delivery (COD)</option>
              <option value="CARD">💳 Credit/Debit Card</option>
            </select>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="card-details-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
              <div className="form-group">
                <label htmlFor="card-number" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Card Number</label>
                <input
                  type="text"
                  id="card-number"
                  placeholder="4111 2222 3333 4444"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  required={paymentMethod === 'CARD'}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="card-holder" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Cardholder Name</label>
                <input
                  type="text"
                  id="card-holder"
                  placeholder="John Doe"
                  value={cardDetails.cardHolder}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                  required={paymentMethod === 'CARD'}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-expiry" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Expiry Date</label>
                  <input
                    type="text"
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    required={paymentMethod === 'CARD'}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="card-cvv" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>CVV</label>
                  <input
                    type="password"
                    id="card-cvv"
                    placeholder="123"
                    maxLength="3"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    required={paymentMethod === 'CARD'}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn-primary btn-secondary" 
              onClick={() => { setView('customer_hub'); setActiveTab('catalog'); }}
              style={{ flex: 1, margin: 0, padding: '0.75rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-gold" 
              disabled={cartLoading}
              style={{ flex: 2, margin: 0, padding: '0.75rem' }}
            >
              {cartLoading ? <div className="spinner"></div> : (paymentMethod === 'CARD' ? `Pay ₹${cartSubtotal.toFixed(2)}` : 'Confirm Order →')}
            </button>
          </div>
        </form>
      </div>

      {/* Right side: order summary */}
      <div className="checkout-summary glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2.5rem', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order Summary</h3>
        <p className="subtitle" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Review the items in your order</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
          {cartData.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <span style={{ color: '#fff', fontWeight: 500 }}>{item.productName}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
              </div>
              <span style={{ fontWeight: 500 }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-gold)' }}>₹{cartSubtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
