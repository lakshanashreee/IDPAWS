import React from 'react';

export default function AdminAnalytics({
  adminOrders,
  adminInventory,
  products
}) {
  // Compute dashboard statistics
  const totalRevenue = adminOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = adminOrders.length;
  const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  
  let outOfStock = 0;
  let lowStock = 0;
  adminInventory.forEach(item => {
    if (item.availableQuantity === 0) outOfStock += 1;
    else if (item.availableQuantity <= item.lowStockThreshold) lowStock += 1;
  });

  const categoryCounts = {};
  products.forEach(p => {
    const cat = p.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="admin-tab-content animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Sales & Catalog Analytics</h2>

      <div>
        {/* Stats Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Platform Revenue</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#059669' }}>₹{totalRevenue.toFixed(2)}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Accumulated across all order events</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders Placed</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#1c1917' }}>{totalOrders}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Includes confirmed and pending orders</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Order Value</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#1c1917' }}>₹{avgOrderVal.toFixed(2)}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Average checkout basket amount</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory Stock Alerts</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#dc2626' }}>{lowStock}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{outOfStock} items currently out of stock</p>
          </div>
        </div>

        {/* Recent Activity / Performance Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Top Categories */}
          <div className="glass-card" style={{ padding: '2rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.3rem' }}>Category Popularity</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Distribution of catalog listings by category</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = ((count / products.length) * 100).toFixed(0);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#1c1917' }}>{cat}</span>
                      <strong style={{ color: '#1c1917' }}>{count} items ({percent}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f4efe6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: '2rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.3rem' }}>Recent Orders Activity</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Audit timeline of order placements</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {adminOrders.slice(0, 5).map(order => (
                <div key={order.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(212,197,185,0.4)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1c1917' }}>Order {order.orderId}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#059669' }}>+₹{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
