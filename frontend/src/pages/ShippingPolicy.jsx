import React from 'react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy-page py-5">
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Shipping Policy</li>
          </ol>
        </nav>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2 align-self-start" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)' }}>
            DISPATCH & DELIVERY
          </span>
          <h1 className="fw-black mb-4">SHOPERA Shipping & Delivery Policy</h1>
          <p className="text-secondary mb-4">Last Updated: October 2026</p>

          <div className="d-flex flex-column gap-4 text-secondary" style={{ lineHeight: 1.75 }}>
            <section>
              <h4 className="fw-bold text-navy mb-2">1. Free Express Shipping Threshold</h4>
              <p>
                SHOPERA provides <strong>Free Express Shipping</strong> across all eligible orders whose merchandise subtotal equals or exceeds <strong>$500.00 USD</strong>. For all orders below $500.00 USD, a flat rate express carrier shipping fee of <strong>$15.00 USD</strong> is applied during checkout.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">2. Processing & Fulfillment Timelines</h4>
              <p>
                All orders placed Monday through Friday prior to 2:00 PM EST are packaged and dispatched from our fulfillment hubs on the same business day. Orders placed on weekends or national holidays will be handed over to priority logistics partners on the following business day.
              </p>
              <div className="table-responsive my-3">
                <table className="table table-bordered table-striped small">
                  <thead className="table-dark">
                    <tr>
                      <th>Shipping Tier</th>
                      <th>Delivery Window</th>
                      <th>Cost (Orders &ge; $500)</th>
                      <th>Cost (Orders &lt; $500)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold">Express Air Dispatch</td>
                      <td>2 &ndash; 3 Business Days</td>
                      <td className="text-success fw-bold">FREE</td>
                      <td>$15.00</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Priority Overnight</td>
                      <td>Next Business Day</td>
                      <td>$25.00</td>
                      <td>$35.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">3. Real-Time Tracking & Telemetry</h4>
              <p>
                Upon order processing, each customer is assigned a unique Order Number (e.g. <code>ORD-202610-84729</code>). You can monitor your shipment milestones anytime via the <Link to="/orders" className="text-primary fw-semibold">My Orders</Link> dashboard or directly using our <Link to="/track-order" className="text-primary fw-semibold">Track Order</Link> utility.
              </p>
            </section>

            <section>
              <h4 className="fw-bold text-navy mb-2">4. Damaged or Lost Shipments</h4>
              <p>
                All shipments are insured for full transit value. In the rare event that your package arrives damaged or does not arrive within the designated timeframe, please contact our support team at <a href="mailto:support@shopera.demo" className="text-primary">support@shopera.demo</a> within 48 hours for immediate replacement or expedited refund.
              </p>
            </section>
          </div>

          <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
            <Link to="/contact" className="btn btn-outline-secondary rounded-pill px-4">
              Need Help with a Shipment?
            </Link>
            <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
