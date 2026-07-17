import { API_BASE_URL } from './config';

/**
 * Helper to get the ID Token from localStorage.
 */
function getIdToken() {
  const session = localStorage.getItem('cognito_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.idToken || null;
  } catch (e) {
    return null;
  }
}

/**
 * Unwraps the standard ApiResponse envelope { success, message, data }.
 * If the response is already a raw object (not wrapped), it is returned as-is.
 */
function unwrap(body) {
  if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
    return body.data;
  }
  return body;
}

/**
 * Interceptor for Fetch API to inject auth headers and catch 401.
 * Returns the unwrapped `.data` field from the ApiResponse envelope.
 *
 * @param {string} path - API path (relative to API_BASE_URL)
 * @param {object} options - fetch options; also accepts:
 *   suppressLogout {boolean} - if true, a 401 throws a normal Error instead
 *                              of the special 'UNAUTHORIZED' sentinel that
 *                              triggers a full session logout.
 */
async function request(path, options = {}) {
  const { suppressLogout, ...fetchOptions } = options;
  const idToken = getIdToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {})
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  if (response.status === 401) {
    if (suppressLogout) {
      // Don't force a full session logout for secondary data fetches
      throw new Error('Authentication required');
    }
    // Session is invalid/expired — clear storage and signal logout
    localStorage.removeItem('cognito_session');
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    let errorMsg = `HTTP error! Status: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        errorMsg = errBody.message;
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Parse JSON response. If empty or no content (e.g. 204 or clear cart), return null
  const text = await response.text();
  if (!text) return null;
  const body = JSON.parse(text);
  // Unwrap the { success, message, data } envelope that all Lambda handlers return
  return unwrap(body);
}

// ----------------------------------------------------
// PRODUCT SERVICE
// ----------------------------------------------------
export async function getProducts() {
  return request('/products', { method: 'GET', suppressLogout: true });
}

// ----------------------------------------------------
// CART SERVICE
// ----------------------------------------------------
export async function getCart(userId) {
  return request(`/cart/${userId}`, { method: 'GET', suppressLogout: true });
}

export async function addCartItem(userId, productId, productName, price, quantity) {
  return request(`/cart/${userId}/items`, {
    method: 'POST',
    suppressLogout: true,
    body: JSON.stringify({ productId, productName, price, quantity })
  });
}

export async function updateCartItem(userId, productId, quantity) {
  return request(`/cart/${userId}/items/${productId}`, {
    method: 'PUT',
    suppressLogout: true,
    body: JSON.stringify({ quantity })
  });
}

export async function removeCartItem(userId, productId) {
  return request(`/cart/${userId}/items/${productId}`, {
    method: 'DELETE',
    suppressLogout: true
  });
}

export async function clearCart(userId) {
  return request(`/cart/${userId}/clear`, {
    method: 'DELETE',
    suppressLogout: true
  });
}

// ----------------------------------------------------
// ORDER SERVICE
// ----------------------------------------------------
export async function createOrder(userId, items) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify({ userId, items })
  });
}
