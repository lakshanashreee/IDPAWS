import React, { useState, useRef, useEffect } from 'react';
import { IconUser, IconOrders, IconBag, IconHeart } from '../common/Icons';
import { getUserProfile } from '../../utils/api';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        if (userSession?.payload?.sub) {
          const data = await getUserProfile(userSession.payload.sub);
          if (data && (data.photoUrl || data.profilePhotoUrl)) {
            setProfilePhoto(data.photoUrl || data.profilePhotoUrl);
          }
        }
      } catch (e) {
        // Ignore if not found
      }
    };
    fetchPhoto();
  }, [userSession]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="storefront-header">
      <div className="screen-container header-inner">
        {/* Left Column: User Profile & Nav Links */}
        <div className="header-left" style={{ gap: '1.2rem' }}>
          <div className="user-pill" style={{ cursor: 'default' }}>
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
        
        {/* Right Column: Static My Orders, Bag & Profile Dropdown */}
        <div className="header-right">
          <button 
            type="button" 
            className={`category-pill-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
            style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.15rem' }}
          >
            <IconHeart /> Wishlist
          </button>

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

          <div className="profile-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className="profile-avatar-btn" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', padding: 0, overflow: 'hidden'
              }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IconUser />
              )}
            </button>
            
            {isDropdownOpen && (
              <div className="profile-dropdown-menu" style={{
                position: 'absolute', top: '110%', right: '0',
                background: 'var(--bg-primary)', border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: '8px',
                width: '180px', overflow: 'hidden', zIndex: 100, display: 'flex', flexDirection: 'column'
              }}>
                <button 
                  style={{
                    padding: '1rem 1.5rem', background: 'none', border: 'none', 
                    borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left',
                    cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)',
                    fontFamily: 'inherit', display: 'block', width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    setActiveTab('profile');
                    setIsDropdownOpen(false);
                  }}
                >
                  My Profile
                </button>
                <button 
                  style={{
                    padding: '1rem 1.5rem', background: 'none', border: 'none', 
                    textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: '#d32f2f',
                    fontFamily: 'inherit', display: 'block', width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
