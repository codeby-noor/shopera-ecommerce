import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide on admin routes, checkout (to prevent checkout collision), order confirmation, and product detail (where sticky purchase bar takes priority)
  const isCheckout = location.pathname === '/checkout';
  const isAdmin = location.pathname.startsWith('/admin');
  const isOrderConfirmation = location.pathname.startsWith('/order-confirmation');
  const isProductDetail = location.pathname.startsWith('/products/') && location.pathname !== '/products';

  if (isCheckout || isAdmin || isOrderConfirmation || isProductDetail) {
    return null;
  }

  const isHomeActive = location.pathname === '/';
  const isShopActive = location.pathname.startsWith('/products') || location.pathname === '/offers';
  const isWishlistActive = location.pathname === '/wishlist';
  const isCartActive = location.pathname === '/cart';
  const isAccountActive = location.pathname === '/profile' || location.pathname === '/orders' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav
      className="mobile-bottom-nav d-lg-none"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="bottom-nav-inner">
        {/* Home */}
        <NavLink
          to="/"
          className={`bottom-nav-item ${isHomeActive ? 'active' : ''}`}
          aria-label="Home"
        >
          <div className="bottom-nav-icon-wrap">
            <i className={`bi ${isHomeActive ? 'bi-house-door-fill' : 'bi-house-door'}`}></i>
          </div>
          <span className="bottom-nav-label">Home</span>
        </NavLink>

        {/* Shop / Categories */}
        <NavLink
          to="/products"
          className={`bottom-nav-item ${isShopActive ? 'active' : ''}`}
          aria-label="Shop and Categories"
        >
          <div className="bottom-nav-icon-wrap">
            <i className={`bi ${isShopActive ? 'bi-grid-fill' : 'bi-grid'}`}></i>
          </div>
          <span className="bottom-nav-label">Explore</span>
        </NavLink>

        {/* Wishlist */}
        <NavLink
          to="/wishlist"
          className={`bottom-nav-item ${isWishlistActive ? 'active' : ''}`}
          aria-label={`Wishlist, ${wishlistCount} items`}
        >
          <div className="bottom-nav-icon-wrap position-relative">
            <i className={`bi ${isWishlistActive ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            {wishlistCount > 0 && (
              <span className="bottom-nav-badge bg-accent-pink" aria-hidden="true">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="bottom-nav-label">Saved</span>
        </NavLink>

        {/* Cart */}
        <NavLink
          to="/cart"
          className={`bottom-nav-item ${isCartActive ? 'active' : ''}`}
          aria-label={`Shopping Cart, ${cartCount} items`}
        >
          <div className="bottom-nav-icon-wrap position-relative">
            <i className={`bi ${isCartActive ? 'bi-bag-fill' : 'bi-bag'}`}></i>
            {cartCount > 0 && (
              <span className="bottom-nav-badge bg-primary" aria-hidden="true">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="bottom-nav-label">Cart</span>
        </NavLink>

        {/* Account / Profile */}
        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={`bottom-nav-item ${isAccountActive ? 'active' : ''}`}
          aria-label={isAuthenticated ? 'My Account' : 'Sign In'}
        >
          <div className="bottom-nav-icon-wrap">
            <i className={`bi ${isAccountActive ? 'bi-person-fill' : 'bi-person'}`}></i>
          </div>
          <span className="bottom-nav-label">{isAuthenticated ? 'Account' : 'Sign In'}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
