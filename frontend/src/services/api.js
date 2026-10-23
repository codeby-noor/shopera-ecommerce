import axios from 'axios';

// Resolve API base URL safely for browser environments (defaults to http://localhost:5000/api)
const resolveBaseUrl = () => {
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch (e) {
    // Ignore runtime environment inspection errors
  }
  return 'http://localhost:5000/api';
};

// Base API configuration
const API = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear token
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('apex_token');
        localStorage.removeItem('apex_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (data) => API.post('/auth/reset-password', data)
};

// Products Services
export const productsAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getFeatured: () => API.get('/products/featured'),
  getProduct: (idOrSlug) => API.get(`/products/${idOrSlug}`),
  getRelated: (id) => API.get(`/products/${id}/related`),
  getSuggestions: (q) => API.get('/products/search/suggestions', { params: { q } }),
  getBrands: (params) => API.get('/products/meta/brands', { params }),
  addReview: (productId, reviewData) => API.post(`/products/${productId}/reviews`, reviewData),
  getReviewEligibility: (productId) => API.get(`/products/${productId}/review-eligibility`)
};

// Categories Services
export const categoriesAPI = {
  getCategories: () => API.get('/categories'),
  getCategory: (slug) => API.get(`/categories/${slug}`)
};

// Cart Services
export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (productId, quantity = 1) => API.post('/cart', { productId, quantity }),
  updateQuantity: (cartItemId, quantity) => API.put(`/cart/${cartItemId}`, { quantity }),
  removeFromCart: (cartItemId) => API.delete(`/cart/${cartItemId}`),
  clearCart: () => API.delete('/cart'),
  syncCart: (items) => API.post('/cart/sync', { items })
};

// Wishlist Services
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist'),
  toggleWishlist: (productId) => API.post('/wishlist/toggle', { productId }),
  removeFromWishlist: (productId) => API.delete(`/wishlist/${productId}`)
};

// Orders Services
export const ordersAPI = {
  createOrder: (orderData) => API.post('/orders', orderData),
  getMyOrders: () => API.get('/orders'),
  getOrder: (idOrNumber) => API.get(`/orders/${idOrNumber}`),
  trackOrder: (orderNumber) => API.get(`/orders/track/${encodeURIComponent(orderNumber)}`),
  cancelOrder: (orderId) => API.put(`/orders/${orderId}/cancel`),
  validateCoupon: (code, subtotal) => API.post('/orders/validate-coupon', { code, subtotal }),
  calculateSummary: (payload) => API.post('/orders/calculate-summary', payload)
};

// Users / Address Services
export const usersAPI = {
  getAddresses: () => API.get('/users/addresses'),
  addAddress: (addressData) => API.post('/users/addresses', addressData),
  updateAddress: (id, addressData) => API.put(`/users/addresses/${id}`, addressData),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => API.put(`/users/addresses/${id}/default`)
};

// Admin Services
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  createProduct: (productData) => API.post('/admin/products', productData),
  updateProduct: (id, productData) => API.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  createCategory: (catData) => API.post('/admin/categories', catData),
  updateCategory: (id, catData) => API.put(`/admin/categories/${id}`, catData),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
  getAllOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),
  getAllCustomers: (params) => API.get('/admin/customers', { params }),
  getCoupons: () => API.get('/admin/coupons'),
  createCoupon: (couponData) => API.post('/admin/coupons', couponData),
  updateCoupon: (id, couponData) => API.put(`/admin/coupons/${id}`, couponData),
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
  getAllReviews: (params) => API.get('/admin/reviews', { params }),
  deleteReview: (id) => API.delete(`/admin/reviews/${id}`)
};

export default API;
