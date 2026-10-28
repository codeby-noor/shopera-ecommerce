import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

const Offers = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  const coupons = [
    {
      code: 'SHOPERA10',
      discount: '10% OFF',
      minSpend: '$50 minimum spend',
      description: 'Site-wide discount on all marketplace departments.',
      badgeBg: 'linear-gradient(135deg, #FF6B35, #F72585)',
      expires: 'Valid through 2026'
    },
    {
      code: 'WELCOME20',
      discount: '$20 OFF',
      minSpend: '$100 minimum spend',
      description: 'Exclusive welcome voucher for registered members.',
      badgeBg: 'linear-gradient(135deg, #F72585, #7209B7)',
      expires: 'Limited Redemptions'
    },
    {
      code: 'MEGA50',
      discount: '$50 OFF',
      minSpend: '$250 minimum spend',
      description: 'Substantial savings on laptops, flagship tech, and bulk orders.',
      badgeBg: 'linear-gradient(135deg, #7209B7, #14213D)',
      expires: 'Special Campaign'
    },
    {
      code: 'SUMMER15',
      discount: '15% OFF',
      minSpend: '$75 minimum spend',
      description: 'Seasonal promotion on fashion, sports, footwear, and beauty.',
      badgeBg: 'linear-gradient(135deg, #FF6B35, #FFA07A)',
      expires: 'Seasonal Special'
    }
  ];

  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with discount sorting or limit
        const res = await productsAPI.getProducts({ limit: 12 });
        if (res.data.success) {
          // Filter products that have discount_price
          const discounted = res.data.products.filter(
            p => p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < Number(p.price)
          );
          setDealProducts(discounted.length > 0 ? discounted : res.data.products.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDealProducts();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="offers-page py-4">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-navy fw-semibold" aria-current="page">Offers & Deals</li>
          </ol>
        </nav>

        {/* Hero Promotional Banner */}
        <div className="hero-wrapper mb-5 p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="hero-pill-badge mb-3">
                <i className="bi bi-tag-fill" style={{ color: 'var(--color-primary)' }}></i>
                <span>EXCLUSIVE MARKETPLACE DISCOUNTS &bull; VERIFIED SAVINGS</span>
              </span>
              <h1 className="hero-title mb-3">
                Shop More. <span className="hero-title-highlight">Save More.</span>
              </h1>
              <p className="hero-lead mb-4 text-light opacity-80" style={{ maxWidth: '640px' }}>
                Unlock instant percentage and flat-dollar discounts at checkout with verified SHOPERA promotional codes. Stack coupons with our $500 free express shipping threshold.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#coupon-codes" className="btn btn-shopera-primary btn-lg rounded-pill px-4 fw-bold">
                  View Coupon Codes
                </a>
                <Link to="/products" className="btn btn-shopera-outline btn-lg rounded-pill px-4 fw-semibold text-white border-light">
                  Explore Products
                </Link>
              </div>
            </div>
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div className="p-4 bg-white bg-opacity-10 backdrop-blur rounded-4 border border-white border-opacity-25 text-white">
                <i className="bi bi-gift-fill display-3 text-warning mb-2 d-block"></i>
                <h4 className="fw-bold mb-1">Instant Savings</h4>
                <p className="small mb-0 opacity-75">Apply coupons directly in your shopping bag or during checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Active Coupons */}
        <div id="coupon-codes" className="mb-5 pt-2">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Promo Vouchers</span>
              <h2 className="fw-bold mb-0">Active Coupon Codes</h2>
            </div>
            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">
              100% Server Verified
            </span>
          </div>

          <div className="row g-4">
            {coupons.map((c) => {
              const isCopied = copiedCode === c.code;

              return (
                <div key={c.code} className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column">
                    {/* Card Top Pill */}
                    <div className="p-3 text-white text-center" style={{ background: c.badgeBg }}>
                      <span className="display-6 fw-bold">{c.discount}</span>
                      <small className="d-block opacity-90 fw-semibold">{c.minSpend}</small>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <p className="text-secondary small mb-3 flex-grow-1">
                        {c.description}
                      </p>

                      <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center mb-3 border">
                        <code className="fw-bold text-navy fs-6">{c.code}</code>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                            isCopied ? 'btn-success' : 'btn-outline-primary'
                          }`}
                          onClick={() => handleCopyCode(c.code)}
                        >
                          {isCopied ? (
                            <>
                              <i className="bi bi-check-lg me-1"></i>Copied
                            </>
                          ) : (
                            <>
                              <i className="bi bi-copy me-1"></i>Copy
                            </>
                          )}
                        </button>
                      </div>

                      <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                        <span><i className="bi bi-clock me-1"></i>{c.expires}</span>
                        <Link to="/products" className="text-primary text-decoration-none fw-semibold">
                          Apply Now &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Featured Discounted Deals */}
        <div className="mb-5 pt-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Top Markdowns</span>
              <h2 className="fw-bold mb-0">Flash Marketplace Deals</h2>
            </div>
            <Link to="/products" className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-1">
              <span>View All Products</span>
              <i className="bi bi-arrow-right fs-6"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary m-auto" role="status"></div>
            </div>
          ) : (
            <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
              {dealProducts.map((product) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3 product-col-adaptive">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Trust & Shipping Perks */}
        <div className="p-4 rounded-4 border bg-white shadow-sm mb-4">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <i className="bi bi-truck text-primary fs-2 mb-2 d-block"></i>
              <h6 className="fw-bold text-dark mb-1">Free Express Delivery</h6>
              <p className="text-muted small mb-0">Orders $500 and above qualify for automatic free shipping.</p>
            </div>
            <div className="col-md-4 border-start-md">
              <i className="bi bi-shield-check text-success fs-2 mb-2 d-block"></i>
              <h6 className="fw-bold text-dark mb-1">Authentic Guarantee</h6>
              <p className="text-muted small mb-0">100% genuine brand merchandise across all 12 departments.</p>
            </div>
            <div className="col-md-4 border-start-md">
              <i className="bi bi-arrow-counterclockwise text-info fs-2 mb-2 d-block"></i>
              <h6 className="fw-bold text-dark mb-1">30-Day Hassle-Free Returns</h6>
              <p className="text-muted small mb-0">Easy return requests and instant simulated refund credit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
