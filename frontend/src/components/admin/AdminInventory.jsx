import React from 'react';
import { IconWarning, IconBag, IconEdit } from '../common/Icons';

export default function AdminInventory({
  products,
  adminInventory,
  editingInventoryId,
  setEditingInventoryId,
  editingInventoryQty,
  setEditingInventoryQty,
  addStock,
  reduceStock,
  fetchAdminInventory
}) {
  const lowStockItems = [];
  const healthyStockItems = [];

  products.forEach(product => {
    const inv = adminInventory.find(i => i.productId === product.productId) || { availableQuantity: 0, lowStockThreshold: 5 };
    const stockInfo = {
      product,
      availableQuantity: inv.availableQuantity,
      lowStockThreshold: inv.lowStockThreshold
    };
    if (inv.availableQuantity <= inv.lowStockThreshold) {
      lowStockItems.push(stockInfo);
    } else {
      healthyStockItems.push(stockInfo);
    }
  });

  return (
    <div className="admin-tab-content animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Inventory Stock Management</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Low Stock Section */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(239,68,68,0.04)' }}>
          <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <IconWarning /> Low Stock Alerts ({lowStockItems.length})
          </h3>
          {lowStockItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All product stocks are at healthy levels. Excellent!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStockItems.map(item => (
                <div key={item.product.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f5', border: '1px solid rgba(212,197,185,0.4)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.product.imageUrl || item.product.image ? (
                      <img src={item.product.imageUrl || item.product.image} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><IconBag /></div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, color: '#1c1917' }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold: {item.lowStockThreshold}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {editingInventoryId === item.product.productId ? (
                      <>
                        <input
                          type="number" min="0"
                          value={editingInventoryQty}
                          onChange={(e) => setEditingInventoryQty(e.target.value)}
                          style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--accent-gold)', background: '#fff', color: '#1c1917', fontSize: '0.9rem' }}
                        />
                        <button type="button" className="btn-primary btn-gold" style={{ margin: 0, padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.8rem' }}
                          onClick={async () => {
                            try {
                              const q = parseInt(editingInventoryQty);
                              const inv = adminInventory.find(i => i.productId === item.product.productId);
                              const current = inv ? inv.availableQuantity : 0;
                              if (q > current) {
                                await addStock(item.product.productId, q - current);
                              } else if (q < current) {
                                await reduceStock(item.product.productId, current - q);
                              }
                              await fetchAdminInventory();
                            } catch(e) { alert('Failed to update: ' + e.message); }
                            setEditingInventoryId(null);
                          }}
                        >Save</button>
                        <button type="button" style={{ margin: 0, padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(212,197,185,0.6)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                          onClick={() => setEditingInventoryId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>{item.availableQuantity} left</span>
                        <button type="button" className="btn-primary btn-gold" onClick={() => { setEditingInventoryId(item.product.productId); setEditingInventoryQty(String(item.availableQuantity)); }} style={{ margin: 0, padding: '0.4rem 1rem', width: 'auto', fontSize: '0.85rem' }}>Restock</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Healthy Stock Section */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.4)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            Healthy Stock ({healthyStockItems.length})
          </h3>
          {healthyStockItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No healthy stock items found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {healthyStockItems.map(item => (
                <div key={item.product.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid rgba(212,197,185,0.5)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.product.imageUrl || item.product.image ? (
                      <img src={item.product.imageUrl || item.product.image} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><IconBag /></div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, color: '#1c1917' }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold: {item.lowStockThreshold}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {editingInventoryId === item.product.productId ? (
                      <>
                        <input
                          type="number" min="0"
                          value={editingInventoryQty}
                          onChange={(e) => setEditingInventoryQty(e.target.value)}
                          style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--accent-gold)', background: '#fff', color: '#1c1917', fontSize: '0.9rem' }}
                        />
                        <button type="button" className="btn-primary btn-gold" style={{ margin: 0, padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.8rem' }}
                          onClick={async () => {
                            try {
                              const q = parseInt(editingInventoryQty);
                              const inv = adminInventory.find(i => i.productId === item.product.productId);
                              const current = inv ? inv.availableQuantity : 0;
                              if (q > current) {
                                await addStock(item.product.productId, q - current);
                              } else if (q < current) {
                                await reduceStock(item.product.productId, current - q);
                              }
                              await fetchAdminInventory();
                            } catch(e) { alert('Failed to update: ' + e.message); }
                            setEditingInventoryId(null);
                          }}
                        >Save</button>
                        <button type="button" style={{ margin: 0, padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(212,197,185,0.6)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                          onClick={() => setEditingInventoryId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>{item.availableQuantity} units</span>
                        <button type="button" className="btn-primary btn-secondary" onClick={() => { setEditingInventoryId(item.product.productId); setEditingInventoryQty(String(item.availableQuantity)); }} style={{ margin: 0, padding: '0.4rem 1rem', width: 'auto', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <IconEdit /> Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
