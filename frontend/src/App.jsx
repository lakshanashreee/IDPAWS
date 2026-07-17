import { useState, useEffect, useCallback } from 'react';
import {
  signUpUser,
  confirmUserSignUp,
  resendConfirmationCode,
  signInUser,
  completeNewPasswordChallenge
} from './utils/cognito';
import {
  getProducts,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder
} from './utils/api';

function App() {
  // Navigation states: 'login' | 'register' | 'confirm' | 'new_password_required' | 'customer_hub' | 'admin_hub'
  const [view, setView] = useState('login');
  
  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  
  // New password challenge states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [challengeUser, setChallengeUser] = useState(null);

  // Status and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Authenticated user session state
  const [userSession, setUserSession] = useState(null);

  // ----------------------------------------------------
  // STOREFRONT STATES
  // ----------------------------------------------------
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ALL']);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartData, setCartData] = useState({ items: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // API Error Tracking
  const [storefrontError, setStorefrontError] = useState('');
  const [storefrontLoading, setStorefrontLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Check if there is an active session in localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('cognito_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUserSession(parsed);
        const groups = parsed.payload['cognito:groups'] || [];
        if (groups.includes('ADMIN')) {
          setView('admin_hub');
        } else {
          setView('customer_hub');
        }
      } catch (e) {
        localStorage.removeItem('cognito_session');
      }
    }
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setStorefrontError('');
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('cognito_session');
    setUserSession(null);
    setEmail('');
    setPassword('');
    setName('');
    setCode('');
    setNewPassword('');
    setChallengeUser(null);
    setProducts([]);
    setCartData({ items: [] });
    setIsCartOpen(false);
    setOrderSuccess(null);
    clearMessages();
    setView('login');
  }, []);

  // Central Interceptor Error Handler
  const handleApiError = useCallback((err, retryCallback) => {
    console.error('API Error captured:', err);
    if (err.message === 'UNAUTHORIZED') {
      handleLogout();
      setError('Your session has expired. Please log in again.');
      return;
    }
    setStorefrontError(err.message || 'An error occurred during backend connection.');
  }, [handleLogout]);

  // Fetch Products Handler
  const fetchProducts = useCallback(async () => {
    setStorefrontLoading(true);
    setStorefrontError('');
    try {
      const data = await getProducts();
      // Ensure products is an array
      const productList = Array.isArray(data) ? data : (data?.products || []);
      setProducts(productList);

      // Extract unique categories dynamically
      const uniqueCats = ['ALL', ...new Set(productList.map(p => (p.category || 'Other').toUpperCase()))];
      setCategories(uniqueCats);
    } catch (err) {
      handleApiError(err, fetchProducts);
    } finally {
      setStorefrontLoading(false);
    }
  }, [handleApiError]);

  // Fetch Cart Handler
  const fetchCart = useCallback(async () => {
    if (!userSession) return;
    setCartLoading(true);
    try {
      const data = await getCart(userSession.payload.sub);
      setCartData(data || { items: [] });
    } catch (err) {
      handleApiError(err, fetchCart);
    } finally {
      setCartLoading(false);
    }
  }, [userSession, handleApiError]);

  // Trigger data fetches on customer hub activation
  useEffect(() => {
    if (view === 'customer_hub' && userSession) {
      fetchProducts();
      fetchCart();
    }
  }, [view, userSession, fetchProducts, fetchCart]);

  // Sign Up Handler (Customer registration)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password || !name) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUpUser(email, password, name);
      setSuccess('Registration successful! Please check your email for the confirmation code.');
      setView('confirm');
    } catch (err) {
      setError(err.message || 'Error signing up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Sign Up Handler
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !code) {
      setError('Email and Confirmation Code are required.');
      return;
    }

    setLoading(true);
    try {
      await confirmUserSignUp(email, code);
      setSuccess('Email confirmed successfully! You can now log in.');
      setView('login');
      setPassword(''); // Clear password for security
    } catch (err) {
      setError(err.message || 'Invalid confirmation code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Code Handler
  const handleResendCode = async () => {
    clearMessages();
    if (!email) {
      setError('Please enter your email to resend the code.');
      return;
    }

    setLoading(true);
    try {
      await resendConfirmationCode(email);
      setSuccess('A new confirmation code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Error resending code.');
    } finally {
      setLoading(false);
    }
  };

  // Sign In Handler
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInUser(email, password);
      
      // If Cognito triggers a force new password challenge
      if (result.newPasswordRequired) {
        setChallengeUser(result.cognitoUser);
        setView('new_password_required');
        setSuccess('First-time login: You are required to set a new password.');
        return;
      }

      // Successful login
      processSuccessfulLogin(result);
    } catch (err) {
      if (err.code === 'UserNotConfirmedException') {
        setError('Your account is not confirmed yet. Please verify your email.');
        setView('confirm');
      } else {
        setError(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Complete Force Change Password Handler
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await completeNewPasswordChallenge(challengeUser, newPassword, {});
      setSuccess('Password updated successfully!');
      processSuccessfulLogin(result);
    } catch (err) {
      setError(err.message || 'Error setting new password.');
    } finally {
      setLoading(false);
    }
  };

  const processSuccessfulLogin = (sessionData) => {
    setUserSession(sessionData);
    localStorage.setItem('cognito_session', JSON.stringify(sessionData));

    // Extract roles from groups
    const groups = sessionData.payload['cognito:groups'] || [];
    
    if (groups.includes('ADMIN')) {
      setView('admin_hub');
    } else {
      setView('customer_hub');
    }
  };

  const handleDevBypass = () => {
    const mockSession = {
      idToken: 'fakeToken',
      accessToken: 'fakeAccess',
      payload: {
        sub: 'user-123',
        email: 'customer@test.com',
        'cognito:groups': ['CUSTOMER'],
        name: 'Test Customer'
      }
    };
    processSuccessfulLogin(mockSession);
  };

  // ----------------------------------------------------
  // STOREFRONT HANDLERS
  // ----------------------------------------------------
  const handleAddToCart = async (product) => {
    if (!userSession) return;
    clearMessages();
    setCartLoading(true);

    try {
      // Add product to cart in backend DynamoDB via Lambdas
      const updatedCart = await addCartItem(
        userSession.payload.sub,
        product.productId,
        product.name,
        product.price,
        1
      );
      setCartData(updatedCart);
      setSuccess(`Added "${product.name}" to cart!`);
      // Automatically clear notification after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      handleApiError(err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    if (!userSession) return;
    const targetQty = currentQuantity + change;
    if (targetQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartLoading(true);
    try {
      const updatedCart = await updateCartItem(userSession.payload.sub, productId, targetQty);
      setCartData(updatedCart);
    } catch (err) {
      handleApiError(err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!userSession) return;
    setCartLoading(true);
    try {
      const updatedCart = await removeCartItem(userSession.payload.sub, productId);
      setCartData(updatedCart);
    } catch (err) {
      handleApiError(err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!userSession || cartData.items.length === 0) return;
    setCartLoading(true);
    setStorefrontError('');

    try {
      // 1. Submit Order to Order Service Lambda
      const orderResult = await createOrder(userSession.payload.sub, cartData.items);
      const orderId = orderResult.orderId || orderResult.order?.orderId;
      
      // 2. Clear Cart in Cart Service Lambda
      await clearCart(userSession.payload.sub);
      
      // 3. Update Cart local state and open success modal
      setCartData({ items: [] });
      setIsCartOpen(false);
      setOrderSuccess(orderId || 'SUCCESS');
    } catch (err) {
      handleApiError(err);
    } finally {
      setCartLoading(false);
    }
  };

  // Filter and search logic
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'ALL' || (product.category && product.category.toUpperCase() === selectedCategory);
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const cartTotalQuantity = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative Ambient Background Lights */}
      <div className="ambient-glow glow-primary"></div>
      <div className="ambient-glow glow-secondary"></div>

      {/* Main Container Layout */}
      {view === 'customer_hub' && userSession ? (
        <div className="storefront-container animate-fade-in">
          
          {/* Header Section */}
          <header className="storefront-header">
            <div className="storefront-header-title">
              <span style={{ fontSize: '1.75rem' }}>🛍️</span>
              <h1>Aurora E-Shop</h1>
            </div>
            
            <div className="storefront-header-actions">
              <div className="user-info-pill">
                <span>👤</span>
                <span><strong>{userSession.payload.name || userSession.payload.email}</strong></span>
              </div>

              {/* Static Cart Icon Badge Trigger */}
              <button 
                type="button" 
                className="cart-trigger-btn" 
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping Cart"
              >
                🛒
                {cartTotalQuantity > 0 && (
                  <span className="cart-badge">{cartTotalQuantity}</span>
                )}
              </button>

              <button className="btn-primary btn-secondary" style={{ margin: 0, padding: '0.5rem 1rem' }} onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </header>

          {/* Alert messages inside Storefront */}
          {success && <div className="alert alert-success">{success}</div>}
          
          {/* Search bar & Category tags */}
          <section className="search-filter-section">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="search-input"
                placeholder="Search products by name, details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="category-tags">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-tag-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Product Grid / Error / Loading Handling */}
          {storefrontLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
          ) : storefrontError ? (
            <div className="error-state-card">
              <div className="error-state-icon">⚠️</div>
              <h2 className="error-state-title">Connection Error</h2>
              <p className="error-state-desc">{storefrontError}</p>
              <button type="button" className="btn-primary btn-retry" onClick={fetchProducts}>
                Retry Fetching Products
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No Products Found</h3>
              <p>Try modifying your search or changing the selected category.</p>
            </div>
          ) : (
            <main className="product-grid">
              {filteredProducts.map(product => (
                <div key={product.productId} className="product-card">
                  <div className="product-image-container">
                    {/* Support both image URL and graceful fallback placeholders */}
                    {product.imageUrl || product.image ? (
                      <img 
                        className="product-image" 
                        src={product.imageUrl || product.image} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className="product-image-placeholder"
                      style={{ display: (product.imageUrl || product.image) ? 'none' : 'flex' }}
                    >
                      <span className="placeholder-icon">🛍️</span>
                      <span className="placeholder-text">{product.category || 'PRODUCT'}</span>
                    </div>
                  </div>

                  <div className="product-info">
                    <span className="product-category-label">{product.category || 'general'}</span>
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-desc">{product.description || 'No description available for this catalog product.'}</p>
                    
                    <div className="product-footer">
                      <span className="product-price">${Number(product.price).toFixed(2)}</span>
                      <button 
                        type="button" 
                        className="btn-add-to-cart"
                        onClick={() => handleAddToCart(product)}
                        disabled={cartLoading}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </main>
          )}

          {/* Sliding Cart Drawer overlay backdrop */}
          {isCartOpen && (
            <>
              <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
              <div className="cart-drawer">
                
                <div className="cart-drawer-header">
                  <h2>Shopping Cart</h2>
                  <button type="button" className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
                    ✕
                  </button>
                </div>

                <div className="cart-items-container">
                  {cartData.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
                      <p>Your cart is empty.</p>
                    </div>
                  ) : (
                    cartData.items.map(item => (
                      <div key={item.productId} className="cart-item-row">
                        <div className="cart-item-info">
                          <h4 className="cart-item-name">{item.productName}</h4>
                          <span className="cart-item-price">${Number(item.price).toFixed(2)} each</span>
                        </div>

                        <div className="cart-qty-selector">
                          <button 
                            type="button" 
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                            disabled={cartLoading}
                          >
                            -
                          </button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button 
                            type="button" 
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                            disabled={cartLoading}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          type="button" 
                          className="btn-remove-item"
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={cartLoading}
                          aria-label="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cartData.items.length > 0 && (
                  <div className="cart-summary-section">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span style={{ color: 'var(--success)' }}>FREE</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Amount</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>

                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={handleCheckout}
                      disabled={cartLoading}
                    >
                      {cartLoading ? <div className="spinner"></div> : 'Place Order'}
                    </button>
                  </div>
                )}

              </div>
            </>
          )}

          {/* Checkout Success Modal Dialog */}
          {orderSuccess && (
            <div className="order-modal-backdrop">
              <div className="order-modal">
                <div className="order-success-icon">✓</div>
                <h2>Order Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.5rem 0' }}>
                  Thank you for your purchase. Your order event was successfully processed.
                </p>
                <div className="order-id-display">
                  {orderSuccess}
                </div>
                <button type="button" className="btn-primary" onClick={() => setOrderSuccess(null)}>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-card">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div>
              <h1>Welcome Back</h1>
              <p className="subtitle">Sign in to access your portal</p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSignInSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Sign In'}
                </button>
              </form>

              {import.meta.env.DEV && (
                <button 
                  type="button" 
                  className="btn-primary btn-secondary" 
                  style={{ marginTop: '1rem', border: '1px dashed rgba(139, 92, 246, 0.4)' }}
                  onClick={handleDevBypass}
                >
                  🛠️ Developer Bypass Login (Mock CUSTOMER)
                </button>
              )}

              <p className="footer-text">
                New customer?
                <span className="footer-link" onClick={() => { clearMessages(); setView('register'); }}>
                  Create an account
                </span>
              </p>
            </div>
          )}

          {/* REGISTER VIEW (Only for Customers) */}
          {view === 'register' && (
            <div>
              <h1>Create Account</h1>
              <p className="subtitle">Register as a customer</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSignUpSubmit}>
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input
                    type="text"
                    id="reg-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input
                    type="email"
                    id="reg-email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    type="password"
                    id="reg-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="reg-confirm-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Register Account'}
                </button>
              </form>

              <p className="footer-text">
                Already have an account?
                <span className="footer-link" onClick={() => { clearMessages(); setView('login'); }}>
                  Sign In
                </span>
              </p>
            </div>
          )}

          {/* CONFIRM CODE VIEW */}
          {view === 'confirm' && (
            <div>
              <h1>Verify Email</h1>
              <p className="subtitle">Enter the code sent to {email}</p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleConfirmSubmit}>
                <div className="form-group">
                  <label htmlFor="confirm-email">Email Address</label>
                  <input
                    type="email"
                    id="confirm-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="verification-code">Verification Code</label>
                  <input
                    type="text"
                    id="verification-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Confirm Account'}
                </button>
              </form>

              <button 
                type="button" 
                className="btn-primary btn-secondary" 
                onClick={handleResendCode}
                disabled={loading}
              >
                {loading ? <div className="spinner"></div> : 'Resend Verification Code'}
              </button>

              <p className="footer-text">
                Want to try logging in?
                <span className="footer-link" onClick={() => { clearMessages(); setView('login'); }}>
                  Go to Sign In
                </span>
              </p>
            </div>
          )}

          {/* NEW PASSWORD REQUIRED VIEW */}
          {view === 'new_password_required' && (
            <div>
              <h1>Update Password</h1>
              <p className="subtitle">Configure a new password for first-time use</p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleNewPasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Set Password & Log In'}
                </button>
              </form>
            </div>
          )}

          {/* ADMIN HUB (Coming Soon) */}
          {view === 'admin_hub' && userSession && (
            <div className="hub-container">
              <div className="hub-icon admin">🛡️</div>
              <h1>Admin Dashboard</h1>
              <div className="badge badge-admin">Verified Admin</div>
              <p className="subtitle" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                Welcome back, <strong>{userSession.payload.name || userSession.payload.email}</strong>!
              </p>

              {/* Session Verification details */}
              <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#fff' }}>Admin ID (sub):</strong> {userSession.payload.sub}</div>
                <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#fff' }}>Email:</strong> {userSession.payload.email}</div>
                <div><strong style={{ color: '#fff' }}>Groups:</strong> {JSON.stringify(userSession.payload['cognito:groups'] || [])}</div>
              </div>

              <h2 style={{ fontSize: '1.25rem', color: '#f472b6', marginBottom: '0.5rem' }}>Admin Control Center Coming Soon</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Your administrator credentials have been successfully authenticated. The management interface is under construction.
              </p>

              <button className="btn-primary btn-secondary" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;
