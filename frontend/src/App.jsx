import React, { useState, useEffect, useCallback } from 'react';
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
  createOrder,
  getUserOrders,
  getOrderPayments,
  getAllOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createInventory,
  getInventory,
  updateInventory,
  reduceStock,
  addStock,
  createPayment,
  getImageUploadUrl,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from './utils/api';

// Common Components
import ProductModal from './components/common/ProductModal';
import InvoiceModal from './components/common/InvoiceModal';

// Auth Components
import LoginView from './components/auth/LoginView';
import SignUpView from './components/auth/SignUpView';
import ConfirmView from './components/auth/ConfirmView';
import NewPasswordView from './components/auth/NewPasswordView';

// Customer Components
import CustomerHeader from './components/customer/CustomerHeader';
import LandingPage from './components/customer/LandingPage';
import HeroSection from './components/customer/HeroSection';
import ProductCatalogue from './components/customer/ProductCatalogue';
import AboutView from './components/customer/AboutView';
import ContactView from './components/customer/ContactView';
import CustomerOrders from './components/customer/CustomerOrders';
import ShoppingBagDrawer from './components/customer/ShoppingBagDrawer';
import CheckoutView from './components/customer/CheckoutView';
import WishlistView from './components/customer/WishlistView';

// Admin Components
import AdminHeader from './components/admin/AdminHeader';
import AdminProducts from './components/admin/AdminProducts';
import AdminInventory from './components/admin/AdminInventory';
import AdminCategories from './components/admin/AdminCategories';
import AdminCustomers from './components/admin/AdminCustomers';
import AdminAnalytics from './components/admin/AdminAnalytics';

function App() {
  // Navigation states: 'login' | 'register' | 'confirm' | 'new_password_required' | 'customer_hub' | 'admin_hub' | 'checkout'
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartData, setCartData] = useState({ items: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  // API Error Tracking
  const [storefrontError, setStorefrontError] = useState('');
  const [storefrontLoading, setStorefrontLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // ----------------------------------------------------
  // ADDITIONAL CUSTOMER HUB STATES (Orders & Checkout)
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'orders'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  
  // Checkout & Payment states
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'CARD'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  // ----------------------------------------------------
  // ADMIN HUB STATES
  // ----------------------------------------------------
  const [adminTab, setAdminTab] = useState('products'); // 'products' | 'inventory' | 'categories' | 'customers' | 'analytics'
  const [adminInventory, setAdminInventory] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // String (userId)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Object | null
  const [editingInventoryId, setEditingInventoryId] = useState(null); // productId being inline-edited
  const [editingInventoryQty, setEditingInventoryQty] = useState(''); // temp qty value
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    active: true,
    availableQuantity: 50,
    lowStockThreshold: 10,
    imageUrl: ''
  });

  const [productImageFile, setProductImageFile] = useState(null);

  // Helper to strip pre-signed query strings from S3 URLs so Java backend comparison matches
  const cleanS3ImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url.split('?')[0].trim();
  };

  // Auto-sync Cart Items with updated catalog prices
  useEffect(() => {
    if (products.length > 0 && cartData.items.length > 0) {
      let updated = false;
      const syncedItems = cartData.items.map(item => {
        const match = products.find(p => p.productId === item.productId);
        if (match && Number(match.price) !== Number(item.price)) {
          updated = true;
          return { ...item, price: match.price, productName: match.name };
        }
        return item;
      });
      if (updated) {
        setCartData(prev => ({ ...prev, items: syncedItems }));
      }
    }
  }, [products, cartData.items]);

  // Restore cognito_session on initial load
  useEffect(() => {
    const saved = localStorage.getItem('cognito_session');
    if (saved) {
      try {
        const sessionData = JSON.parse(saved);
        setUserSession(sessionData);
        const groups = sessionData.payload['cognito:groups'] || [];
        if (groups.includes('ADMIN')) {
          setView('admin_hub');
        } else {
          setView('customer_hub');
        }
      } catch (err) {
        localStorage.removeItem('cognito_session');
      }
    }
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('cognito_session');
    setView('login');
    setCartData({ items: [] });
    setOrders([]);
    clearMessages();
  }, []);

  const handleApiError = useCallback((err, retryFunc) => {
    if (err.message === 'UNAUTHORIZED') {
      handleLogout();
      return;
    }
    setStorefrontError(err.message || 'An error occurred during backend connection.');
  }, [handleLogout]);

  const parseProduct = useCallback((product) => {
    if (!product) return product;
    let description = product.description || '';
    let imageUrl = product.imageUrl || product.image || '';
    let categoryName = product.category || 'General';

    if (typeof categoryName === 'object' && categoryName !== null) {
      categoryName = categoryName.name || 'General';
    }

    if (!imageUrl && description.includes('|||')) {
      const parts = description.split('|||');
      description = parts[0].trim();
      imageUrl = parts[1].trim();
    }

    return {
      ...product,
      category: categoryName,
      description,
      imageUrl
    };
  }, []);

  // Fetch Products Handler
  const fetchProducts = useCallback(async () => {
    setStorefrontLoading(true);
    setStorefrontError('');
    try {
      const data = await getProducts();
      const productList = Array.isArray(data) ? data : (data?.products || []);
      const parsedList = productList.map(parseProduct);
      setProducts(parsedList);
    } catch (err) {
      handleApiError(err, fetchProducts);
    } finally {
      setStorefrontLoading(false);
    }
  }, [handleApiError, parseProduct]);

  // Fetch Categories Handler
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

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

  // Fetch Wishlist Handler
  const fetchWishlist = useCallback(async () => {
    if (!userSession) return;
    try {
      const data = await getWishlist(userSession.payload.sub);
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  }, [userSession]);

  // Toggle Wishlist Handler
  const toggleWishlist = async (product) => {
    if (!userSession) return;
    const isWished = wishlistItems.some(item => item.productId === product.productId);
    
    // Optimistic UI update
    if (isWished) {
      setWishlistItems(prev => prev.filter(item => item.productId !== product.productId));
      try {
        await removeFromWishlist(userSession.payload.sub, product.productId);
      } catch (err) {
        // Revert on failure
        setWishlistItems(prev => [...prev, product]);
        handleApiError(err);
      }
    } else {
      setWishlistItems(prev => [...prev, product]);
      try {
        await addToWishlist(userSession.payload.sub, product.productId);
      } catch (err) {
        // Revert on failure
        setWishlistItems(prev => prev.filter(item => item.productId !== product.productId));
        handleApiError(err);
      }
    }
  };

  // Fetch Customer Orders Handler
  const fetchOrders = useCallback(async () => {
    if (!userSession) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const userOrders = await getUserOrders(userSession.payload.sub);
      const ordersList = Array.isArray(userOrders) ? userOrders : [];

      const ordersWithPayments = await Promise.all(ordersList.map(async (order) => {
        try {
          const paymentData = await getOrderPayments(order.orderId);
          const paymentsList = Array.isArray(paymentData) ? paymentData : (paymentData?.payments || []);
          const latestPayment = paymentsList.length > 0 ? paymentsList[paymentsList.length - 1] : null;

          return {
            ...order,
            paymentMode: latestPayment ? latestPayment.paymentMode : 'COD',
            paymentStatus: latestPayment ? latestPayment.status : 'SUCCESS'
          };
        } catch (e) {
          return {
            ...order,
            paymentMode: 'COD',
            paymentStatus: 'SUCCESS'
          };
        }
      }));

      ordersWithPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersWithPayments);
    } catch (err) {
      setOrdersError(err.message || 'Failed to fetch your orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, [userSession]);

  // Fetch Admin Inventory
  const fetchAdminInventory = useCallback(async () => {
    try {
      const data = await getInventory();
      setAdminInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch admin inventory:', err);
    }
  }, []);

  // Fetch Admin Orders
  const fetchAdminOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      setAdminOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    }
  }, []);

  // Trigger Admin data fetches
  useEffect(() => {
    if (view === 'admin_hub' && userSession) {
      fetchProducts();
      fetchCategories();
      fetchAdminInventory();
      fetchAdminOrders();
    }
  }, [view, userSession, adminTab, fetchProducts, fetchCategories, fetchAdminInventory, fetchAdminOrders]);

  // Admin handlers
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    setCartLoading(true);
    setError('');

    try {
      let finalImageUrl = '';
      if (productImageFile) {
        setError('');
        const { uploadUrl, imageUrl: s3Url } = await getImageUploadUrl(
          productImageFile.name,
          productImageFile.type
        );
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: productImageFile,
          headers: { 'Content-Type': productImageFile.type }
        });
        if (!uploadRes.ok) {
          throw new Error(`S3 upload failed (HTTP ${uploadRes.status})`);
        }
        finalImageUrl = cleanS3ImageUrl(s3Url);
      } else {
        const existingRaw = productForm.imageUrl || (editingProduct ? (editingProduct.imageUrl || editingProduct.image || '') : '');
        finalImageUrl = cleanS3ImageUrl(existingRaw);
      }

      const productPayload = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category || 'General',
        price: parseFloat(productForm.price) || 0.0,
        active: productForm.active,
        ...(finalImageUrl ? { imageUrl: finalImageUrl } : {})
      };

      if (editingProduct) {
        const productId = editingProduct.productId;
        await updateProduct(productId, productPayload);

        const existingInv = adminInventory.find(inv => inv.productId === productId);
        if (existingInv) {
          await updateInventory(productId, {
            availableQuantity: parseInt(productForm.availableQuantity) || 0,
            lowStockThreshold: parseInt(productForm.lowStockThreshold) || 5
          });
        } else {
          await createInventory({
            productId,
            availableQuantity: parseInt(productForm.availableQuantity) || 0,
            lowStockThreshold: parseInt(productForm.lowStockThreshold) || 5,
            reservedQuantity: 0
          });
        }
      } else {
        const createdProduct = await createProduct(productPayload);
        const productId = createdProduct.productId || createdProduct.product?.productId;

        if (productId) {
          await createInventory({
            productId,
            availableQuantity: parseInt(productForm.availableQuantity) || 0,
            lowStockThreshold: parseInt(productForm.lowStockThreshold) || 5,
            reservedQuantity: 0
          });
        }
      }

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
      setProductImageFile(null);
      setIsAddingProduct(false);
      setEditingProduct(null);

      await fetchProducts();
      await fetchAdminInventory();
    } catch (err) {
      setError(err.message || 'Error processing product.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleEditClick = (product) => {
    const inv = adminInventory.find(i => i.productId === product.productId) || {};
    const rawImg = product.imageUrl || product.image || '';
    setEditingProduct(product);
    setProductImageFile(null);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      active: product.active !== false,
      availableQuantity: inv.availableQuantity !== undefined ? inv.availableQuantity : 0,
      lowStockThreshold: inv.lowStockThreshold !== undefined ? inv.lowStockThreshold : 5,
      imageUrl: rawImg
    });
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to soft delete this product?')) return;
    try {
      await deleteProduct(productId);
      await fetchProducts();
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  // Trigger data fetches on customer hub activation or tab switch
  useEffect(() => {
    if (view === 'customer_hub' && userSession) {
      fetchAdminInventory();
      fetchProducts();
      fetchCategories();
      fetchCart();
      fetchWishlist();
      if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [view, userSession, activeTab, fetchProducts, fetchCategories, fetchCart, fetchWishlist, fetchOrders, fetchAdminInventory]);

  // Auth Submit Handlers
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password || !name) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signUpUser(email, password, name);
      setSuccess('Registration successful! Please check your email for confirmation code.');
      setView('confirm');
    } catch (err) {
      setError(err.message || 'Error signing up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !code) { setError('Email and Confirmation Code are required.'); return; }
    setLoading(true);
    try {
      await confirmUserSignUp(email, code);
      setSuccess('Account confirmed successfully! You can now log in.');
      setView('login');
      setCode('');
    } catch (err) {
      setError(err.message || 'Error confirming account. Please verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearMessages();
    if (!email) { setError('Please enter your email address to resend the code.'); return; }
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

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const response = await signInUser(email, password);
      if (response.newPasswordRequired || response.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setChallengeUser(response.cognitoUser);
        setView('new_password_required');
      } else {
        processSuccessfulLogin(response);
      }
    } catch (err) {
      setError(err.message || 'Error logging in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!newPassword || !confirmNewPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword !== confirmNewPassword) { setError('New passwords do not match.'); return; }
    setLoading(true);
    try {
      const sessionData = await completeNewPasswordChallenge(challengeUser, newPassword);
      processSuccessfulLogin(sessionData);
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const processSuccessfulLogin = (sessionData) => {
    setUserSession(sessionData);
    localStorage.setItem('cognito_session', JSON.stringify(sessionData));
    const groups = sessionData.payload['cognito:groups'] || [];
    if (groups.includes('ADMIN')) {
      setView('admin_hub');
    } else {
      setView('customer_hub');
      setActiveTab('home');
      fetchProducts();
      if (sessionData.payload && sessionData.payload.sub) {
        fetchCart();
      }
    }
  };

  // Cart & Checkout Handlers
  const handleAddToCart = async (product) => {
    if (!userSession) return;
    
    const inv = adminInventory.find(i => i.productId === product.productId);
    const available = inv ? inv.availableQuantity : 0;
    const cartItem = cartData?.items?.find(i => i.productId === product.productId);
    const currentQty = cartItem ? cartItem.quantity : 0;
    
    if (currentQty + 1 > available) {
      setError(`Cannot add more to bag. Only ${available} available in stock.`);
      window.scrollTo(0, 0);
      return;
    }

    clearMessages();
    setCartLoading(true);
    try {
      const updatedCart = await addCartItem(
        userSession.payload.sub,
        product.productId,
        product.name,
        product.price,
        1
      );
      setCartData(updatedCart);
      setSuccess(`Added "${product.name}" to cart!`);
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
    
    if (change > 0) {
      const inv = adminInventory.find(i => i.productId === productId);
      const available = inv ? inv.availableQuantity : 0;
      if (targetQty > available) {
        setError(`Cannot increase quantity. Only ${available} available in stock.`);
        window.scrollTo(0, 0);
        return;
      }
    }

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

  const handleCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
  };

  const handleConfirmPurchase = async () => {
    if (!userSession || cartData.items.length === 0) return;
    setCartLoading(true);
    try {
      const isCard = paymentMethod === 'CARD';
      const paymentMode = isCard ? 'CARD' : 'COD';

      // Step 1: Create Order
      const newOrder = await createOrder(userSession.payload.sub, cartData.items, paymentMode);
      const orderId = newOrder?.orderId || newOrder?.order?.orderId || newOrder?.id || (typeof newOrder === 'string' ? newOrder : null);

      if (!orderId) {
        throw new Error('Order creation failed: Backend did not return orderId.');
      }

      // Backend handles Inventory reduction and Payment creation asynchronously via SNS -> SQS events!
      // Step 2 & 3 are intentionally skipped here to avoid double-processing.

      // Step 4: Clear Shopping Cart
      await clearCart(userSession.payload.sub);
      setCartData({ items: [] });
      setView('customer_hub');
      setActiveTab('orders');
      await fetchOrders();
      setSuccess('Order placed successfully! You can view your tax invoice below.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    const prodCat = (product.category || 'General').toString().trim().toUpperCase();
    const selCat = (selectedCategory || 'ALL').toString().trim().toUpperCase();
    const matchesCat = selCat === 'ALL' || prodCat === selCat;
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
      (product.name && product.name.toLowerCase().includes(searchLower)) || 
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower));
    return matchesCat && matchesSearch;
  });

  const cartTotalQuantity = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative Ambient Background Lights */}
      <div className="ambient-glow glow-primary"></div>
      <div className="ambient-glow glow-secondary"></div>
      <div className="app-main-content">
        {view === 'customer_hub' && userSession ? (
          <>
            <CustomerHeader
              userSession={userSession}
              handleLogout={handleLogout}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              cartData={cartData}
              cartTotalQuantity={cartTotalQuantity}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onGoHome={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToCatalog={() => {
                setActiveTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {activeTab === 'home' && (
              <HeroSection 
                onShopNow={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'catalog' && (
              <ProductCatalogue
                products={products}
                filteredProducts={filteredProducts}
                adminInventory={adminInventory}
                cartData={cartData}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                storefrontLoading={storefrontLoading}
                storefrontError={storefrontError}
                handleAddToCart={handleAddToCart}
                cartLoading={cartLoading}
                fetchProducts={fetchProducts}
                wishlistItems={wishlistItems}
                toggleWishlist={toggleWishlist}
              />
            )}

            {activeTab === 'about' && (
              <AboutView 
                onExploreCatalog={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'contact' && (
              <ContactView />
            )}

            {activeTab === 'orders' && (
              <CustomerOrders
                ordersLoading={ordersLoading}
                ordersError={ordersError}
                orders={orders}
                fetchOrders={fetchOrders}
                setActiveTab={setActiveTab}
                setSelectedOrderForInvoice={setSelectedOrderForInvoice}
              />
            )}

            {activeTab === 'wishlist' && (
              <WishlistView
                wishlistItems={wishlistItems}
                adminInventory={adminInventory}
                cartData={cartData}
                handleAddToCart={handleAddToCart}
                cartLoading={cartLoading}
                toggleWishlist={toggleWishlist}
                setActiveTab={setActiveTab}
              />
            )}
          </>
        ) : view === 'checkout' && userSession ? (
          <CheckoutView
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cardDetails={cardDetails}
            setCardDetails={setCardDetails}
            handleConfirmPurchase={handleConfirmPurchase}
            setView={setView}
            setActiveTab={setActiveTab}
            cartLoading={cartLoading}
            cartSubtotal={cartSubtotal}
            cartData={cartData}
          />
        ) : view === 'admin_hub' && userSession ? (
          <div className="admin-wrapper animate-fade-in" style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <AdminHeader
              userSession={userSession}
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              setSelectedCustomer={setSelectedCustomer}
              handleLogout={handleLogout}
            />

            <div className="screen-container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
              {adminTab === 'products' && (
                <AdminProducts
                  setEditingProduct={setEditingProduct}
                  setProductForm={setProductForm}
                  setIsAddingProduct={setIsAddingProduct}
                  products={products}
                  adminInventory={adminInventory}
                  handleEditClick={handleEditClick}
                  handleDeleteProduct={handleDeleteProduct}
                />
              )}

              {adminTab === 'inventory' && (
                <AdminInventory
                  products={products}
                  adminInventory={adminInventory}
                  editingInventoryId={editingInventoryId}
                  setEditingInventoryId={setEditingInventoryId}
                  editingInventoryQty={editingInventoryQty}
                  setEditingInventoryQty={setEditingInventoryQty}
                  createInventory={createInventory}
                  addStock={addStock}
                  reduceStock={reduceStock}
                  updateInventory={updateInventory}
                  fetchAdminInventory={fetchAdminInventory}
                />
              )}

              {adminTab === 'customers' && (
                <AdminCustomers
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  adminOrders={adminOrders}
                  setSelectedOrderForInvoice={setSelectedOrderForInvoice}
                />
              )}

              {adminTab === 'analytics' && (
                <AdminAnalytics
                  adminOrders={adminOrders}
                  adminInventory={adminInventory}
                  products={products}
                />
              )}

              {adminTab === 'categories' && (
                <AdminCategories
                  categories={categories}
                  fetchCategories={fetchCategories}
                  createCategory={createCategory}
                  updateCategory={updateCategory}
                  deleteCategory={deleteCategory}
                  getUploadUrl={getImageUploadUrl}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="auth-container">
            <div className="auth-card">
              <div className="brand-logo-center" style={{ marginBottom: '0.2rem' }}>
                <span className="brand-initial-l">L</span>AURITE
              </div>
              <span className="brand-tag-sub" style={{ display: 'block', marginBottom: '1.75rem' }}>STYLE</span>

              {view === 'login' && (
                <LoginView
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  error={error}
                  success={success}
                  handleSignInSubmit={handleSignInSubmit}
                  clearMessages={clearMessages}
                  setView={setView}
                />
              )}

              {view === 'register' && (
                <SignUpView
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  loading={loading}
                  error={error}
                  handleSignUpSubmit={handleSignUpSubmit}
                  clearMessages={clearMessages}
                  setView={setView}
                />
              )}

              {view === 'confirm' && (
                <ConfirmView
                  email={email}
                  setEmail={setEmail}
                  code={code}
                  setCode={setCode}
                  loading={loading}
                  error={error}
                  success={success}
                  handleConfirmSubmit={handleConfirmSubmit}
                  handleResendCode={handleResendCode}
                  clearMessages={clearMessages}
                  setView={setView}
                />
              )}

              {view === 'new_password_required' && (
                <NewPasswordView
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmNewPassword={confirmNewPassword}
                  setConfirmNewPassword={setConfirmNewPassword}
                  loading={loading}
                  error={error}
                  success={success}
                  handleNewPasswordSubmit={handleNewPasswordSubmit}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="app-modals">
        {/* Global Top-Level Product Add/Edit Overlay Modal */}
        <ProductModal
          isAddingProduct={isAddingProduct}
          editingProduct={editingProduct}
          setIsAddingProduct={setIsAddingProduct}
          setEditingProduct={setEditingProduct}
          error={error}
          handleProductFormSubmit={handleProductFormSubmit}
          productForm={productForm}
          setProductForm={setProductForm}
          categories={categories}
          productImageFile={productImageFile}
          setProductImageFile={setProductImageFile}
          cartLoading={cartLoading}
          cleanS3ImageUrl={cleanS3ImageUrl}
        />

        {/* Global Top-Level Cart Drawer Overlay */}
        <ShoppingBagDrawer
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartData={cartData}
          handleUpdateQuantity={handleUpdateQuantity}
          handleRemoveItem={handleRemoveItem}
          cartLoading={cartLoading}
          cartSubtotal={cartSubtotal}
          handleCheckout={handleCheckout}
          adminInventory={adminInventory}
        />

        {/* Global Top-Level Invoice Overlay Modal */}
        <InvoiceModal
          selectedOrderForInvoice={selectedOrderForInvoice}
          setSelectedOrderForInvoice={setSelectedOrderForInvoice}
        />
      </div>
    </div>
  );
}

export default App;
