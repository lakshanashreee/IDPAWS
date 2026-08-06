import React, { useState } from 'react';
import { IconWarning, IconRefresh, IconEdit } from '../common/Icons';

export default function AdminCategories({
  categories,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUploadUrl // Assuming we can use this for categories too, or reuse existing product image logic
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

  const resetForm = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', imageUrl: '' });
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (cat) => {
    resetForm();
    setEditingCategory(cat.categoryId);
    setFormData({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Category name is required');
    
    try {
      if (isCreating) {
        await createCategory(formData);
      } else if (editingCategory) {
        await updateCategory(editingCategory, formData);
      }
      await fetchCategories();
      resetForm();
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="admin-tab-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Category Management</h2>
        {!isCreating && !editingCategory && (
          <button type="button" className="btn-primary" onClick={startCreate} style={{ width: 'auto' }}>
            Add New Category
          </button>
        )}
      </div>

      {(isCreating || editingCategory) && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent-gold)' }}>{isCreating ? 'Create Category' : 'Edit Category'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Category Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="e.g. ELECTRONICS" 
                style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212,197,185,0.6)', background: '#fff', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Category description..." 
                style={{ minHeight: '100px', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212,197,185,0.6)', background: '#fff', fontSize: '1rem', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            
            <div className="image-upload-area" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Category Image</label>
              
              {!formData.imageUrl ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (e) => setFormData({...formData, imageUrl: e.target.result});
                      reader.readAsDataURL(file);
                    }
                  }}
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = (e) => setFormData({...formData, imageUrl: e.target.result});
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}
                  onClick={() => document.getElementById('cat-image-upload').click()}
                  style={{ 
                    border: '2px dashed rgba(212,197,185,0.8)', 
                    borderRadius: '12px', 
                    padding: '3rem 1rem', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    background: 'rgba(250,248,245,0.5)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,197,185,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(250,248,245,0.5)'}
                >
                  <input 
                    id="cat-image-upload"
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setFormData({...formData, imageUrl: e.target.result});
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <div style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <p style={{ margin: 0, fontWeight: 500, color: '#1c1917' }}>Click to upload, drag and drop, or paste an image</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP, GIF</p>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
                  <img src={formData.imageUrl} alt="Category Preview" style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '12px', border: '1px solid rgba(212,197,185,0.4)' }} />
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, imageUrl: ''})} 
                    style={{ 
                      position: 'absolute', top: '-10px', right: '-10px', 
                      background: '#fff', border: '1px solid #ef4444', color: '#ef4444', 
                      width: '30px', height: '30px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem 1.5rem', fontWeight: 600 }}>Save Category</button>
              <button type="button" onClick={resetForm} style={{ flex: 1, padding: '0.8rem 1.5rem', background: '#fff', border: '1px solid rgba(212,197,185,0.8)', color: '#444', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!isCreating && !editingCategory && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {categories.map(cat => (
            <div key={cat.categoryId} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,197,185,0.4)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '150px', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No Image</span>
                )}
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1c1917', fontSize: '1.1rem' }}>{cat.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{cat.description || 'No description'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => startEdit(cat)} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--accent-gold)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDelete(cat.categoryId)} style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No categories found.</p>
              <button type="button" className="btn-primary" onClick={startCreate} style={{ width: 'auto' }}>Create your first category</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
