import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page py-5">
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2 align-self-start" style={{ background: 'rgba(20,33,61,0.1)', color: 'var(--color-navy)' }}>
            DATA PRIVACY & SECURITY
          </span>
          <h1 className="fw-black mb-4">SHOPERA Privacy Policy</h1>
          <p className="text-secondary mb-4">Last Updated: October 2026</p>

          <div className="d-flex flex-column gap-4 text-secondary" style={{ lineHeight: 1.75 }}>
            <section>
              <h4 className="fw-bold text-navy mb-2">1. Our Commitment to Your Privacy</h4>
              <p>
                SHOPERA Inc. ("SHOPERA", "we", "our") respects the privacy of our visitors and customers. This Privacy Policy details how we collect, handle, and safeguard your personal information across our multi-category e-commerce web platform.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">2. Information We Collect</h4>
              <p>When you create an account, browse products, or place simulated orders, we collect:</p>
              <ul>
                <li><strong>Account Credentials:</strong> Name, email address, contact phone number, and encrypted password hashes.</li>
                <li><strong>Delivery Addresses:</strong> Full recipient name, street address, city, state, postal code, and country for shipping fulfillment.</li>
                <li><strong>Order History:</strong> Record of purchased items, coupon codes redeemed, and order timestamps.</li>
                <li><strong>Technical Data:</strong> Browser user-agent headers, session timestamps, and device viewport metrics to ensure responsive rendering.</li>
              </ul>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">3. Password Encryption & Security Standards</h4>
              <p>
                All user passwords are encrypted using salted <code>bcrypt</code> hashing (10 computational rounds) prior to database persistence. We never store, transmit, or log plaintext passwords. API communication between the React frontend and Express backend is protected by cryptographically signed JSON Web Tokens (JWT) and HTTPS/SSL 256-bit protocols.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">4. Zero Data Selling Guarantee</h4>
              <p>
                We will never sell, rent, lease, or monetize your personal shopping information or contact details to third-party ad brokers or data marketers under any circumstances.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">5. Developer & Educational Context</h4>
              <p>
                This application serves as an active full-stack portfolio demonstration engineered by <strong>Mahenoor Shaikh</strong>. All payments processed on this installation are simulated and do not handle actual currency transactions.
              </p>
            </section>
          </div>

          <div className="mt-5 pt-4 border-top">
            <Link to="/contact" className="btn btn-shopera-primary rounded-pill px-4">
              Have Questions? Contact Privacy Officer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
