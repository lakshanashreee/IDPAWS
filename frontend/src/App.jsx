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
  createOrder,
  getUserOrders,
  getOrderPayments,
  getAllOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  createInventory,
  getInventory,
  reduceStock,
  addStock,
  createPayment,
  getImageUploadUrl
} from './utils/api';

// Clean Vector SVG Icons for iOS Luxury Aesthetic
const IconBag = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconInvoice = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const IconOrders = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

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

  // ----------------------------------------------------
  // ADDITIONAL CUSTOMER HUB STATES (Orders & Checkout)
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState('storefront'); // 'storefront' | 'orders'
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
  const [adminTab, setAdminTab] = useState('products'); // 'products' | 'inventory' | 'customers' | 'analytics'
  const [adminInventory, setAdminInventory] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // String (userId)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Object | null
  const [editingInventoryId, setEditingInventoryId] = useState(null); // productId being inline-edited
  const [editingInventoryQty, setEditingInventoryQty] = useState(''); // temp qty value
  const [newCategoryInput, setNewCategoryInput] = useState('');
  
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

  // Holds the raw File object selected by the admin for a new product image.
  // The actual S3 upload happens on form submit, not on file select.
  const [productImageFile, setProductImageFile] = useState(null);

  // Auto-sync Cart Items with updated catalog prices
  useEffect(() => {
    if (products.length > 0 && cartData.items.length > 0) {
      let updated = false;
      const syncedItems = cartData.items.map(item => {
        const match = products.find(p => p.productId === item.productId);
        if (match && Number(match.price) !== Number(item.price)) {
          updated = true;
          return { ...item, price: Number(match.price) };
        }
        return item;
      });
      if (updated) {
        setCartData(prev => ({ ...prev, items: syncedItems }));
      }
    }
  }, [products]);

  // Category Management Handlers
  const handleRenameCategory = (oldCat) => {
    const newCat = window.prompt(`Rename category "${oldCat}" to:`, oldCat);
    if (!newCat || !newCat.trim()) return;
    const upperNew = newCat.trim().toUpperCase();
    if (upperNew === oldCat) return;

    setCategories(prev => prev.map(c => c === oldCat ? upperNew : c));
    if (selectedCategory === oldCat) setSelectedCategory(upperNew);

    setProducts(prev => prev.map(p => {
      if (p.category && p.category.toUpperCase() === oldCat) {
        return { ...p, category: upperNew };
      }
      return p;
    }));
  };

  const handleDeleteCategory = (catToDelete) => {
    if (catToDelete === 'ALL') {
      alert('Cannot delete default ALL category filter.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete category "${catToDelete}"?`)) {
      setCategories(prev => prev.filter(c => c !== catToDelete));
      if (selectedCategory === catToDelete) setSelectedCategory('ALL');
    }
  };

  // Scroll reveal animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08 }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [view, activeTab, products, adminTab, categories]);

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
    setActiveTab('storefront');
    setOrders([]);
    setSelectedOrderForInvoice(null);
    setPaymentMethod('COD');
    setCardDetails({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
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

  const parseProduct = useCallback((product) => {
    if (!product) return product;
    // imageUrl is now stored as a first-class field in DynamoDB.
    // Provide a fallback chain for legacy products that may still use the old format.
    let description = product.description || '';
    let imageUrl = product.imageUrl || product.image || '';

    // Legacy fallback: some products stored base64 in description with ||| separator.
    if (!imageUrl && description.includes('|||')) {
      const parts = description.split('|||');
      description = parts[0].trim();
      imageUrl = parts[1].trim();
    }

    return {
      ...product,
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
      // Ensure products is an array
      const productList = Array.isArray(data) ? data : (data?.products || []);
      const parsedList = productList.map(parseProduct);
      setProducts(parsedList);

      // Extract unique categories dynamically and preserve custom admin categories
      setCategories(prev => {
        const uniqueCats = ['ALL', ...new Set(parsedList.map(p => (p.category || 'General').toUpperCase()))];
        return Array.from(new Set([...prev, ...uniqueCats]));
      });
    } catch (err) {
      handleApiError(err, fetchProducts);
    } finally {
      setStorefrontLoading(false);
    }
  }, [handleApiError, parseProduct]);

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

  // Fetch Orders Handler
  const fetchOrders = useCallback(async () => {
    if (!userSession) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const orderList = await getUserOrders(userSession.payload.sub);
      const resolvedOrders = Array.isArray(orderList) ? orderList : [];
      
      const ordersWithPayments = await Promise.all(resolvedOrders.map(async (order) => {
        try {
          const payments = await getOrderPayments(order.orderId);
          const activePayment = Array.isArray(payments) && payments.length > 0 ? payments[0] : null;
          return {
            ...order,
            paymentMode: activePayment ? activePayment.paymentMode : 'COD',
            paymentStatus: activePayment ? activePayment.paymentStatus : 'SUCCESS'
          };
        } catch (err) {
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
      fetchAdminInventory();
      fetchAdminOrders();
    }
  }, [view, userSession, adminTab, fetchProducts, fetchAdminInventory, fetchAdminOrders]);

  // Helper to strip pre-signed query strings from S3 URLs so Java backend comparison matches
  const cleanS3ImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url.split('?')[0].trim();
  };

  // Admin handlers
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    setCartLoading(true);
    setError('');

    try {
      // ── Step 1: Upload new image to S3 if a file was selected ──────────────
      let finalImageUrl = '';
      if (productImageFile) {
        setError('');
        const { uploadUrl, imageUrl: s3Url } = await getImageUploadUrl(
          productImageFile.name,
          productImageFile.type
        );
        // PUT binary directly to S3 (no auth header, signed URL carries credentials)
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
        // Preserving existing image URL: MUST strip pre-signed query string (?X-Amz-...)
        // so Java backend compares exact base URLs and DOES NOT invoke s3ImageService.deleteObject()!
        const existingRaw = productForm.imageUrl || (editingProduct ? (editingProduct.imageUrl || editingProduct.image || '') : '');
        finalImageUrl = cleanS3ImageUrl(existingRaw);
      }
      // ─────────────────────────────────────────────────────────────────────────

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

        const existingInv = adminInventory.find(inv => inv.productId === productId) || {};
        await createInventory({
          productId,
          availableQuantity: parseInt(productForm.availableQuantity) || 0,
          lowStockThreshold: parseInt(productForm.lowStockThreshold) || 5,
          reservedQuantity: existingInv.reservedQuantity || 0
        });
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
    setProductImageFile(null); // reset pending upload; keep existing imageUrl
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
      fetchAdminInventory(); // fetch inventory for stock badges on product cards
      if (activeTab === 'storefront') {
        fetchProducts();
        fetchCart();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [view, userSession, activeTab, fetchProducts, fetchCart, fetchOrders, fetchAdminInventory]);

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

  const handleCheckout = () => {
    if (!userSession || cartData.items.length === 0) return;
    setIsCartOpen(false);
    setView('checkout');
  };

  const handleConfirmPurchase = async () => {
    if (!userSession || cartData.items.length === 0) return;
    setCartLoading(true);
    setStorefrontError('');

    try {
      // 1. Submit Order to Order Service Lambda
      const { order, eventPublished } = await createOrder(userSession.payload.sub, cartData.items);
      const orderId = order?.orderId;

      // 2. Inventory stock reduction is handled asynchronously by SQS -> L_InventoryEventService
      // when Order Service publishes the ORDER_PLACED SNS event. No manual HTTP call needed.

      // 3. Record payment in Payment Service
      const totalAmount = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      try {
        await createPayment({
          orderId,
          userId: userSession.payload.sub,
          amount: totalAmount,
          paymentMode: paymentMethod,
          paymentStatus: 'SUCCESS'
        });
      } catch (payErr) {
        console.warn('Payment record failed (non-fatal):', payErr.message);
      }

      // 4. Clear Cart in Cart Service Lambda
      await clearCart(userSession.payload.sub);

      // 5. Update Cart local state, refresh inventory badges, set view to success
      setCartData({ items: [] });
      setPaymentMethod('COD');
      setCardDetails({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
      setView('customer_hub');
      setActiveTab('orders'); // Go to My Orders directly
      setOrderSuccess(orderId || 'SUCCESS');

      // 6. Refresh inventory immediately + delayed re-fetches to catch
      //    async SQS/Lambda stock updates that may take a few seconds.
      fetchAdminInventory();
      setTimeout(() => fetchAdminInventory(), 3000);
      setTimeout(() => fetchAdminInventory(), 6000);
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
        <div className="storefront-wrapper animate-fade-in" style={{ width: '100%' }}>
          
          {/* 3-Column Header Section */}
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
                  className="cart-trigger-btn" 
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Shopping Bag"
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

          {/* Alert messages */}
          {success && <div className="alert alert-success screen-container" style={{ marginTop: '1.5rem' }}>{success}</div>}
          
          {activeTab === 'storefront' && (
            <>
              {/* Editorial Hero Section */}
              <section className="hero-editorial-section reveal-on-scroll screen-container">
                <div className="hero-content">
                  <span className="subheading-luxury">NEW COLLECTION 2026</span>
                  <h1 className="hero-editorial-title">Elevate Your Everyday Style</h1>
                  <p className="hero-editorial-sub">
                    Discover timeless luxury pieces, crafted for comfort, designed for unmatched elegance, made for you.
                  </p>
                  <div className="hero-cta-group">
                    <button 
                      type="button" 
                      className="btn-primary btn-gold btn-hero-primary"
                      onClick={() => {
                        const el = document.getElementById('catalog-grid-anchor');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Explore Collection →
                    </button>
                  </div>
                </div>
              </section>

              {/* Benefits / Trust Badges Bar */}
              <section className="benefits-bar reveal-on-scroll screen-container">
                <div className="benefit-card">
                  <div className="benefit-icon"><IconBag /></div>
                  <div>
                    <div className="benefit-title">Complimentary Shipping</div>
                    <div className="benefit-desc">On orders over ₹1,500 worldwide</div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon"><IconRefresh /></div>
                  <div>
                    <div className="benefit-title">30-Day Returns</div>
                    <div className="benefit-desc">Seamless exchanges & refunds</div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon"><IconInvoice /></div>
                  <div>
                    <div className="benefit-title">100% Protected</div>
                    <div className="benefit-desc">Bank-grade encrypted checkout</div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon"><IconUser /></div>
                  <div>
                    <div className="benefit-title">24/7 Concierge</div>
                    <div className="benefit-desc">Dedicated luxury support</div>
                  </div>
                </div>
              </section>

              {/* Search bar & iOS Category Pills */}
              <section className="category-filter-wrapper reveal-on-scroll screen-container" id="catalog-grid-anchor">
                <div className="search-input-box">
                  <span className="search-icon-left"><IconSearch /></span>
                  <input 
                    type="text" 
                    placeholder="Search luxury products in LAURITE catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="category-pills-container" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Product Grid */}
              {storefrontLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                </div>
              ) : storefrontError ? (
                <div className="error-state-card screen-container" style={{ background: '#fff', borderRadius: '24px', padding: '3rem', textAlign: 'center', marginBottom: '4rem' }}>
                  <h2 className="error-state-title">Connection Error</h2>
                  <p className="error-state-desc" style={{ color: 'var(--text-muted)' }}>{storefrontError}</p>
                  <button type="button" className="btn-primary btn-retry" onClick={fetchProducts} style={{ width: 'auto', marginTop: '1rem' }}>
                    Retry Fetching Catalog
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state screen-container" style={{ background: '#fff', borderRadius: '24px', padding: '4rem', textAlign: 'center', marginBottom: '4rem', border: '1px solid rgba(212,197,185,0.4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Products Found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Try modifying your search query or selecting a different category.</p>
                </div>
              ) : (
                <main className="product-grid reveal-on-scroll screen-container">
                  {filteredProducts.map(product => {
                    const inv = adminInventory.find(i => i.productId === product.productId);
                    const qty = inv ? inv.availableQuantity : null;
                    const isLow = qty !== null && qty > 0 && qty <= 5;
                    const isOut = qty !== null && qty === 0;
                    return (
                    <div key={product.productId} className="product-card">
                      <div className="product-image-container">
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
                          style={{ display: (product.imageUrl || product.image) ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <span className="placeholder-icon" style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}><IconBag /></span>
                          <span className="placeholder-text" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{product.category || 'LUXURY'}</span>
                        </div>

                        {/* Stock Badge */}
                        {qty !== null && (
                          <div className={`stock-badge-pill ${isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'}`}>
                            {isOut ? 'Out of Stock' : isLow ? `Only ${qty} left` : 'In Stock'}
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <span className="product-category-label">{product.category || 'General'}</span>
                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-desc">{product.description || 'Exquisite quality product from our signature luxury catalog.'}</p>
                        
                        <div className="product-footer">
                          <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
                          <button 
                            type="button" 
                            className="btn-add-to-cart"
                            onClick={() => handleAddToCart(product)}
                            disabled={cartLoading || isOut}
                            style={isOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            {isOut ? 'Out of Stock' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </main>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section animate-fade-in screen-container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>My Orders</h2>
                <button type="button" className="btn-primary btn-secondary" onClick={fetchOrders} disabled={ordersLoading} style={{ margin: 0, padding: '0.55rem 1.25rem', fontSize: '0.85rem', width: 'auto' }}>
                  <IconRefresh /> Refresh Orders
                </button>
              </div>

              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                </div>
              ) : ordersError ? (
                <div className="error-state-card" style={{ background: '#fff', borderRadius: '24px', padding: '3rem', textAlign: 'center' }}>
                  <h2 className="error-state-title" style={{ color: 'var(--text-main)' }}>Failed to load orders</h2>
                  <p className="error-state-desc" style={{ color: 'var(--text-muted)' }}>{ordersError}</p>
                  <button type="button" className="btn-primary" onClick={fetchOrders} style={{ width: 'auto', marginTop: '1rem' }}>
                    Retry
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state" style={{ background: '#fff', borderRadius: '24px', padding: '4rem 1rem', textAlign: 'center', border: '1px solid rgba(212,197,185,0.4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Orders Found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                  <button type="button" className="btn-primary btn-gold" onClick={() => setActiveTab('storefront')} style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 2rem' }}>
                    Explore Catalog →
                  </button>
                </div>
              ) : (
                <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map(order => (
                    <div key={order.orderId} className="order-card-luxury">
                      <div className="order-card-header">
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', display: 'block', fontWeight: 700, letterSpacing: '0.15em' }}>ORDER REFERENCE</span>
                          <h3 className="order-id-title" style={{ color: '#1c1917', fontSize: '1.15rem', marginTop: '0.1rem' }}>{order.orderId}</h3>
                          <span className="order-date-text" style={{ color: '#57534e', fontSize: '0.82rem' }}>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                          <span className="status-pill">
                            {order.status || 'PLACED'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#57534e', fontWeight: 600 }}>
                            Payment: {order.paymentMode || 'COD'} ({order.paymentStatus || 'SUCCESS'})
                          </span>
                        </div>
                      </div>

                      <div className="order-items-table">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>
                              <strong style={{ color: '#1c1917', fontSize: '0.95rem' }}>{item.productName}</strong>
                              <span className="order-item-qty">x{item.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 600, color: '#1c1917' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-footer">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', color: '#57534e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Amount</span>
                          <strong className="order-total-amount" style={{ color: '#1c1917', fontSize: '1.4rem' }}>₹{Number(order.totalAmount).toFixed(2)}</strong>
                        </div>
                        <button 
                          type="button" 
                          className="btn-primary btn-secondary"
                          style={{ width: 'auto', margin: 0, padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}
                          onClick={() => setSelectedOrderForInvoice(order)}
                        >
                          <IconInvoice /> View Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



        </div>
      ) : view === 'checkout' && userSession ? (
        <div className="checkout-container animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap', zIndex: 1 }}>
          {/* Left side: payment form */}
          <div className="checkout-main glass-card" style={{ flex: '1 1 500px', maxWidth: 'none', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Information</h2>
            <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Select your preferred payment method and complete purchase</p>

            <form onSubmit={(e) => { e.preventDefault(); handleConfirmPurchase(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="pay-method" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Payment Method</label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem', outline: 'none' }}
                >
                  <option value="COD">💵 Cash on Delivery (COD)</option>
                  <option value="CARD">💳 Credit/Debit Card</option>
                </select>
              </div>

              {paymentMethod === 'CARD' && (
                <div className="card-details-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="card-number" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Card Number</label>
                    <input
                      type="text"
                      id="card-number"
                      placeholder="4111 2222 3333 4444"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      required={paymentMethod === 'CARD'}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="card-holder" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Cardholder Name</label>
                    <input
                      type="text"
                      id="card-holder"
                      placeholder="John Doe"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                      required={paymentMethod === 'CARD'}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="card-expiry" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Expiry Date</label>
                      <input
                        type="text"
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        required={paymentMethod === 'CARD'}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="card-cvv" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>CVV</label>
                      <input
                        type="password"
                        id="card-cvv"
                        placeholder="123"
                        maxLength="3"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        required={paymentMethod === 'CARD'}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', color: '#fff' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn-primary btn-secondary" 
                  onClick={() => { setView('customer_hub'); setActiveTab('storefront'); }}
                  style={{ flex: 1, margin: 0, padding: '0.75rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={cartLoading}
                  style={{ flex: 2, margin: 0, padding: '0.75rem' }}
                >
                  {cartLoading ? <div className="spinner"></div> : (paymentMethod === 'CARD' ? `Pay $${cartSubtotal.toFixed(2)}` : 'Confirm Order')}
                </button>
              </div>
            </form>
          </div>

          {/* Right side: order summary */}
          <div className="checkout-summary glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order Summary</h3>
            <p className="subtitle" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Review the items in your order</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {cartData.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{item.productName}</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 500 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                <span>Total</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'admin_hub' && userSession ? (
        <div className="admin-wrapper animate-fade-in" style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
          {/* Admin Header */}
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


              <div className="screen-container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
                {/* Admin Tab Navigation */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
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

              {/* PRODUCTS TAB */}
              {adminTab === 'products' && (
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
                              <img className="product-image" src={product.imageUrl || product.image} alt={product.name} />
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
              )}

              {/* INVENTORY TAB */}
              {adminTab === 'inventory' && (
                <div className="admin-tab-content animate-fade-in">
                  <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Inventory Stock Management</h2>

                  {/* Split inventory by Low Stock Threshold */}
                  {(() => {
                    const lowStockItems = [];
                    const healthyStockItems = [];

                    products.forEach(product => {
                      const inv = adminInventory.find(i => i.productId === product.productId) || { availableQuantity: 0, lowStockThreshold: 5 };
                      const stockInfo = {
                        product,
                        availableQuantity: inv.availableQuantity,
                        lowStockThreshold: inv.lowStockThreshold
                      };
                      if (inv.availableQuantity <= inv.lowStockThreshold) {
                        lowStockItems.push(stockInfo);
                      } else {
                        healthyStockItems.push(stockInfo);
                      }
                    });

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Low Stock Section */}
                        <div style={{ background: '#ffffff', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(239,68,68,0.04)' }}>
                          <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <IconWarning /> Low Stock Alerts ({lowStockItems.length})
                          </h3>
                          {lowStockItems.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All product stocks are at healthy levels. Excellent!</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {lowStockItems.map(item => (
                                <div key={item.product.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f5', border: '1px solid rgba(212,197,185,0.4)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {item.product.imageUrl ? (
                                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><IconBag /></div>
                                    )}
                                    <div>
                                      <h4 style={{ margin: 0, color: '#1c1917' }}>{item.product.name}</h4>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold: {item.lowStockThreshold}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {editingInventoryId === item.product.productId ? (
                                      <>
                                        <input
                                          type="number" min="0"
                                          value={editingInventoryQty}
                                          onChange={(e) => setEditingInventoryQty(e.target.value)}
                                          style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--accent-gold)', background: '#fff', color: '#1c1917', fontSize: '0.9rem' }}
                                        />
                                        <button type="button" className="btn-primary btn-gold" style={{ margin: 0, padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.8rem' }}
                                          onClick={async () => {
                                            try {
                                              const q = parseInt(editingInventoryQty);
                                              const inv = adminInventory.find(i => i.productId === item.product.productId);
                                              const current = inv ? inv.availableQuantity : 0;
                                              if (q > current) {
                                                await addStock(item.product.productId, q - current);
                                              } else if (q < current) {
                                                await reduceStock(item.product.productId, current - q);
                                              }
                                              await fetchAdminInventory();
                                            } catch(e) { alert('Failed to update: ' + e.message); }
                                            setEditingInventoryId(null);
                                          }}
                                        >Save</button>
                                        <button type="button" style={{ margin: 0, padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(212,197,185,0.6)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                          onClick={() => setEditingInventoryId(null)}>Cancel</button>
                                      </>
                                    ) : (
                                      <>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>{item.availableQuantity} left</span>
                                        <button type="button" className="btn-primary btn-gold" onClick={() => { setEditingInventoryId(item.product.productId); setEditingInventoryQty(String(item.availableQuantity)); }} style={{ margin: 0, padding: '0.4rem 1rem', width: 'auto', fontSize: '0.85rem' }}>Restock</button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Healthy Stock Section */}
                        <div style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.4)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                          <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            Healthy Stock ({healthyStockItems.length})
                          </h3>
                          {healthyStockItems.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No healthy stock items found.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {healthyStockItems.map(item => (
                                <div key={item.product.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {item.product.imageUrl ? (
                                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🛍️</div>
                                    )}
                                    <div>
                                      <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold: {item.lowStockThreshold}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {editingInventoryId === item.product.productId ? (
                                      <>
                                        <input
                                          type="number" min="0"
                                          value={editingInventoryQty}
                                          onChange={(e) => setEditingInventoryQty(e.target.value)}
                                          style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem' }}
                                        />
                                        <button type="button" className="btn-primary" style={{ margin: 0, padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.8rem' }}
                                          onClick={async () => {
                                            try {
                                              const q = parseInt(editingInventoryQty);
                                              const inv = adminInventory.find(i => i.productId === item.product.productId);
                                              const current = inv ? inv.availableQuantity : 0;
                                              if (q > current) {
                                                await addStock(item.product.productId, q - current);
                                              } else if (q < current) {
                                                await reduceStock(item.product.productId, current - q);
                                              }
                                              await fetchAdminInventory();
                                            } catch(e) { alert('Failed to update: ' + e.message); }
                                            setEditingInventoryId(null);
                                          }}
                                        >✓ Save</button>
                                        <button type="button" style={{ margin: 0, padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                          onClick={() => setEditingInventoryId(null)}>✕</button>
                                      </>
                                    ) : (
                                      <>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399' }}>{item.availableQuantity} units</span>
                                        <button type="button" className="btn-primary btn-secondary" onClick={() => { setEditingInventoryId(item.product.productId); setEditingInventoryQty(String(item.availableQuantity)); }} style={{ margin: 0, padding: '0.4rem 1rem', width: 'auto', fontSize: '0.85rem' }}>✏️ Edit</button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* CUSTOMERS & ORDERS TAB */}
              {adminTab === 'customers' && (
                <div className="admin-tab-content animate-fade-in">
                  {!selectedCustomer ? (
                    <>
                      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Customer Database</h2>
                      {(() => {
                        // Extract unique customer userIds from adminOrders
                        const customerMap = {};
                        adminOrders.forEach(order => {
                          if (!order.userId) return;
                          if (!customerMap[order.userId]) {
                            customerMap[order.userId] = {
                              userId: order.userId,
                              orderCount: 0,
                              totalSpent: 0,
                              lastOrderDate: order.createdAt
                            };
                          }
                          customerMap[order.userId].orderCount += 1;
                          customerMap[order.userId].totalSpent += order.totalAmount || 0;
                          if (new Date(order.createdAt) > new Date(customerMap[order.userId].lastOrderDate)) {
                            customerMap[order.userId].lastOrderDate = order.createdAt;
                          }
                        });

                        const customerList = Object.values(customerMap);

                        if (customerList.length === 0) {
                          return (
                            <div className="empty-state" style={{ background: '#fff', padding: '3rem', borderRadius: '20px', border: '1px solid rgba(212,197,185,0.4)', textAlign: 'center' }}>
                              <h3>No Customers Found</h3>
                              <p style={{ color: 'var(--text-muted)' }}>No customer orders have been recorded in the system yet.</p>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {customerList.map(customer => (
                              <div 
                                key={customer.userId} 
                                className="order-item-card" 
                                onClick={() => setSelectedCustomer(customer.userId)}
                                style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CUSTOMER ID / SUB</span>
                                  <h3 style={{ fontSize: '1.1rem', color: '#1c1917', fontWeight: 700 }}>{customer.userId}</h3>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last active order: {new Date(customer.lastOrderDate).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Orders Placed</span>
                                    <strong style={{ fontSize: '1.2rem', color: '#1c1917' }}>{customer.orderCount}</strong>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Purchases</span>
                                    <strong style={{ fontSize: '1.2rem', color: '#059669' }}>₹{customer.totalSpent.toFixed(2)}</strong>
                                  </div>
                                  <span style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>→</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div>
                      {/* Customer Orders view */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                          type="button" 
                          className="btn-primary btn-secondary" 
                          onClick={() => setSelectedCustomer(null)}
                          style={{ margin: 0, width: 'auto', padding: '0.4rem 1rem' }}
                        >
                          ← Back to Customers
                        </button>
                        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#1c1917' }}>Orders history for customer: <span style={{ color: 'var(--accent-gold)' }}>{selectedCustomer.substring(0, 8)}...</span></h2>
                      </div>

                      {(() => {
                        const customerOrders = adminOrders.filter(o => o.userId === selectedCustomer);
                        customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {customerOrders.map(order => (
                              <div key={order.orderId} className="order-item-card" style={{ background: '#ffffff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                <div className="order-item-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                  <div>
                                    <span className="order-id-label" style={{ fontSize: '0.75rem', color: '#57534e', display: 'block', fontWeight: 600 }}>ORDER ID</span>
                                    <h3 className="order-id-val" style={{ fontSize: '1.1rem', color: '#1c1917', fontWeight: 700 }}>{order.orderId}</h3>
                                    <span className="order-date-label" style={{ fontSize: '0.8rem', color: '#57534e' }}>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className={`status-badge status-${order.status ? order.status.toLowerCase() : 'placed'}`} style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(197, 160, 89, 0.15)', color: 'var(--accent-gold-hover)' }}>
                                      {order.status || 'PLACED'}
                                    </span>
                                  </div>
                                </div>

                                <div className="order-item-body">
                                  <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {order.items && order.items.map((item, idx) => (
                                      <div key={idx} className="order-product-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1c1917' }}>
                                        <span className="order-product-name" style={{ color: '#57534e' }}>
                                          <strong style={{ color: '#1c1917' }}>{item.productName}</strong> <span className="order-product-qty" style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: '#faf8f5', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(212,197,185,0.4)' }}>x{item.quantity}</span>
                                        </span>
                                        <span className="order-product-price" style={{ fontWeight: 700, color: '#1c1917' }}>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="order-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(212,197,185,0.4)', paddingTop: '1rem' }}>
                                  <div className="order-total-price" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#57534e' }}>Total Amount</span>
                                    <strong style={{ fontSize: '1.25rem', color: '#1c1917', fontWeight: 800 }}>₹{Number(order.totalAmount).toFixed(2)}</strong>
                                  </div>
                                  <button 
                                    type="button" 
                                    className="btn-primary btn-secondary"
                                    style={{ width: 'auto', margin: 0, padding: '0.5rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                    onClick={() => setSelectedOrderForInvoice(order)}
                                  >
                                    <IconInvoice /> View Invoice
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* ANALYTICS TAB */}
              {adminTab === 'analytics' && (
                <div className="admin-tab-content animate-fade-in">
                  <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Sales & Catalog Analytics</h2>

                  {(() => {
                    // Compute dashboard statistics
                    const totalRevenue = adminOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                    const totalOrders = adminOrders.length;
                    const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
                    
                    let outOfStock = 0;
                    let lowStock = 0;
                    adminInventory.forEach(item => {
                      if (item.availableQuantity === 0) outOfStock += 1;
                      else if (item.availableQuantity <= item.lowStockThreshold) lowStock += 1;
                    });

                    return (
                      <div>
                        {/* Stats Dashboard Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Platform Revenue</span>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#059669' }}>₹{totalRevenue.toFixed(2)}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Accumulated across all order events</p>
                          </div>

                          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders Placed</span>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#1c1917' }}>{totalOrders}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Includes confirmed and pending orders</p>
                          </div>

                          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Order Value</span>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#1c1917' }}>₹{avgOrderVal.toFixed(2)}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Average checkout basket amount</p>
                          </div>

                          <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory Stock Alerts</span>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: '#dc2626' }}>{lowStock}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{outOfStock} items currently out of stock</p>
                          </div>
                        </div>

                        {/* Recent Activity / Performance Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                          {/* Top Categories */}
                          <div className="glass-card" style={{ padding: '2rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.3rem' }}>Category Popularity</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Distribution of catalog listings by category</p>
                            
                            {(() => {
                              const categoryCounts = {};
                              products.forEach(p => {
                                const cat = p.category || 'General';
                                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                              });

                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  {Object.entries(categoryCounts).map(([cat, count]) => {
                                    const percent = ((count / products.length) * 100).toFixed(0);
                                    return (
                                      <div key={cat}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                          <span style={{ color: '#1c1917' }}>{cat}</span>
                                          <strong style={{ color: '#1c1917' }}>{count} items ({percent}%)</strong>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f4efe6', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '4px' }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Recent Activity */}
                          <div className="glass-card" style={{ padding: '2rem', maxWidth: 'none', background: '#fff', border: '1px solid rgba(212,197,185,0.5)', borderRadius: '20px' }}>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.3rem' }}>Recent Orders Activity</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Audit timeline of order placements</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                              {adminOrders.slice(0, 5).map(order => (
                                <div key={order.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(212,197,185,0.4)' }}>
                                  <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1c1917' }}>Order {order.orderId}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</span>
                                  </div>
                                  <span style={{ fontWeight: 700, color: '#059669' }}>+₹{Number(order.totalAmount).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
          )}
        </div>
      </div>
      ) : (
        <div className="auth-container">
          <div className="auth-card">
            <div className="brand-logo-center" style={{ marginBottom: '0.2rem' }}>
              <span className="brand-initial-l">L</span>AURITE
            </div>
            <span className="brand-tag-sub" style={{ display: 'block', marginBottom: '1.75rem' }}>HAUTE COUTURE</span>

            {/* LOGIN VIEW */}
            {view === 'login' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your customer portal</p>

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

                  <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loading ? <div className="spinner"></div> : 'Sign In →'}
                  </button>
                </form>

                <p className="footer-text">
                  New customer?
                  <span className="footer-link" onClick={() => { clearMessages(); setView('register'); }}>
                    Create an account
                  </span>
                </p>
              </div>
            )}

            {/* REGISTER VIEW */}
            {view === 'register' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Create Account</h2>
                <p className="auth-subtitle">Register as a valued LAURITE customer</p>

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

                  <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loading ? <div className="spinner"></div> : 'Register Account →'}
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Verify Email</h2>
                <p className="auth-subtitle">Enter the code sent to {email}</p>

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

                  <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loading ? <div className="spinner"></div> : 'Confirm Account →'}
                  </button>
                </form>

                <button 
                  type="button" 
                  className="btn-primary btn-secondary" 
                  onClick={handleResendCode}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '0.75rem' }}
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Update Password</h2>
                <p className="auth-subtitle">Configure a new password for first-time use</p>

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

                  <button type="submit" className="btn-primary btn-gold" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loading ? <div className="spinner"></div> : 'Set Password & Log In →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Global Top-Level Product Add/Edit Overlay Modal */}
          {(isAddingProduct || editingProduct) && (
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
                          value={categories.includes(productForm.category?.toUpperCase()) ? productForm.category?.toUpperCase() : 'CUSTOM'}
                          onChange={(e) => {
                            if (e.target.value !== 'CUSTOM') {
                              setProductForm({ ...productForm, category: e.target.value });
                            }
                          }}
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: '#ffffff', border: '1px solid rgba(212,197,185,0.6)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                        >
                          <option value="CUSTOM">-- Select Existing Category --</option>
                          {categories.filter(c => c !== 'ALL').map(c => (
                            <option key={c} value={c}>{c}</option>
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
                            style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }}
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
                            style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }}
                            onError={(e) => {
                              const base = cleanS3ImageUrl(productForm.imageUrl);
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
          )}

          {/* Global Top-Level Cart Drawer Overlay */}
          {isCartOpen && (
            <div className="modal-overlay-backdrop" onClick={() => setIsCartOpen(false)}>
              <div className="cart-drawer-wrapper" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', borderBottom: '1px solid rgba(212,197,185,0.4)', background: '#fff' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#1c1917', margin: 0 }}>Shopping Bag</h2>
                  <button type="button" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#57534e' }}>
                    ✕
                  </button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
                  {cartData.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#57534e' }}>
                      <p style={{ fontWeight: 600, color: '#1c1917', fontSize: '1.1rem' }}>Your shopping bag is empty.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Explore our catalog to add luxury items.</p>
                    </div>
                  ) : (
                    cartData.items.map(item => (
                      <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(212,197,185,0.3)' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1c1917' }}>{item.productName}</h4>
                          <span style={{ fontSize: '0.82rem', color: '#57534e' }}>₹{Number(item.price).toFixed(2)} each</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '9999px', padding: '0.2rem 0.6rem' }}>
                            <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem', fontWeight: 700 }}>-</button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.4rem', color: '#1c1917' }}>{item.quantity}</span>
                            <button type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem', fontWeight: 700 }}>+</button>
                          </div>

                          <button type="button" onClick={() => handleRemoveItem(item.productId)} disabled={cartLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem' }}>
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cartData.items.length > 0 && (
                  <div style={{ padding: '1.75rem', borderTop: '1px solid rgba(212,197,185,0.4)', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#57534e' }}>
                      <span>Subtotal</span>
                      <span style={{ color: '#1c1917', fontWeight: 600 }}>₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.88rem', color: '#57534e' }}>
                      <span>Shipping</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>COMPLIMENTARY</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#1c1917', borderTop: '1px solid rgba(212,197,185,0.4)', paddingTop: '0.75rem' }}>
                      <span>Total Amount</span>
                      <span>₹{cartSubtotal.toFixed(2)}</span>
                    </div>

                    <button type="button" className="btn-primary btn-gold" onClick={handleCheckout} disabled={cartLoading} style={{ width: '100%', padding: '0.85rem' }}>
                      {cartLoading ? <div className="spinner"></div> : 'Proceed to Checkout →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Global Top-Level Invoice Overlay Modal */}
          {selectedOrderForInvoice && (
            <div className="modal-overlay-backdrop" onClick={() => setSelectedOrderForInvoice(null)}>
              <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212,197,185,0.4)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0, color: '#1c1917' }}>Official Tax Invoice</h2>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-primary btn-gold" onClick={() => window.print()} style={{ margin: 0, padding: '0.45rem 1.1rem', fontSize: '0.82rem', width: 'auto' }}>
                      Print / Save PDF
                    </button>
                    <button type="button" className="btn-primary btn-secondary" onClick={() => setSelectedOrderForInvoice(null)} style={{ margin: 0, padding: '0.45rem 0.9rem', width: 'auto' }}>
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ color: '#1c1917', background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(212,197,185,0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: 0, color: '#1c1917' }}>LAURITE HAUTE COUTURE</h1>
                      <p style={{ margin: '0.2rem 0', color: '#57534e', fontSize: '0.82rem' }}>Luxury Global E-Commerce</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#57534e' }}>INVOICE</h2>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#1c1917' }}><strong>Order ID:</strong> {selectedOrderForInvoice.orderId}</p>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#57534e' }}><strong>Date:</strong> {new Date(selectedOrderForInvoice.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#57534e', fontSize: '0.85rem' }}>Customer Details:</h4>
                      <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#1c1917' }}>{selectedOrderForInvoice.userId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ margin: 0, color: '#57534e', fontSize: '0.85rem' }}>Payment Info:</h4>
                      <p style={{ margin: '0.2rem 0', fontWeight: 700, color: '#10b981' }}>{selectedOrderForInvoice.paymentMode || 'COD'} ({selectedOrderForInvoice.paymentStatus || 'SUCCESS'})</p>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.65rem', textAlign: 'left', color: '#475569' }}>Item Description</th>
                        <th style={{ padding: '0.65rem', textAlign: 'right', color: '#475569' }}>Unit Price</th>
                        <th style={{ padding: '0.65rem', textAlign: 'center', color: '#475569' }}>Qty</th>
                        <th style={{ padding: '0.65rem', textAlign: 'right', color: '#475569' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderForInvoice.items && selectedOrderForInvoice.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 600, color: '#1c1917' }}>{item.productName}</td>
                          <td style={{ padding: '0.65rem', textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                          <td style={{ padding: '0.65rem', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 700 }}>₹{Number(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <div style={{ width: '240px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>
                        <span>Subtotal</span>
                        <span>₹{Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>
                        <span>Shipping</span>
                        <span>FREE</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#1c1917', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                        <span>Grand Total</span>
                        <span>₹{Number(selectedOrderForInvoice.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

export default App;
