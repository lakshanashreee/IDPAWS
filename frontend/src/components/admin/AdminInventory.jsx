import React, { useState } from 'react';
import { IconWarning, IconBag, IconEdit } from '../common/Icons';

export default function AdminInventory({
  products,
  adminInventory,
  editingInventoryId,
  setEditingInventoryId,
  editingInventoryQty,
  setEditingInventoryQty,
  createInventory,
  addStock,
  reduceStock,
  updateInventory,
  fetchAdminInventory
}) {
  const lowStockItems = [];
  const healthyStockItems = [];
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkQty, setBulkQty] = useState('');

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(lowStockItems.map(item => item.product.productId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (productId, checked) => {
    const newSet = new Set(selectedItems);
    if (checked) newSet.add(productId);
    else newSet.delete(productId);
    setSelectedItems(newSet);
  };

  const handleBulkRestock = async () => {
    if (selectedItems.size === 0) return;
    const q = parseInt(bulkQty);
    if (isNaN(q) || q < 0) return alert('Enter a valid quantity to set');
    
    try {
      const promises = Array.from(selectedItems).map(async (productId) => {
        const inv = adminInventory.find(i => i.productId === productId);
        const current = inv ? inv.availableQuantity : 0;
        if (!inv) {
          return createInventory({ productId, availableQuantity: q, reservedQuantity: 0, lowStockThreshold: 5 });
        } else {
          if (q > current) return addStock(productId, q - current);
          else if (q < current) return reduceStock(productId, current - q);
        }
      });
      await Promise.all(promises);
      await fetchAdminInventory();
      setSelectedItems(new Set());
      setBulkQty('');
    } catch(err) {
      alert('Bulk restock failed: ' + err.message);
    }
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <IconWarning /> Low Stock Alerts ({lowStockItems.length})
            </h3>
            
            {lowStockItems.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#faf8f5', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(212,197,185,0.4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1c1917' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={lowStockItems.length > 0 && selectedItems.size === lowStockItems.length} style={{ cursor: 'pointer' }} />
                  Select All
                </label>
                
                {selectedItems.size > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid rgba(212,197,185,0.6)', paddingLeft: '1rem' }}>
                    <input 
                      type="number" min="0" placeholder="New Qty" 
                      value={bulkQty} onChange={(e) => setBulkQty(e.target.value)}
                      style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--accent-gold)', background: '#fff', fontSize: '0.9rem' }}
                    />
                    <button type="button" className="btn-primary btn-gold" style={{ margin: 0, padding: '0.35rem 1rem', width: 'auto', fontSize: '0.85rem' }} onClick={handleBulkRestock}>
                      Restock Selected ({selectedItems.size})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {lowStockItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All product stocks are at healthy levels. Excellent!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStockItems.map(item => (
                <div key={item.product.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedItems.has(item.product.productId) ? '#fef6f6' : '#faf8f5', border: selectedItems.has(item.product.productId) ? '1px solid #ef4444' : '1px solid rgba(212,197,185,0.4)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem', transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="checkbox" checked={selectedItems.has(item.product.productId)} onChange={(e) => handleSelectItem(item.product.productId, e.target.checked)} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
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
                              
                              if (!inv) {
                                // Product is not in inventory table at all yet.
                                await createInventory({
                                  productId: item.product.productId,
                                  availableQuantity: q,
                                  reservedQuantity: 0,
                                  lowStockThreshold: 5
                                });
                              } else {
                                if (q > current) {
                                  await addStock(item.product.productId, q - current);
                                } else if (q < current) {
                                  await reduceStock(item.product.productId, current - q);
                                }
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
                              
                              if (!inv) {
                                await createInventory({
                                  productId: item.product.productId,
                                  availableQuantity: q,
                                  reservedQuantity: 0,
                                  lowStockThreshold: 5
                                });
                              } else {
                                await updateInventory(item.product.productId, { availableQuantity: q });
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
