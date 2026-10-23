import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const faqData = [
    {
      category: 'ordering',
      q: 'How does checkout and payment work on SHOPERA?',
      a: 'This marketplace platform is configured with a simulated, safe local checkout flow. You can use any simulated card number or test digital wallet payment without submitting real financial information. Orders are instantly validated on our backend, recorded to the MySQL database, and inventory is decremented in real-time.'
    },
    {
      category: 'ordering',
      q: 'Can I apply promotional coupons to my order?',
      a: 'Yes! SHOPERA supports active discount coupons. Enter valid codes such as "SHOPERA10" (10% off orders > $50), "WELCOME20" ($20 off > $100), or "MEGA50" ($50 off > $250) on the Cart or Checkout screen. The server validates coupon criteria before finalizing your order.'
    },
    {
      category: 'shipping',
      q: 'What are the shipping charges and delivery timelines?',
      a: 'We offer free express delivery on all orders totaling $500 or more. For orders below $500, a flat $15.00 express shipping fee applies. Standard delivery takes 2–4 business days within the continental United States, with priority air delivery taking 1–2 days.'
    },
    {
      category: 'shipping',
      q: 'How do I track my placed order?',
      a: 'You can navigate to the "Track My Order" page or check your Customer Account dashboard under "My Orders". Simply enter your Order Number (e.g. ORD-202610-84729) to see real-time milestone tracking from order processing to out-for-delivery.'
    },
    {
      category: 'returns',
      q: 'What is SHOPERA’s return and refund policy?',
      a: 'We offer a 30-day money-back guarantee on all eligible products. Items must be returned in their original packaging with all included accessories. Once received and inspected, refunds are credited back to your original payment method within 3–5 business days.'
    },
    {
      category: 'returns',
      q: 'Can I cancel an order after placing it?',
      a: 'Orders in "processing" status can be cancelled directly from your Order History page. When an order is cancelled, our MySQL database automatically restructures the order status and restores the reserved product quantities back into active inventory.'
    },
    {
      category: 'products',
      q: 'Are all products authentic and covered by warranty?',
      a: 'Yes, 100%. All products listed across our 12 categories represent genuine products from reputable global manufacturers (Apple, Dell, Sony, Bose, Nike, Levi’s, Dyson, etc.) and include manufacturer warranty coverage.'
    },
    {
      category: 'account',
      q: 'How is my account data secured?',
      a: 'Security is paramount. User passwords are encrypted with bcrypt (10 salt rounds) before touching the database. API authentication is handled via cryptographically signed JSON Web Tokens (JWT). We never store plaintext passwords or sensitive payment card numbers.'
    },
    {
      category: 'platform',
      q: 'Who developed this marketplace platform?',
      a: 'SHOPERA was designed and developed by full-stack software engineer Mahenoor Shaikh as a comprehensive developer portfolio project showcasing production-style React 18, Webpack 5, Node.js/Express REST APIs, and MySQL 8.0 relational architecture.'
    }
  ];

  const filteredFaqs = faqData.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="faq-page py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Help & FAQs</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2" style={{ background: 'rgba(247,37,133,0.1)', color: 'var(--color-accent-pink)' }}>
            HELP CENTER
          </span>
          <h1 className="fw-black display-5 mb-3">Frequently Asked Questions</h1>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
            Find quick answers to common questions about shopping, shipping, demo payments, returns, and account security on SHOPERA.
          </p>

          {/* Search Bar */}
          <div className="mx-auto position-relative" style={{ maxWidth: '520px' }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="text"
              className="form-control rounded-pill ps-5 py-3 border-2 border-secondary border-opacity-25 shadow-sm"
              placeholder="Search questions (e.g. coupon, shipping, returns)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${activeTab === 'all' ? 'btn-shopera-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('all')}
          >
            All Questions
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${activeTab === 'ordering' ? 'btn-shopera-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('ordering')}
          >
            Ordering & Coupons
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${activeTab === 'shipping' ? 'btn-shopera-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Tracking
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${activeTab === 'returns' ? 'btn-shopera-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('returns')}
          >
            Returns & Refunds
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${activeTab === 'account' ? 'btn-shopera-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('account')}
          >
            Account Security
          </button>
        </div>

        {/* Accordion */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mx-auto mb-5" style={{ maxWidth: '860px' }}>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-question-circle display-4 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold">No matching questions found</h5>
              <p className="text-secondary small">Try searching with different keywords or browse all categories.</p>
              <button className="btn btn-outline-secondary rounded-pill px-4 btn-sm" onClick={() => { setSearch(''); setActiveTab('all'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="accordion accordion-flush" id="faqAccordion">
              {filteredFaqs.map((faq, idx) => (
                <div className="accordion-item border-bottom py-2" key={idx}>
                  <h2 className="accordion-header" id={`heading${idx}`}>
                    <button
                      className={`accordion-button fw-bold text-navy ${idx !== 0 ? 'collapsed' : ''}`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${idx}`}
                      aria-expanded={idx === 0 ? 'true' : 'false'}
                      aria-controls={`collapse${idx}`}
                    >
                      {faq.q}
                    </button>
                  </h2>
                  <div
                    id={`collapse${idx}`}
                    className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`}
                    aria-labelledby={`heading${idx}`}
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body text-secondary small" style={{ lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still have questions CTA */}
        <div className="card border-0 rounded-4 p-4 p-md-5 text-center text-white"
             style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-accent-purple) 100%)' }}>
          <h3 className="fw-bold mb-2">Still Have Questions?</h3>
          <p className="text-light opacity-90 mx-auto mb-4" style={{ maxWidth: '500px' }}>
            Can’t find the answer you’re looking for? Reach out directly to our customer care team and we’ll be glad to help.
          </p>
          <div>
            <Link to="/contact" className="btn btn-shopera-primary rounded-pill px-4 py-2 fw-bold">
              Contact Customer Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
