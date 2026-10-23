import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'order_inquiry',
    orderNumber: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    // Simulate real network submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        topic: 'order_inquiry',
        orderNumber: '',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="contact-page py-5">
      <div className="container">
        {/* Header Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Contact Us</li>
          </ol>
        </nav>

        {/* Title */}
        <div className="text-center mb-5">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)' }}>
            WE’RE HERE TO HELP
          </span>
          <h1 className="fw-black display-5 mb-2">Get in Touch with SHOPERA</h1>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Have a question about an order, product specifications, shipping, or returns? Our dedicated support specialists are available 24/7.
          </p>
        </div>

        <div className="row g-4 mb-5">
          {/* Contact Information & Channels */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100 text-white"
                 style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e293b 100%)' }}>
              <h3 className="fw-bold mb-4">Contact Information</h3>
              
              <div className="d-flex flex-column gap-4 mb-5">
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                       style={{ background: 'rgba(255,107,53,0.2)', color: 'var(--color-primary)', width: '48px', height: '48px' }}>
                    <i className="bi bi-envelope-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Customer Support Email</h6>
                    <p className="text-secondary small mb-1">For general inquiries and order updates:</p>
                    <a href="mailto:support@shopera.demo" className="text-decoration-none text-light fw-semibold">
                      support@shopera.demo
                    </a>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                       style={{ background: 'rgba(247,37,133,0.2)', color: 'var(--color-accent-pink)', width: '48px', height: '48px' }}>
                    <i className="bi bi-telephone-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Toll-Free Customer Care</h6>
                    <p className="text-secondary small mb-1">Mon–Sat from 8:00 AM to 9:00 PM EST:</p>
                    <span className="text-light fw-semibold">+1 (800) 746-7372</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                       style={{ background: 'rgba(114,9,183,0.2)', color: 'var(--color-accent-purple)', width: '48px', height: '48px' }}>
                    <i className="bi bi-geo-alt-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Global Headquarters</h6>
                    <p className="text-secondary small mb-0">
                      100 Tech Square Avenue, Suite 400<br />
                      Cambridge, MA 02139, United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-top border-secondary border-opacity-25">
                <h6 className="fw-bold text-uppercase text-secondary small mb-3" style={{ letterSpacing: '0.05em' }}>
                  Frequently Visited
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/faq" className="btn btn-sm btn-outline-light rounded-pill px-3">Help & FAQs</Link>
                  <Link to="/orders" className="btn btn-sm btn-outline-light rounded-pill px-3">Track Orders</Link>
                  <Link to="/returns" className="btn btn-sm btn-outline-light rounded-pill px-3">Returns Policy</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100 bg-white">
              <h3 className="fw-bold mb-2">Send Us a Message</h3>
              <p className="text-secondary small mb-4">
                Fill in the details below and a customer service representative will respond within 24 hours.
              </p>

              {submitted ? (
                <div className="text-center py-5">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-3"
                       style={{ width: '64px', height: '64px', background: 'var(--bs-success)' }}>
                    <i className="bi bi-check-lg fs-2"></i>
                  </div>
                  <h4 className="fw-bold mb-2">Message Sent Successfully!</h4>
                  <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                    Thank you for reaching out. A confirmation ticket has been dispatched to your email address.
                  </p>
                  <button
                    className="btn btn-shopera-primary rounded-pill px-4"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-navy">Your Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-navy">Email Address *</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-navy">Subject Topic</label>
                      <select
                        className="form-select rounded-3"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      >
                        <option value="order_inquiry">Order Status & Tracking</option>
                        <option value="product_question">Product Specifications</option>
                        <option value="returns_refunds">Returns & Exchanges</option>
                        <option value="technical_support">Technical Support</option>
                        <option value="partnership">Business & Merchant Inquiries</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-navy">Order Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="ORD-202610-12345"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-navy">Your Message *</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="5"
                        placeholder="Please describe how we can assist you in detail..."
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-shopera-primary rounded-pill px-5 py-2 fw-bold w-100 w-md-auto"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            Submit Inquiry <i className="bi bi-send-fill ms-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
