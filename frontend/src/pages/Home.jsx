import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import RecentlyViewed from '../components/product/RecentlyViewed';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, catRes] = await Promise.all([
          productsAPI.getFeatured(),
          categoriesAPI.getCategories()
        ]);

        if (featRes.data.success) {
          setFeaturedProducts(featRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="home-page pb-5">
      {/* 1. Hero Marketplace Showcase */}
      <section className="container pt-3 pt-md-4">
        <div className="hero-wrapper">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="hero-pill-badge mb-3">
                <i className="bi bi-bag-check-fill" style={{ color: 'var(--color-primary)' }}></i>
                <span>SHOPERA Online Marketplace &bull; Shop More. Live Better.</span>
              </div>
              <h1 className="hero-title mb-4">
                Your Next-Gen Tech & <br className="d-none d-md-inline" />
                <span className="hero-title-highlight">Lifestyle Marketplace.</span>
              </h1>
              <p className="hero-lead mb-4">
                Discover flagship tech, trending fashion, beauty essentials, premium footwear, sports gear, and modern home decor with ultra-fast express delivery across 12 departments.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link 
                  to="/products" 
                  className="btn btn-shopera-primary btn-lg rounded-pill px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 shadow-lg"
                >
                  <span>Start Shopping</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link 
                  to="/products?featured=1" 
                  className="btn btn-shopera-outline btn-lg rounded-pill px-4 py-3 fw-semibold text-white bg-transparent border-light"
                >
                  <i className="bi bi-fire text-warning me-1"></i>
                  <span>Explore Deals</span>
                </Link>
              </div>

              {/* Marketplace Live Trust Counters */}
              <div className="row g-2 g-sm-3 mt-4 mt-md-5 pt-3 border-top border-secondary border-opacity-25 text-center text-sm-start">
                <div className="col-4">
                  <h5 className="fw-bold mb-0 text-white fs-6 fs-sm-5">100% Free</h5>
                  <small className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>Express over $500</small>
                </div>
                <div className="col-4">
                  <h5 className="fw-bold mb-0 text-white fs-6 fs-sm-5">4.9 / 5.0</h5>
                  <small className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>Verified Reviews</small>
                </div>
                <div className="col-4">
                  <h5 className="fw-bold mb-0 text-white fs-6 fs-sm-5">30-Day</h5>
                  <small className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>Easy Returns</small>
                </div>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block text-center position-relative">
              <div className="position-relative d-inline-block">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
                  alt="Flagship Workstation"
                  className="rounded-4 shadow-xl img-fluid"
                  style={{ maxHeight: '380px', objectFit: 'cover' }}
                />
                {/* Floating Marketplace Deal Pill */}
                <div
                  className="position-absolute bg-white text-dark p-3 rounded-4 shadow-xl border d-flex align-items-center gap-3 text-start"
                  style={{ bottom: '-20px', left: '-25px', maxWidth: '260px' }}
                >
                  <div 
                    className="p-2 rounded-3 text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #F72585)' }}
                  >
                    <i className="bi bi-percent fs-4"></i>
                  </div>
                  <div>
                    <span className="small fw-bold text-dark d-block">Super Marketplace Deal</span>
                    <small className="text-muted">Save up to $200 today</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Marketplace Value Perks Ribbon */}
      <section className="container mt-4 pt-2">
        <div className="row g-3">
          <div className="col-lg-3 col-sm-6">
            <div className="perk-card h-100">
              <div className="perk-icon-wrap" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <i className="bi bi-truck"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Free Express Shipping</h6>
                <small className="text-muted">Fast dispatch on orders $500+</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="perk-card h-100">
              <div className="perk-icon-wrap" style={{ background: 'var(--color-accent-pink-light)', color: 'var(--color-accent-pink)' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Buyer Protection</h6>
                <small className="text-muted">100% Authentic brand guarantee</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="perk-card h-100">
              <div className="perk-icon-wrap" style={{ background: 'var(--color-accent-purple-light)', color: 'var(--color-accent-purple)' }}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">30-Day Easy Returns</h6>
                <small className="text-muted">Instant refund simulation</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="perk-card h-100">
              <div className="perk-icon-wrap" style={{ background: '#ECFDF5', color: 'var(--color-success)' }}>
                <i className="bi bi-headset"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">24/7 Expert Support</h6>
                <small className="text-muted">Live chat with tech specialists</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Departments */}
      <section className="container mt-4 mt-md-5 pt-3">
        <div className="d-flex justify-content-between align-items-end mb-3 mb-md-4">
          <div>
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Curated Collections</span>
            <h2 className="fw-bold mb-0">Explore Departments</h2>
          </div>
          <Link to="/products" className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-1 small">
            <span>View All</span>
            <i className="bi bi-arrow-right fs-6"></i>
          </Link>
        </div>

        {/* Mobile Horizontal Category Cards Touch Track */}
        <div className="mobile-categories-scroll-track d-md-none">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.slug}`} className="mobile-category-card-item">
              <div className="mobile-category-card-thumb">
                <img src={category.image_url} alt={category.name} loading="lazy" />
              </div>
              <span className="mobile-category-card-title">{category.name}</span>
            </Link>
          ))}
        </div>

        {/* Desktop & Tablet Categories Grid */}
        <div className="row g-4 d-none d-md-flex">
          {categories.map((category) => (
            <div key={category.id} className="col-lg-2 col-md-4">
              <Link to={`/products?category=${category.slug}`} className="category-card">
                <div className="category-img-wrap">
                  <img src={category.image_url} alt={category.name} loading="lazy" />
                  <div className="category-overlay">
                    <span className="category-name-badge">{category.name}</span>
                    <span className="category-count-pill">{category.product_count} Items</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Marketplace Products */}
      <section className="container mt-4 mt-md-5 pt-3 pt-md-4">
        <div className="d-flex justify-content-between align-items-end mb-3 mb-md-4">
          <div>
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Staff Picks & Trending</span>
            <h2 className="fw-bold mb-0">Featured Products</h2>
          </div>
          <Link to="/products?featured=1" className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-1 small">
            <span>Explore All</span>
            <i className="bi bi-arrow-right fs-6"></i>
          </Link>
        </div>

        {loading ? (
          <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="col-6 col-md-4 col-lg-3 product-col-adaptive">
                <div className="card border-0 shadow-sm p-4 text-center rounded-4" style={{ height: '280px' }}>
                  <div className="spinner-border text-primary m-auto" role="status"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
            {featuredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3 product-col-adaptive">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Marketplace Flash Deals Promo Banner */}
      <section className="container mt-5 pt-4">
        <div className="marketplace-deal-banner">
          <div className="p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <div className="d-inline-flex align-items-center gap-2 mb-3">
                  <span className="deal-highlight-badge">
                    <i className="bi bi-lightning-charge-fill me-1"></i>LIMITED FLASH PROMOTION
                  </span>
                  <span className="badge bg-warning text-dark fw-bold">Up to 30% Off</span>
                </div>
                <h2 className="display-6 fw-bold text-white mb-3">
                  Studio Acoustics, Noise-Cancelling & Spatial Audio
                </h2>
                <p className="text-light opacity-80 fs-5 mb-4 pe-lg-5">
                  Immerse yourself in precision sound with active noise-canceling headphones from Sony & Sennheiser. Special limited pricing this week only.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link 
                    to="/products?category=audio-headphones" 
                    className="btn btn-shopera-primary rounded-pill px-4 py-3 fw-bold"
                  >
                    Shop Audio Collection
                  </Link>
                  <Link 
                    to="/products" 
                    className="btn btn-outline-light rounded-pill px-4 py-3 fw-semibold"
                  >
                    Browse All Marketplace Deals
                  </Link>
                </div>
              </div>
              <div className="col-lg-5 text-center">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Sony WH-1000XM5"
                  className="rounded-4 img-fluid shadow-xl"
                  style={{ maxHeight: '310px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <div className="container">
        <RecentlyViewed title="Pick Up Where You Left Off" />
      </div>

      {/* 6. Customer Testimonials & Verified Shoppers */}
      <section className="container mt-5 pt-4">
        <div className="text-center mb-5">
          <span className="text-primary fw-bold text-uppercase small tracking-wider">Social Proof</span>
          <h2 className="fw-bold">Loved by Shoppers Worldwide</h2>
          <p className="text-muted">Over 50,000+ orders fulfilled with five-star verified reviews.</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-white">
              <div className="text-warning mb-3">
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <p className="text-secondary fst-italic mb-4">
                "The MacBook Pro 16 M3 Max arrived in flawless factory packaging within 48 hours. SHOPERA's checkout experience is seamless, modern, and rapid."
              </p>
              <div className="d-flex align-items-center gap-3 mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                  alt="David K."
                  className="rounded-circle"
                  style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark">David K.</h6>
                  <small className="text-muted">Verified Buyer &bull; San Francisco, CA</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-white">
              <div className="text-warning mb-3">
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <p className="text-secondary fst-italic mb-4">
                "Sony XM5 noise-cancelling headphones are absolute perfection. SHOPERA provided instant order tracking and real-time email notifications."
              </p>
              <div className="d-flex align-items-center gap-3 mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                  alt="Elena R."
                  className="rounded-circle"
                  style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Elena R.</h6>
                  <small className="text-muted">Verified Buyer &bull; Austin, TX</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 bg-white">
              <div className="text-warning mb-3">
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill me-1"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <p className="text-secondary fst-italic mb-4">
                "The product inventory accuracy and simulated checkout are top notch. Great design, fast response times, and wonderful customer support."
              </p>
              <div className="d-flex align-items-center gap-3 mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80"
                  alt="Marcus T."
                  className="rounded-circle"
                  style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Marcus T.</h6>
                  <small className="text-muted">Verified Buyer &bull; Seattle, WA</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
