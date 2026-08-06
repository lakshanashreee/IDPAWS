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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Category Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. ELECTRONICS" />
            </div>
            <div>
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Category description..." style={{ minHeight: '80px' }} />
            </div>
            
            <div className="image-upload-area">
              <label>Category Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" style={{ marginBottom: '1rem' }} />
              {formData.imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <img src={formData.imageUrl} alt="Category Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>Remove Image</button>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>Save Category</button>
              <button type="button" onClick={resetForm} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
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
                  <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
