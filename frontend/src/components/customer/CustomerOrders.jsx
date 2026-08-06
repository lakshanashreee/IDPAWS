import React from 'react';
import { IconRefresh, IconInvoice } from '../common/Icons';

export default function CustomerOrders({
  ordersLoading,
  ordersError,
  orders,
  fetchOrders,
  setActiveTab,
  setSelectedOrderForInvoice
}) {
  return (
    <div className="orders-section animate-fade-in screen-container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>My Orders</h2>
        <button type="button" className="btn-primary btn-secondary" onClick={fetchOrders} disabled={ordersLoading} style={{ margin: 0, padding: '0.55rem 1.25rem', fontSize: '0.85rem', width: 'auto' }}>
          <IconRefresh /> Refresh Orders
        </button>
      </div>

      {ordersLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      ) : ordersError ? (
        <div className="error-state-card" style={{ background: '#fff', borderRadius: '24px', padding: '3rem', textAlign: 'center' }}>
          <h2 className="error-state-title" style={{ color: 'var(--text-main)' }}>Failed to load orders</h2>
          <p className="error-state-desc" style={{ color: 'var(--text-muted)' }}>{ordersError}</p>
          <button type="button" className="btn-primary" onClick={fetchOrders} style={{ width: 'auto', marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state" style={{ background: '#fff', borderRadius: '24px', padding: '4rem 1rem', textAlign: 'center', border: '1px solid rgba(212,197,185,0.4)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
          <button type="button" className="btn-primary btn-gold" onClick={() => setActiveTab('catalog')} style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 2rem' }}>
            Explore Catalog →
          </button>
        </div>
      ) : (
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => (
            <div key={order.orderId} className="order-card-luxury" style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', transition: 'var(--transition-smooth)' }}>
              <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(212,197,185,0.3)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ORDER REFERENCE</span>
                  <h3 className="order-id-title" style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{order.orderId}</h3>
                  <span className="order-date-text" style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Placed on {new Date(order.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className="status-pill" style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(212,197,185,0.2)', color: 'var(--text-main)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {order.status || 'PLACED'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Payment: {order.paymentMode || 'COD'} ({order.paymentStatus || 'SUCCESS'})
                  </span>
                </div>
              </div>

              <div className="order-items-table" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>{item.productName}</strong>
                      <span className="order-item-qty" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>x{item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', margin: '-0.5rem -0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Total Amount</span>
                  <strong className="order-total-amount" style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>₹{Number(order.totalAmount).toFixed(2)}</strong>
                </div>
                <button 
                  type="button" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  onClick={() => setSelectedOrderForInvoice(order)}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-gold)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <IconInvoice /> View Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
