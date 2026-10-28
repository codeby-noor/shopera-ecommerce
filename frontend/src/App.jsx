import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';
import CompareFloatingBar from './components/common/CompareFloatingBar';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Offers from './pages/Offers';

// Informational & Support Pages
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsPolicy from './pages/ReturnsPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import TrackOrder from './pages/TrackOrder';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';

const AppLayout = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:idOrSlug" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Informational & Support Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/shipping" element={<Navigate to="/shipping-policy" replace />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/returns-policy" element={<Navigate to="/returns" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/terms-conditions" element={<Navigate to="/terms" replace />} />
          <Route path="/track-order" element={<TrackOrder />} />

          {/* Protected Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderNumber"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminCustomers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminRoute>
                <AdminReviews />
              </AdminRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPath && <CompareFloatingBar />}
      {!isAdminPath && <Footer />}
      {!isAdminPath && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <AppLayout />
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}

export default App;
