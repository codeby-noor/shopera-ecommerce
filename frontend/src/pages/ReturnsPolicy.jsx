import React from 'react';
import { Link } from 'react-router-dom';

const ReturnsPolicy = () => {
  return (
    <div className="returns-policy-page py-5">
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Returns & Refunds</li>
          </ol>
        </nav>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2 align-self-start" style={{ background: 'rgba(114,9,183,0.1)', color: 'var(--color-accent-purple)' }}>
            HASSLE-FREE GUARANTEE
          </span>
          <h1 className="fw-black mb-4">SHOPERA 30-Day Returns & Refund Policy</h1>
          <p className="text-secondary mb-4">Last Updated: October 2026</p>

          <div className="d-flex flex-column gap-4 text-secondary" style={{ lineHeight: 1.75 }}>
            <section>
              <h4 className="fw-bold text-navy mb-2">1. The 30-Day Money-Back Guarantee</h4>
              <p>
                At SHOPERA, we want you to feel completely confident in every purchase. If for any reason you are not thoroughly satisfied with your merchandise, you may initiate a return within <strong>30 days of the delivery date</strong> for a full refund or exchange.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">2. Return Eligibility Requirements</h4>
              <p>To qualify for a full refund, items must satisfy the following criteria:</p>
              <ul>
                <li>Must be in original, unblemished cosmetic condition with all manufacturer tags intact.</li>
                <li>Electronics, phones, and audio devices must include original charging cables, power supplies, literature, and retail boxes.</li>
                <li>Apparel and footwear must be unworn, unwashed, and returned in the original brand box or dustbag.</li>
                <li>Beauty and personal care products must have safety seals unbroken due to sanitary standards.</li>
              </ul>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">3. How to Initiate a Return</h4>
              <ol>
                <li>Visit your <Link to="/orders" className="text-primary fw-semibold">Order History</Link> or open a ticket on our <Link to="/contact" className="text-primary fw-semibold">Contact Page</Link>.</li>
                <li>State your Order Number (e.g. <code>ORD-202610-84729</code>) and the reason for the return.</li>
                <li>Receive your prepaid return shipping label and package the item securely.</li>
                <li>Drop off the package at any authorized parcel drop-off center.</li>
              </ol>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">4. Refund Processing Time</h4>
              <p>
                Once your return is scanned at our logistics center, our inspection team verifies the merchandise within 24–48 hours. Refunds are automatically issued back to your original payment method within <strong>3–5 business days</strong>.
              </p>
            </section>
          </div>

          <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
            <Link to="/contact" className="btn btn-outline-secondary rounded-pill px-4">
              Start Return Request
            </Link>
            <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4">
              Browse Catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
