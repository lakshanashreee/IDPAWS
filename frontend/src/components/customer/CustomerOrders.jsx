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
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.orderId} className="order-card-luxury">
              <div className="order-card-header">
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', display: 'block', fontWeight: 700, letterSpacing: '0.15em' }}>ORDER REFERENCE</span>
                  <h3 className="order-id-title" style={{ color: '#1c1917', fontSize: '1.15rem', marginTop: '0.1rem' }}>{order.orderId}</h3>
                  <span className="order-date-text" style={{ color: '#57534e', fontSize: '0.82rem' }}>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span className="status-pill">
                    {order.status || 'PLACED'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#57534e', fontWeight: 600 }}>
                    Payment: {order.paymentMode || 'COD'} ({order.paymentStatus || 'SUCCESS'})
                  </span>
                </div>
              </div>

              <div className="order-items-table">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>
                      <strong style={{ color: '#1c1917', fontSize: '0.95rem' }}>{item.productName}</strong>
                      <span className="order-item-qty">x{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: '#1c1917' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: '#57534e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Amount</span>
                  <strong className="order-total-amount" style={{ color: '#1c1917', fontSize: '1.4rem' }}>₹{Number(order.totalAmount).toFixed(2)}</strong>
                </div>
                <button 
                  type="button" 
                  className="btn-primary btn-secondary"
                  style={{ width: 'auto', margin: 0, padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}
                  onClick={() => setSelectedOrderForInvoice(order)}
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
