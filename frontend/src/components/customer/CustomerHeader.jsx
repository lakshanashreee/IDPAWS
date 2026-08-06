import React from 'react';
import { IconUser, IconOrders, IconBag } from '../common/Icons';

export default function CustomerHeader({
  userSession,
  activeTab,
  setActiveTab,
  isCartOpen,
  setIsCartOpen,
  cartTotalQuantity,
  cartData,
  handleLogout,
  onGoToCatalog,
  onGoHome
}) {
  const count = cartTotalQuantity !== undefined 
    ? cartTotalQuantity 
    : (cartData?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCollectionsClick = () => {
    if (onGoToCatalog) {
      onGoToCatalog();
    } else {
      setActiveTab('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="storefront-header">
      <div className="screen-container header-inner">
        {/* Left Column: User Profile & Nav Links */}
        <div className="header-left" style={{ gap: '1.2rem' }}>
          <div className="user-pill">
            <IconUser />
            <span><strong>{userSession.payload.name || userSession.payload.email}</strong></span>
          </div>
          <nav className="header-nav-links" style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <button type="button" className={`nav-text-link ${activeTab === 'catalog' ? 'active' : ''}`} onClick={handleCollectionsClick}>COLLECTIONS</button>
            <button type="button" className={`nav-text-link ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>ABOUT</button>
            <button type="button" className={`nav-text-link ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>CONTACT</button>
          </nav>
        </div>

        {/* Center Column: Big LAURITE Header (Redirects to Home Page) */}
        <div className="header-center" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-center">
            <span className="brand-initial-l">L</span>AURITE
          </div>
          <span className="brand-tag-sub">STYLE</span>
        </div>
        
        {/* Right Column: Static My Orders, Bag & Sign Out */}
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
            style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.15rem', position: 'relative' }}
          >
            <IconBag />
            <span>Bag</span>
            {count > 0 && (
              <span className="cart-badge-count">{count}</span>
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
