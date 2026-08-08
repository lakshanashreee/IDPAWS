import React from 'react';
import { IconBag } from './Icons';

export default function ProductModal({
  isAddingProduct,
  editingProduct,
  setIsAddingProduct,
  setEditingProduct,
  error,
  handleProductFormSubmit,
  productForm,
  setProductForm,
  categories,
  productImageFile,
  setProductImageFile,
  cartLoading,
  cleanS3ImageUrl
}) {
  if (!isAddingProduct && !editingProduct) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}>
      <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#1c1917', margin: 0 }}>
            {editingProduct ? 'Edit Catalog Product' : 'Create New Product'}
          </h2>
          <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#57534e' }}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleProductFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="prod-name">Product Name</label>
            <input
              type="text"
              id="prod-name"
              placeholder="e.g. Silk Evening Gown"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prod-cat">Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <select
                  value={categories.some(c => (c.name || c)?.toUpperCase() === productForm.category?.toUpperCase()) ? productForm.category?.toUpperCase() : 'CUSTOM'}
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM') {
                      setProductForm({ ...productForm, category: e.target.value });
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: '#ffffff', border: '1px solid rgba(212,197,185,0.6)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="CUSTOM">-- Select Existing Category --</option>
                  {categories.map(c => (
                    <option key={c.categoryId || c.name || c} value={c.name || c}>{c.name || c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  id="prod-cat"
                  placeholder="Or type custom category..."
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prod-price">Price (₹)</label>
              <input
                type="number"
                id="prod-price"
                placeholder="e.g. 1999"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prod-stock">Initial Stock Quantity</label>
              <input
                type="number"
                id="prod-stock"
                placeholder="e.g. 50"
                value={productForm.availableQuantity}
                onChange={(e) => setProductForm({ ...productForm, availableQuantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prod-threshold">Low Stock Threshold</label>
              <input
                type="number"
                id="prod-threshold"
                placeholder="e.g. 10"
                value={productForm.lowStockThreshold}
                onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prod-desc">Product Description</label>
            <textarea
              id="prod-desc"
              placeholder="Provide detailed description..."
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '12px', background: '#ffffff', border: '1px solid rgba(212,197,185,0.6)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
              required
            />
          </div>

          {/* Drag and drop image uploader */}
          <div className="form-group">
            <label>Product Image Upload</label>
            <div
              className="image-drag-drop-zone"
              style={{
                border: '2px dashed rgba(212,197,185,0.8)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#faf8f5',
                transition: 'border-color 0.2s',
                position: 'relative'
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(212,197,185,0.8)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(212,197,185,0.8)';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  setProductImageFile(file);
                }
              }}
              onClick={() => document.getElementById('product-file-input').click()}
            >
              <input
                type="file"
                id="product-file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setProductImageFile(file);
                }}
              />
              {productImageFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={URL.createObjectURL(productImageFile)}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{productImageFile.name}</span>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={(e) => { e.stopPropagation(); setProductImageFile(null); }}
                    style={{ width: 'auto', margin: 0, padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: '#ef4444' }}
                  >
                    Remove Image
                  </button>
                </div>
              ) : productForm.imageUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={productForm.imageUrl}
                    alt="Current Product Image"
                    style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }}
                    onError={(e) => {
                      const base = cleanS3ImageUrl ? cleanS3ImageUrl(productForm.imageUrl) : productForm.imageUrl.split('?')[0];
                      if (base && e.target.src !== base) {
                        e.target.src = base;
                      }
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current image preserved — drop or click to replace</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}><IconBag /></span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Drag &amp; Drop product image here, or <strong>click to browse</strong></span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn-primary btn-secondary" 
              onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
              style={{ flex: 1, margin: 0 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-gold" 
              disabled={cartLoading}
              style={{ flex: 2, margin: 0 }}
            >
              {cartLoading ? <div className="spinner"></div> : (editingProduct ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
