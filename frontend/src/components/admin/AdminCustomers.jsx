import React from 'react';
import { IconInvoice } from '../common/Icons';

export default function AdminCustomers({
  selectedCustomer,
  setSelectedCustomer,
  adminOrders,
  setSelectedOrderForInvoice
}) {
  // Extract unique customer userIds from adminOrders
  const customerMap = {};
  adminOrders.forEach(order => {
    if (!order.userId) return;
    if (!customerMap[order.userId]) {
      customerMap[order.userId] = {
        userId: order.userId,
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt
      };
    }
    customerMap[order.userId].orderCount += 1;
    customerMap[order.userId].totalSpent += order.totalAmount || 0;
    if (new Date(order.createdAt) > new Date(customerMap[order.userId].lastOrderDate)) {
      customerMap[order.userId].lastOrderDate = order.createdAt;
    }
  });

  const customerList = Object.values(customerMap);

  return (
    <div className="admin-tab-content animate-fade-in">
      {!selectedCustomer ? (
        <>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Customer Database</h2>
          {customerList.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', padding: '3rem', borderRadius: '20px', border: '1px solid rgba(212,197,185,0.4)', textAlign: 'center' }}>
              <h3>No Customers Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>No customer orders have been recorded in the system yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customerList.map(customer => (
                <div 
                  key={customer.userId} 
                  className="order-item-card" 
                  onClick={() => setSelectedCustomer(customer.userId)}
                  style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CUSTOMER ID / SUB</span>
                    <h3 style={{ fontSize: '1.1rem', color: '#1c1917', fontWeight: 700 }}>{customer.userId}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last active order: {new Date(customer.lastOrderDate).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Orders Placed</span>
                      <strong style={{ fontSize: '1.2rem', color: '#1c1917' }}>{customer.orderCount}</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Purchases</span>
                      <strong style={{ fontSize: '1.2rem', color: '#059669' }}>₹{customer.totalSpent.toFixed(2)}</strong>
                    </div>
                    <span style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {/* Customer Orders view */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              type="button" 
              className="btn-primary btn-secondary" 
              onClick={() => setSelectedCustomer(null)}
              style={{ margin: 0, width: 'auto', padding: '0.4rem 1rem' }}
            >
              ← Back to Customers
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#1c1917' }}>Orders history for customer: <span style={{ color: 'var(--accent-gold)' }}>{selectedCustomer.substring(0, 8)}...</span></h2>
          </div>

          {(() => {
            const customerOrders = adminOrders.filter(o => o.userId === selectedCustomer);
            customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {customerOrders.map(order => (
                  <div key={order.orderId} className="order-item-card" style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div className="order-item-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span className="order-id-label" style={{ fontSize: '0.75rem', color: '#57534e', display: 'block', fontWeight: 600 }}>ORDER ID</span>
                        <h3 className="order-id-val" style={{ fontSize: '1.1rem', color: '#1c1917', fontWeight: 700 }}>{order.orderId}</h3>
                        <span className="order-date-label" style={{ fontSize: '0.8rem', color: '#57534e' }}>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className={`status-badge status-${order.status ? order.status.toLowerCase() : 'placed'}`} style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(197, 160, 89, 0.15)', color: 'var(--accent-gold-hover)' }}>
                          {order.status || 'PLACED'}
                        </span>
                      </div>
                    </div>

                    <div className="order-item-body">
                      <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="order-product-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1c1917' }}>
                            <span className="order-product-name" style={{ color: '#57534e' }}>
                              <strong style={{ color: '#1c1917' }}>{item.productName}</strong> <span className="order-product-qty" style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: '#faf8f5', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(212,197,185,0.4)' }}>x{item.quantity}</span>
                            </span>
                            <span className="order-product-price" style={{ fontWeight: 700, color: '#1c1917' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(212,197,185,0.4)', paddingTop: '1rem' }}>
                      <div className="order-total-price" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', color: '#57534e' }}>Total Amount</span>
                        <strong style={{ fontSize: '1.25rem', color: '#1c1917', fontWeight: 800 }}>₹{Number(order.totalAmount).toFixed(2)}</strong>
                      </div>
                      <button 
                        type="button" 
                        className="btn-primary btn-secondary"
                        style={{ width: 'auto', margin: 0, padding: '0.5rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => setSelectedOrderForInvoice(order)}
                      >
                        <IconInvoice /> View Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
