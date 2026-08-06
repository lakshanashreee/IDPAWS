import React from 'react';
import { IconUser } from '../common/Icons';

export default function AdminHeader({
  userSession,
  adminTab,
  setAdminTab,
  setSelectedCustomer,
  handleLogout
}) {
  return (
    <>
      <header className="storefront-header">
        <div className="screen-container header-inner" style={{ width: '100%' }}>
          <div className="header-left">
            <div className="user-pill">
              <IconUser />
              <span><strong>{userSession.payload.name || userSession.payload.email}</strong> (Admin)</span>
            </div>
          </div>

          <div className="header-center">
            <div className="brand-logo-center">
              <span className="brand-initial-l">L</span>AURITE
            </div>
            <span className="brand-tag-sub">ADMIN CONSOLE</span>
          </div>

          <div className="header-right">
            <button className="btn-primary btn-secondary" style={{ margin: 0, padding: '0.55rem 1.25rem', width: 'auto' }} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 2rem 0' }}>
        <nav className="category-pills-container" style={{ background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(212,197,185,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <button 
            type="button" 
            className={`category-pill-btn ${adminTab === 'products' ? 'active' : ''}`}
            onClick={() => { setAdminTab('products'); setSelectedCustomer(null); }}
          >
            Products Catalog
          </button>
          <button 
            type="button" 
            className={`category-pill-btn ${adminTab === 'inventory' ? 'active' : ''}`}
            onClick={() => { setAdminTab('inventory'); setSelectedCustomer(null); }}
          >
            Stock Inventory
          </button>
          <button 
            type="button" 
            className={`category-pill-btn ${adminTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setAdminTab('categories'); setSelectedCustomer(null); }}
          >
            Categories
          </button>
          <button 
            type="button" 
            className={`category-pill-btn ${adminTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setAdminTab('customers'); }}
          >
            Customers & Orders
          </button>
          <button 
            type="button" 
            className={`category-pill-btn ${adminTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setAdminTab('analytics'); setSelectedCustomer(null); }}
          >
            Sales Analytics
          </button>
        </nav>
      </div>
    </>
  );
}
