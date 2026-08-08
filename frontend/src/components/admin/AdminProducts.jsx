import React from 'react';
import { IconPlus, IconBag, IconEdit, IconTrash } from '../common/Icons';

export default function AdminProducts({
  setEditingProduct,
  setProductForm,
  setIsAddingProduct,
  products,
  adminInventory,
  handleEditClick,
  handleDeleteProduct
}) {
  return (
    <div className="admin-tab-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)' }}>Products Management</h2>
        <button 
          type="button" 
          className="btn-primary btn-gold" 
          onClick={() => {
            setEditingProduct(null);
            setProductForm({
              name: '',
              description: '',
              category: '',
              price: '',
              active: true,
              availableQuantity: 50,
              lowStockThreshold: 10,
              imageUrl: ''
            });
            setIsAddingProduct(true);
          }}
          style={{ margin: 0, width: 'auto', padding: '0.65rem 1.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <IconPlus /> Add New Product
        </button>
      </div>

      <div className="admin-products-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => {
          const inv = adminInventory.find(i => i.productId === product.productId) || {};
          return (
            <div key={product.productId} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="product-image-container" style={{ position: 'relative' }}>
                {product.imageUrl || product.image ? (
                  <img className="product-image" style={{ objectFit: 'contain' }} src={product.imageUrl || product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="placeholder-icon" style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}><IconBag /></span>
                    <span className="placeholder-text">{product.category || 'PRODUCT'}</span>
                  </div>
                )}
                <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: product.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: product.active ? '#10b981' : '#ef4444' }}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="product-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="product-category-label">{product.category || 'general'}</span>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description || 'No description available.'}</p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Stock: <strong>{inv.availableQuantity !== undefined ? inv.availableQuantity : 'N/A'}</strong> (Min: {inv.lowStockThreshold !== undefined ? inv.lowStockThreshold : 'N/A'})
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="btn-primary btn-secondary" 
                      onClick={() => handleEditClick(product)}
                      style={{ padding: '0.4rem 0.8rem', margin: 0, width: 'auto', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <IconEdit /> Edit
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={() => handleDeleteProduct(product.productId)}
                      style={{ padding: '0.4rem 0.8rem', margin: 0, width: 'auto', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <IconTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
