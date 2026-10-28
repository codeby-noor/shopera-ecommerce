import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useCurrency } from '../../context/CurrencyContext';
import { categoriesAPI, productsAPI } from '../../services/api';
import ShoperaLogo from './ShoperaLogo';
import CurrencySelector from './CurrencySelector';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, cartSubtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { formatPrice } = useCurrency();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Close dropdowns on route change
    setUserDropdownOpen(false);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Click outside to close search suggestions and mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideDesktop = !searchContainerRef.current || !searchContainerRef.current.contains(e.target);
      const isOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(e.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setUserDropdownOpen(false);
        setCategoriesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories in navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  // Category horizontal scroll detection
  const checkCategoryScroll = useCallback(() => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkCategoryScroll();
    window.addEventListener('resize', checkCategoryScroll);
    return () => window.removeEventListener('resize', checkCategoryScroll);
  }, [categories, checkCategoryScroll]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkCategoryScroll, 320);
    }
  };

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productsAPI.getSuggestions(searchQuery.trim());
        if (res.data.success) {
          setSuggestions({
            products: res.data.products || [],
            categories: res.data.categories || []
          });
          setShowSuggestions(true);
        }
      } catch (err) {
        // Silently handle suggestion failure
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (path) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="sticky-top">
      {/* 1. Top Marketplace Utility Announcement Bar (Desktop & Tablet) */}
      <div className="top-utility-bar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 gap-lg-3 min-w-0">
            <span className="top-announcement-badge flex-shrink-0">
              <i className="bi bi-tag-fill me-1"></i>EXCLUSIVE
            </span>
            <span className="text-truncate small">
              <span className="d-none d-xl-inline">Shop More. Live Better. &bull; </span>
              Free Express Delivery on orders over $500 &bull; Code: <strong className="text-white">SHOPERA10</strong> (-10%)
            </span>
          </div>
          <div className="d-flex align-items-center gap-3 gap-lg-4 text-nowrap flex-shrink-0 ms-2">
            <Link to="/track-order" className="d-flex align-items-center gap-1 small">
              <i className="bi bi-geo-alt"></i><span>Track Order</span>
            </Link>
            <Link to="/faq" className="d-none d-lg-flex align-items-center gap-1 small">
              <i className="bi bi-question-circle"></i><span>Help & FAQs</span>
            </Link>
            <Link to="/offers" className="d-flex align-items-center gap-1 small">
              <i className="bi bi-percent text-warning"></i><span>Deals</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-warning fw-bold d-flex align-items-center gap-1 small">
                <i className="bi bi-shield-check"></i><span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Search Navigation */}
      <nav className="navbar navbar-expand-lg navbar-shopera py-2 position-relative">
        <div className="container d-flex align-items-center justify-content-between">
          {/* Brand Logo with Shopping Bag Symbol */}
          <ShoperaLogo size="md" className="me-2 me-lg-4" />

          {/* Mobile Header Quick Utilities (Visible < lg) */}
          <div className="d-flex align-items-center gap-2 d-lg-none ms-auto">
            {/* Quick Currency Selector on larger phones */}
            <div className="d-none d-sm-block">
              <CurrencySelector />
            </div>

            {/* Quick Wishlist Icon */}
            <Link
              to="/wishlist"
              className="nav-icon-btn nav-icon-btn-sm text-decoration-none"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <i className="bi bi-heart fs-6"></i>
              {wishlistCount > 0 && (
                <span className="badge-counter" style={{ background: 'var(--color-accent-pink)' }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Quick Cart Icon */}
            <Link
              to="/cart"
              className="nav-icon-btn nav-icon-btn-sm text-decoration-none"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <i className="bi bi-bag fs-6"></i>
              {cartCount > 0 && (
                <span className="badge-counter">{cartCount}</span>
              )}
            </Link>

            {/* Accessible Mobile Toggle Button (44x44px target) */}
            <button
              className="navbar-toggler border-0 shadow-none p-0 d-flex align-items-center justify-content-center"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: mobileMenuOpen ? 'rgba(255,107,53,0.1)' : 'transparent' }}
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg text-primary' : 'bi-list text-dark'} fs-2`}></i>
            </button>
          </div>

          {/* Desktop Navigation Content */}
          <div className="collapse navbar-collapse d-none d-lg-flex" id="desktopNavbarContent">
            {/* Department Quick Dropdown */}
            <div className="dropdown position-relative me-2">
              <button
                className="btn btn-shopera-outline rounded-pill py-2 px-3 fw-bold d-flex align-items-center gap-2"
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                aria-expanded={categoriesDropdownOpen}
              >
                <i className="bi bi-grid-fill text-primary fs-6"></i>
                <span className="small">All Categories</span>
                <i className="bi bi-chevron-down fs-8 text-muted"></i>
              </button>

              {categoriesDropdownOpen && (
                <div
                  className="dropdown-menu show shadow-xl border-0 rounded-4 py-2 mt-2"
                  style={{ minWidth: '280px', left: 0, zIndex: 1050 }}
                >
                  <Link to="/products" className="dropdown-item py-2 fw-bold text-primary">
                    <i className="bi bi-collection me-2"></i>Explore All 12 Categories
                  </Link>
                  <hr className="dropdown-divider my-1" />
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        className="dropdown-item py-2 d-flex justify-content-between align-items-center"
                      >
                        <span className="fw-medium">{cat.name}</span>
                        <span className="badge bg-light text-muted border rounded-pill">{cat.product_count || 10}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Marketplace Search Bar with Autocomplete Dropdown */}
            <div className="position-relative flex-grow-1 mx-2" ref={searchContainerRef}>
              <form className="d-flex w-100" onSubmit={handleSearchSubmit}>
                <div className="search-input-group w-100">
                  <i className="bi bi-search search-icon-pos"></i>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search 120+ products, brands (Apple, Sony, Nike), categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                    }}
                    aria-label="Search Marketplace"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-sm text-muted border-0 p-0"
                      style={{ position: 'absolute', right: '72px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search input"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                  <button type="submit" className="search-btn-inside">
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div
                  className="card border-0 shadow-xl rounded-4 position-absolute top-100 start-0 w-100 mt-2 overflow-hidden bg-white"
                  style={{ zIndex: 1060, maxHeight: '420px', overflowY: 'auto' }}
                >
                  {/* Category matches */}
                  {suggestions.categories.length > 0 && (
                    <div className="p-3 bg-light border-bottom">
                      <small className="text-secondary fw-bold text-uppercase d-block mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                        Matching Categories
                      </small>
                      <div className="d-flex flex-wrap gap-2">
                        {suggestions.categories.map((cat) => (
                          <button
                            key={cat.id}
                            className="btn btn-sm btn-white border rounded-pill px-3 py-1 text-navy fw-semibold small shadow-2xs hover-lift"
                            onClick={() => handleSelectSuggestion(`/products?category=${cat.slug}`)}
                          >
                            <i className="bi bi-tag-fill text-primary me-1"></i>
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product matches */}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <small className="text-secondary fw-bold text-uppercase px-3 py-1 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                        Matching Products ({suggestions.products.length})
                      </small>
                      {suggestions.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer hover-bg-light transition-all"
                          onClick={() => handleSelectSuggestion(`/products/${prod.slug || prod.id}`)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={prod.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                              alt={prod.title}
                              className="rounded-2 object-fit-cover"
                              style={{ width: '42px', height: '42px' }}
                            />
                            <div>
                              <div className="fw-semibold text-navy text-truncate" style={{ maxWidth: '380px', fontSize: '0.9rem' }}>
                                {prod.title}
                              </div>
                              <small className="text-secondary">
                                {prod.brand && <span className="fw-semibold text-primary me-2">{prod.brand}</span>}
                                In {prod.category_name}
                              </small>
                            </div>
                          </div>
                          <div className="text-end ps-2">
                            <span className="fw-bold text-navy" style={{ fontSize: '0.92rem' }}>
                              {formatPrice(prod.discount_price || prod.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View all results link */}
                  <div className="p-2 border-top bg-light text-center">
                    <button
                      className="btn btn-link text-primary fw-bold text-decoration-none small p-1"
                      onClick={handleSearchSubmit}
                    >
                      View all results for "{searchQuery}" <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Icons & User Controls */}
            <div className="d-flex align-items-center gap-2 gap-xl-3 ms-2 ms-xl-3 flex-shrink-0">
              {/* International Currency Selector */}
              <CurrencySelector />

              {/* Product Comparison Link */}
              <Link to="/compare" className="nav-icon-btn text-decoration-none" title="Product Comparison" aria-label="Compare Products">
                <i className="bi bi-arrow-left-right fs-5"></i>
                {compareCount > 0 && (
                  <span className="badge-counter" style={{ background: 'var(--color-primary)' }}>
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Link */}
              <Link to="/wishlist" className="nav-icon-btn text-decoration-none" title="Wishlist">
                <i className="bi bi-heart fs-5"></i>
                {wishlistCount > 0 && (
                  <span className="badge-counter" style={{ background: 'var(--color-accent-pink)' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link with Subtotal Preview */}
              <Link to="/cart" className="d-flex align-items-center gap-2 text-decoration-none" title="Shopping Cart">
                <div className="nav-icon-btn">
                  <i className="bi bi-bag fs-5"></i>
                  {cartCount > 0 && (
                    <span className="badge-counter">{cartCount}</span>
                  )}
                </div>
                <div className="d-flex flex-column text-start">
                  <span className="text-muted" style={{ fontSize: '0.68rem', lineHeight: 1 }}>Cart</span>
                  <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                    {formatPrice(cartSubtotal || 0)}
                  </span>
                </div>
              </Link>

              {/* User Dropdown / Auth CTA */}
              {isAuthenticated ? (
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-user-profile d-flex align-items-center gap-2"
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                  >
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name || 'Account'}
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                    <div className="d-flex flex-column text-start">
                      <span className="text-muted" style={{ fontSize: '0.68rem', lineHeight: 1 }}>Welcome back,</span>
                      <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '90px', fontSize: '0.82rem' }}>
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <i className="bi bi-chevron-down fs-8 text-muted"></i>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end show shadow-xl border-0 rounded-4 py-2 mt-2"
                      style={{ minWidth: '220px' }}
                    >
                      <div className="px-3 py-2 border-bottom mb-1">
                        <div className="fw-bold text-dark">{user?.name}</div>
                        <div className="text-muted small text-truncate">{user?.email}</div>
                      </div>

                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item py-2 text-warning fw-semibold">
                          <i className="bi bi-shield-lock-fill me-2"></i>Admin Console
                        </Link>
                      )}

                      <Link to="/profile" className="dropdown-item py-2">
                        <i className="bi bi-person me-2"></i>My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item py-2">
                        <i className="bi bi-box-seam me-2"></i>My Orders
                      </Link>
                      <Link to="/track-order" className="dropdown-item py-2">
                        <i className="bi bi-geo-alt me-2"></i>Track Shipment
                      </Link>
                      <Link to="/wishlist" className="dropdown-item py-2">
                        <i className="bi bi-heart me-2"></i>Saved Items ({wishlistCount})
                      </Link>

                      <hr className="dropdown-divider my-1" />

                      <button
                        className="dropdown-item py-2 text-danger fw-semibold"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-shopera-outline py-2 px-3 fs-7">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-shopera-primary py-2 px-3 fs-7">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Dedicated Mobile Search Bar Row (Always reachable on mobile) */}
      <div className="d-lg-none bg-white border-bottom px-3 py-2" ref={mobileSearchRef}>
        <form className="d-flex w-100" onSubmit={handleSearchSubmit}>
          <div className="search-input-group w-100 position-relative">
            <i className="bi bi-search search-icon-pos"></i>
            <input
              className="form-control"
              type="search"
              placeholder="Search 120+ products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowSuggestions(true);
              }}
              aria-label="Search SHOPERA Marketplace"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm text-muted border-0 p-0"
                style={{ position: 'absolute', right: '62px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
                onClick={() => setSearchQuery('')}
                aria-label="Clear mobile search input"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
            <button type="submit" className="search-btn-inside">
              <span>Go</span>
            </button>
          </div>
        </form>

        {/* Mobile Suggestions Dropdown */}
        {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
          <div
            className="card border-0 shadow-xl rounded-4 position-absolute start-0 end-0 mx-3 mt-2 overflow-hidden bg-white"
            style={{ zIndex: 1070, top: '100%', maxHeight: '360px', overflowY: 'auto' }}
          >
            {suggestions.categories.length > 0 && (
              <div className="p-2 bg-light border-bottom">
                <small className="text-secondary fw-bold text-uppercase d-block mb-1 px-2" style={{ fontSize: '0.7rem' }}>
                  Categories
                </small>
                <div className="d-flex flex-wrap gap-1 px-2">
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="btn btn-sm btn-white border rounded-pill px-2 py-1 text-navy fw-semibold small"
                      onClick={() => handleSelectSuggestion(`/products?category=${cat.slug}`)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {suggestions.products.length > 0 && (
              <div className="p-2">
                <small className="text-secondary fw-bold text-uppercase px-2 py-1 d-block" style={{ fontSize: '0.7rem' }}>
                  Products ({suggestions.products.length})
                </small>
                {suggestions.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer hover-bg-light"
                    onClick={() => handleSelectSuggestion(`/products/${prod.slug || prod.id}`)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={prod.title}
                        className="rounded-2 object-fit-cover"
                        style={{ width: '38px', height: '38px' }}
                      />
                      <div className="text-truncate" style={{ maxWidth: '190px' }}>
                        <div className="fw-semibold text-navy text-truncate small">{prod.title}</div>
                        <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{prod.category_name}</small>
                      </div>
                    </div>
                    <span className="fw-bold text-navy small ps-2">
                      {formatPrice(prod.discount_price || prod.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Mobile Category Horizontal Touch Strip */}
      <div className="mobile-category-scroll d-lg-none">
        <Link to="/offers" className="mobile-category-chip highlight">
          <i className="bi bi-lightning-charge-fill text-warning"></i>Deals & Offers
        </Link>
        <Link
          to="/products"
          className={`mobile-category-chip ${location.pathname === '/products' && !location.search ? 'active' : ''}`}
        >
          All Products
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className={`mobile-category-chip ${location.search.includes(cat.slug) ? 'active' : ''}`}
          >
            {cat.name}
          </Link>
        ))}
        <Link to="/products?sort=popular" className="mobile-category-chip">
          <i className="bi bi-award text-warning"></i>Best Sellers
        </Link>
      </div>

      {/* 5. Mobile Navigation Slide-out Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          <div className="mobile-drawer show shadow-2xl p-4 d-flex flex-column" id="navbarContent" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            {/* Drawer Header */}
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
              <ShoperaLogo size="sm" asLink={false} />
              <button
                type="button"
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '44px', height: '44px', minWidth: '44px' }}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation drawer"
              >
                <i className="bi bi-x-lg fs-5"></i>
              </button>
            </div>

            {/* User Account Section */}
            {isAuthenticated ? (
              <div className="bg-light rounded-4 p-3 mb-3 border">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'Account'}
                    className="rounded-circle"
                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  />
                  <div className="text-truncate">
                    <strong className="d-block text-dark text-truncate">{user?.name}</strong>
                    <small className="text-muted text-truncate d-block">{user?.email}</small>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-2 pt-2 border-top">
                  <Link
                    to="/profile"
                    className="btn btn-sm btn-white border rounded-pill flex-grow-1 fw-semibold text-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="btn btn-sm btn-white border rounded-pill flex-grow-1 fw-semibold text-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                </div>
              </div>
            ) : (
              <div className="d-flex gap-2 mb-3">
                <Link
                  to="/login"
                  className="btn btn-shopera-outline flex-grow-1 py-2 fw-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-shopera-primary flex-grow-1 py-2 fw-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Currency Selector Row */}
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border mb-3">
              <span className="small fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-globe2 text-primary fs-5"></i>
                <span>Store Currency:</span>
              </span>
              <CurrencySelector />
            </div>

            {/* Drawer Quick Links */}
            <div className="drawer-nav-links d-flex flex-column gap-1 mb-3">
              <Link
                to="/offers"
                className="drawer-link-item highlight d-flex align-items-center justify-content-between p-2 rounded-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-percent fs-5 text-warning"></i>
                  <span className="fw-bold">Promotions & Flash Deals</span>
                </span>
                <span className="badge bg-warning text-dark fw-bold">Active</span>
              </Link>

              <Link
                to="/wishlist"
                className="drawer-link-item d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none text-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-heart fs-5 text-danger"></i>
                  <span>Saved Items</span>
                </span>
                {wishlistCount > 0 && <span className="badge bg-danger rounded-pill">{wishlistCount}</span>}
              </Link>

              <Link
                to="/compare"
                className="drawer-link-item d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none text-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-left-right fs-5 text-primary"></i>
                  <span>Compare Products</span>
                </span>
                {compareCount > 0 && <span className="badge bg-primary rounded-pill">{compareCount}</span>}
              </Link>

              <Link
                to="/track-order"
                className="drawer-link-item d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none text-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt fs-5 text-info"></i>
                  <span>Track Shipment</span>
                </span>
              </Link>

              <Link
                to="/faq"
                className="drawer-link-item d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none text-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-question-circle fs-5 text-secondary"></i>
                  <span>Help & FAQs</span>
                </span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="drawer-link-item d-flex align-items-center justify-content-between p-2 rounded-3 text-warning fw-bold bg-dark rounded-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check fs-5"></i>
                    <span>Admin Console</span>
                  </span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
              )}
            </div>

            {/* Department Catalogue */}
            <div className="mt-2 pt-3 border-top flex-grow-1 overflow-auto">
              <div className="small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                Explore 12 Categories
              </div>
              <div className="d-flex flex-column gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="p-2 d-flex justify-content-between align-items-center text-decoration-none text-secondary rounded-3 hover-bg-light"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="fw-medium text-dark">{cat.name}</span>
                    <span className="badge bg-light text-muted border rounded-pill">{cat.product_count || 10}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer with Attribution & Logout */}
            <div className="pt-3 border-top mt-auto">
              {isAuthenticated && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 rounded-pill mb-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </button>
              )}
              <div className="text-center">
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                  SHOPERA &bull; "Shop More. Live Better."
                </small>
                <small className="text-secondary d-block mt-1" style={{ fontSize: '0.68rem' }}>
                  Designed & Developed by Mahenoor Shaikh
                </small>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. Desktop Category Navigation Strip with Smooth Scroll Controls */}
      <div className="category-nav-strip d-none d-lg-block">
        <div className="container position-relative px-4">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              type="button"
              className="btn category-nav-scroll-btn start-0"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
              title="Scroll left"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          )}

          {/* Scrollable Categories List */}
          <div
            className="category-nav-scroll-wrapper"
            ref={categoryScrollRef}
            onScroll={checkCategoryScroll}
          >
            <Link to="/offers" className="category-nav-link highlight">
              <i className="bi bi-percent"></i>Coupons & Deals
            </Link>
            <Link
              to="/products"
              className={`category-nav-link ${location.pathname === '/products' && !location.search ? 'active' : ''}`}
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className={`category-nav-link ${location.search.includes(cat.slug) ? 'active' : ''}`}
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/products?sort=popular" className="category-nav-link best-seller">
              <i className="bi bi-award text-warning"></i>Best Sellers
            </Link>
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              type="button"
              className="btn category-nav-scroll-btn end-0"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
              title="Scroll right"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
