import React from 'react';
import { IconUser, IconOrders, IconBag } from '../common/Icons';

export default function CustomerHeader({
  userSession,
  activeTab,
  setActiveTab,
  isCartOpen,
  setIsCartOpen,
  cartTotalQuantity,
  handleLogout
}) {
  return (
    <header className="storefront-header">
      <div className="screen-container header-inner">
        {/* Left Column: User Profile */}
        <div className="header-left">
          <div className="user-pill">
            <IconUser />
            <span><strong>{userSession.payload.name || userSession.payload.email}</strong></span>
          </div>
        </div>

        {/* Center Column: Big LAURITE Header */}
        <div className="header-center" onClick={() => setActiveTab('storefront')}>
          <div className="brand-logo-center">
            <span className="brand-initial-l">L</span>AURITE
          </div>
          <span className="brand-tag-sub">HAUTE COUTURE</span>
        </div>
        
        {/* Right Column: My Orders, Bag & Sign Out */}
        <div className="header-right">
          <button 
            type="button" 
            className={`category-pill-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.15rem' }}
          >
            <IconOrders /> My Orders
          </button>

          <button 
            type="button" 
            className={`category-pill-btn ${isCartOpen ? 'active' : ''}`} 
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Bag"
            style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.15rem' }}
          >
            <IconBag />
            <span>Bag</span>
            {cartTotalQuantity > 0 && (
              <span className="cart-badge-count">{cartTotalQuantity}</span>
            )}
          </button>

          <button className="btn-primary btn-secondary" style={{ margin: 0, padding: '0.55rem 1.25rem', width: 'auto' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
