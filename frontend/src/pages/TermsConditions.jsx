import React from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="terms-page py-5">
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Terms & Conditions</li>
          </ol>
        </nav>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2 align-self-start" style={{ background: 'rgba(20,33,61,0.1)', color: 'var(--color-navy)' }}>
            USER AGREEMENT
          </span>
          <h1 className="fw-black mb-4">SHOPERA Terms and Conditions</h1>
          <p className="text-secondary mb-4">Last Updated: October 2026</p>

          <div className="d-flex flex-column gap-4 text-secondary" style={{ lineHeight: 1.75 }}>
            <section>
              <h4 className="fw-bold text-navy mb-2">1. Acceptance of Marketplace Terms</h4>
              <p>
                By accessing, browsing, registering an account, or interacting with the SHOPERA marketplace ("the Platform"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any provision, please discontinue your use of the website.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">2. Demonstration & Portfolio Scope</h4>
              <p>
                SHOPERA is developed by <strong>Mahenoor Shaikh</strong> as a professional full-stack developer portfolio application. All transactions, payments, delivery milestones, and order confirmations are fully functional simulated software workflows designed to demonstrate production architectural competencies without charging actual credit cards.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">3. User Account Responsibilities</h4>
              <p>
                When creating an account on SHOPERA, you are responsible for maintaining the confidentiality of your login credentials and for restricting access to your personal devices. You agree to provide true, accurate, and current information during registration.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">4. Product Catalogue & Pricing Accuracy</h4>
              <p>
                While we strive to provide realistic technical specifications, photography, and accurate pricing across all 12 categories and 120+ products, we reserve the right to correct any clerical errors or adjust stock availability through our real-time database administrative controls.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">5. Intellectual Property</h4>
              <p>
                The SHOPERA logo wordmark, custom UI components, responsive layout implementations, database schemas, and application source code are the intellectual property of <strong>Mahenoor Shaikh</strong>. All third-party brand trademarks and product names (e.g. Apple, Sony, Bose, Nike) belong to their respective trademark holders.
              </p>
            </section>
          </div>

          <div className="mt-5 pt-4 border-top">
            <Link to="/" className="btn btn-shopera-primary rounded-pill px-4">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
