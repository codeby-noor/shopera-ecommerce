import React from 'react';
import { Link } from 'react-router-dom';
import ShoperaLogo from '../components/common/ShoperaLogo';

const About = () => {
  return (
    <div className="about-page py-5">
      <div className="container">
        {/* Hero Section */}
        <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-5 text-white position-relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e293b 60%, var(--color-accent-purple) 100%)' }}>
          <div className="position-relative" style={{ zIndex: 2, maxWidth: '750px' }}>
            <span className="badge rounded-pill px-3 py-2 fw-semibold mb-3" style={{ background: 'rgba(255,107,53,0.2)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
              ABOUT SHOPERA
            </span>
            <h1 className="display-4 fw-black tracking-tight mb-3">
              Shop More. Live Better.
            </h1>
            <p className="lead text-light opacity-90 mb-4" style={{ lineHeight: 1.7 }}>
              SHOPERA is a modern, high-performance multi-category e-commerce marketplace engineered to bring flagship technology, trend-setting fashion, premium audio, athletic gear, and lifestyle essentials into one unified shopping experience.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4 py-2 fw-bold">
                Explore Marketplace <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <Link to="/contact" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                Contact Our Team
              </Link>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="position-absolute end-0 top-0 w-50 h-100 opacity-25 d-none d-md-block"
               style={{ background: 'radial-gradient(circle at 70% 30%, var(--color-accent-pink), transparent 60%)', filter: 'blur(40px)', zIndex: 1 }}></div>
        </div>

        {/* Core Pillars */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 hover-lift">
              <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 text-white"
                   style={{ width: '56px', height: '56px', background: 'var(--color-primary)' }}>
                <i className="bi bi-shield-check fs-3"></i>
              </div>
              <h5 className="fw-bold mb-2">100% Verified Authentic</h5>
              <p className="text-secondary small mb-0">
                Every product across our 12 primary categories is sourced from authorized global brands with manufacturer warranty protection.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 hover-lift">
              <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 text-white"
                   style={{ width: '56px', height: '56px', background: 'var(--color-accent-pink)' }}>
                <i className="bi bi-lightning-charge fs-3"></i>
              </div>
              <h5 className="fw-bold mb-2">Instant Global Logistics</h5>
              <p className="text-secondary small mb-0">
                Rapid express dispatch on orders over $500. Real-time telemetry order tracking from warehouse to your doorstep.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 rounded-4 hover-lift">
              <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 text-white"
                   style={{ width: '56px', height: '56px', background: 'var(--color-accent-purple)' }}>
                <i className="bi bi-arrow-repeat fs-3"></i>
              </div>
              <h5 className="fw-bold mb-2">30-Day Hassle-Free Returns</h5>
              <p className="text-secondary small mb-0">
                Shop with confidence. If an item doesn't exceed your expectations, return it within 30 days for a swift, automated refund.
              </p>
            </div>
          </div>
        </div>

        {/* Marketplace Metrics Banner */}
        <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-5 bg-white">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="display-5 fw-black text-gradient mb-1">12</div>
              <div className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.05em' }}>Marketplace Categories</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="display-5 fw-black text-gradient mb-1">120+</div>
              <div className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.05em' }}>Believable Products</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="display-5 fw-black text-gradient mb-1">96+</div>
              <div className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.05em' }}>Global Brands</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="display-5 fw-black text-gradient mb-1">99.9%</div>
              <div className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.05em' }}>Platform Reliability</div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Section */}
        <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-5 bg-white">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill mb-3">
                SYSTEM ARCHITECTURE
              </span>
              <h2 className="fw-bold mb-3">Engineered for Performance, Scalability & Security</h2>
              <p className="text-secondary mb-4" style={{ lineHeight: 1.7 }}>
                SHOPERA is built with a production-grade decoupled architecture. The frontend is powered by React 18, React Router v6, Bootstrap 5, and custom CSS design tokens bundled with Webpack 5. The backend runs on Node.js and Express.js with connection pooling to a live MySQL 8.0 relational database.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 text-secondary">
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span><strong>ACID Relational Integrity:</strong> Strict foreign key constraints and transactional order creation.</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span><strong>Server-Side Price & Inventory Guard:</strong> Stock is locked and validated server-side to prevent overselling.</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span><strong>Enterprise Security:</strong> Salted Bcrypt password hashing and stateless JWT bearer token authentication.</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-white" style={{ background: 'var(--color-navy)' }}>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-50">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1 rounded-circle bg-danger d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                    <span className="p-1 rounded-circle bg-warning d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                    <span className="p-1 rounded-circle bg-success d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                    <span className="text-secondary small ms-2 font-monospace">shopera-stack-info.json</span>
                  </div>
                  <span className="badge bg-success bg-opacity-25 text-success small font-monospace">HEALTHY</span>
                </div>
                <pre className="text-info font-monospace small mb-0" style={{ maxHeight: '240px', overflowY: 'auto' }}>
{`{
  "project": "SHOPERA E-Commerce Marketplace",
  "developer": "Mahenoor Shaikh",
  "frontend": {
    "framework": "React 18",
    "router": "React Router v6",
    "styling": "Bootstrap 5 + Custom CSS Tokens",
    "bundler": "Webpack 5 + Babel 7",
    "state": "React Context API (Auth, Cart, Wishlist)"
  },
  "backend": {
    "runtime": "Node.js (LTS)",
    "framework": "Express.js REST APIs",
    "security": "JWT + Bcrypt (Salt rounds 10)"
  },
  "database": {
    "engine": "MySQL 8.0 Relational",
    "driver": "mysql2/promise",
    "tables": 10,
    "catalogue_count": 120
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Developer Credit Section */}
        <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 text-center position-relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
          <div className="mx-auto mb-3" style={{ maxWidth: '80px' }}>
            <div className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm"
                 style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-pink))', color: '#fff' }}>
              <i className="bi bi-code-slash fs-2"></i>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2 fw-bold text-uppercase mb-2 text-primary" style={{ background: 'rgba(255,107,53,0.1)' }}>
            PORTFOLIO SHOWCASE
          </span>
          <h3 className="fw-black text-navy mb-2">Designed & Developed by Mahenoor Shaikh</h3>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '640px', lineHeight: 1.65 }}>
            Crafted with passion as a demonstration of production-grade full-stack engineering, responsive design systems, relational SQL modeling, and intuitive user experiences.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">React 18</span>
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">Node.js & Express</span>
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">MySQL Relational DB</span>
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">Webpack 5</span>
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">JWT Authentication</span>
            <span className="badge bg-white text-navy border shadow-2xs py-2 px-3 rounded-pill fw-semibold">RESTful API Design</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
