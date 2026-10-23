import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShoperaLogo from './ShoperaLogo';
import CurrencySelector from './CurrencySelector';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@') || !newsletterEmail.includes('.')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 5000);
  };

  return (
    <footer className="footer-shopera pt-5 mt-5">
      <div className="container">
        {/* Marketplace Value Proposition Ribbon */}
        <div className="row g-4 pb-5 border-bottom border-secondary border-opacity-25">
          <div className="col-lg-3 col-sm-6">
            <div className="footer-perk-item">
              <div className="footer-perk-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div>
                <h6 className="text-white fw-bold mb-1">Free Express Delivery</h6>
                <small className="text-secondary">On all orders over $500</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="footer-perk-item">
              <div className="footer-perk-icon" style={{ background: 'rgba(247, 37, 133, 0.15)', color: 'var(--color-accent-pink)' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div>
                <h6 className="text-white fw-bold mb-1">100% Authentic Goods</h6>
                <small className="text-secondary">Verified brand warranties</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="footer-perk-item">
              <div className="footer-perk-icon" style={{ background: 'rgba(114, 9, 183, 0.15)', color: 'var(--color-accent-purple)' }}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div>
                <h6 className="text-white fw-bold mb-1">30-Day Returns</h6>
                <small className="text-secondary">Hassle-free money-back guarantee</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="footer-perk-item">
              <div className="footer-perk-icon">
                <i className="bi bi-headset"></i>
              </div>
              <div>
                <h6 className="text-white fw-bold mb-1">24/7 Expert Support</h6>
                <small className="text-secondary">Live chat & order assistance</small>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Marketplace Info */}
        <div className="row g-4 py-5">
          <div className="col-lg-4 col-md-6">
            <div className="mb-3">
              <ShoperaLogo size="md" theme="dark" withTagline={true} />
            </div>
            <p className="text-secondary pe-lg-4 mt-3" style={{ lineHeight: 1.65 }}>
              SHOPERA is a modern, customer-first online shopping marketplace. Explore curated electronics, next-generation workstations, flagship smartphones, audio gear, apparel, footwear, and home living.
            </p>
            <div className="d-flex gap-3 text-secondary fs-5 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-secondary text-hover-primary" title="Twitter/X"><i className="bi bi-twitter-x"></i></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-secondary text-hover-primary" title="GitHub"><i className="bi bi-github"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-secondary text-hover-primary" title="LinkedIn"><i className="bi bi-linkedin"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-secondary text-hover-primary" title="Instagram"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Categories</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/products?category=laptops-workstations" className="text-secondary text-decoration-none">Laptops & PCs</Link></li>
              <li className="mb-2"><Link to="/products?category=smartphones-tablets" className="text-secondary text-decoration-none">Smartphones</Link></li>
              <li className="mb-2"><Link to="/products?category=premium-audio" className="text-secondary text-decoration-none">Hi-Fi Audio</Link></li>
              <li className="mb-2"><Link to="/products?category=fashion-men" className="text-secondary text-decoration-none">Men's Fashion</Link></li>
              <li className="mb-2"><Link to="/products?category=fashion-women" className="text-secondary text-decoration-none">Women's Fashion</Link></li>
              <li className="mb-2"><Link to="/products?category=shoes-footwear" className="text-secondary text-decoration-none">Footwear & Shoes</Link></li>
              <li className="mb-2"><Link to="/products?category=home-kitchen" className="text-secondary text-decoration-none">Home & Kitchen</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Customer Care</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/offers" className="text-secondary text-decoration-none text-hover-primary"><i className="bi bi-tag me-1 text-warning"></i>Deals & Coupons</Link></li>
              <li className="mb-2"><Link to="/track-order" className="text-secondary text-decoration-none">Track My Order</Link></li>
              <li className="mb-2"><Link to="/faq" className="text-secondary text-decoration-none">Help & FAQs</Link></li>
              <li className="mb-2"><Link to="/shipping-policy" className="text-secondary text-decoration-none">Shipping Policy</Link></li>
              <li className="mb-2"><Link to="/returns" className="text-secondary text-decoration-none">Returns & Refunds</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-secondary text-decoration-none">Contact Support</Link></li>
              <li className="mb-2"><Link to="/about" className="text-secondary text-decoration-none">About SHOPERA</Link></li>
              <li className="mb-2"><Link to="/privacy" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
              <li className="mb-2"><Link to="/terms" className="text-secondary text-decoration-none">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Get Exclusive Deals</h6>
            <p className="text-secondary small">
              Subscribe to SHOPERA VIP to receive flash sale alerts, secret coupon drops (use <strong>SHOPERA10</strong> for 10% off), and weekly product guides.
            </p>
            {newsletterSuccess ? (
              <div className="alert alert-success border-0 py-2 px-3 rounded-pill small d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i>
                <span>Thanks for subscribing! Check your inbox for exclusive perks.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="input-group mb-2">
                  <input
                    type="email"
                    className="form-control bg-secondary bg-opacity-25 border-secondary text-white"
                    placeholder="Enter your email address"
                    aria-label="Email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button className="btn btn-shopera-primary fw-semibold px-4" type="submit">
                    Subscribe
                  </button>
                </div>
                {newsletterError && <small className="text-danger d-block mb-2">{newsletterError}</small>}
              </form>
            )}
            <div className="d-flex align-items-center gap-2 text-secondary small mt-3">
              <i className="bi bi-shield-lock-fill text-success"></i>
              <span>SSL 256-bit Encrypted. Zero Spam Guarantee.</span>
            </div>
          </div>
        </div>

        {/* Developer Attribution & Copyright Section */}
        <div className="py-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-column flex-sm-row align-items-center gap-2 text-center text-sm-start">
            <small className="text-secondary">
              &copy; {new Date().getFullYear()} <strong>SHOPERA Inc.</strong> &bull; "Shop More. Live Better."
            </small>
            <span className="text-secondary d-none d-sm-inline opacity-50">&bull;</span>
            <small className="badge bg-secondary bg-opacity-25 text-light fw-medium px-3 py-1 rounded-pill">
              Designed & Developed by Mahenoor Shaikh
            </small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <CurrencySelector variant="footer" />
            <div className="d-flex gap-2 text-secondary fs-5">
              <i className="bi bi-credit-card-2-front" title="Credit Cards"></i>
              <i className="bi bi-wallet2" title="Digital Wallets"></i>
              <i className="bi bi-paypal" title="PayPal"></i>
              <i className="bi bi-apple" title="Apple Pay"></i>
            </div>
            <span className="text-secondary opacity-50">•</span>
            <Link to="/admin" className="text-secondary text-decoration-none small fw-semibold">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
