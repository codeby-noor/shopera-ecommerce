import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const { formatOrderPrice } = useCurrency();

  useEffect(() => {
    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await ordersAPI.getOrder(orderNumber);
          if (res.data.success) {
            setOrder(res.data.order);
          }
        } catch (err) {
          console.error('Failed to load order confirmation:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderNumber]);

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary m-auto" role="status"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-question-circle text-muted fs-1 mb-3"></i>
          <h3 className="fw-bold">Order Details Unavailable</h3>
          <p className="text-muted">We could not load details for order #{orderNumber}.</p>
          <Link to="/orders" className="btn btn-shopera-primary">View Order History</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-xl rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '800px' }}>
        {/* Celebration Header */}
        <div className="text-center mb-5">
          <div
            className="p-3 bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '80px', height: '80px' }}
          >
            <i className="bi bi-check-lg display-4"></i>
          </div>
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">
            Payment & Inventory Verified
          </span>
          <h1 className="display-6 fw-bold text-dark">Thank You For Your Order!</h1>
          <p className="text-secondary fs-5">
            Your simulated order <strong>#{order.order_number}</strong> has been confirmed and placed into processing.
          </p>
        </div>

        {/* Info Grid */}
        <div className="row g-4 mb-4 p-4 bg-light rounded-4">
          <div className="col-sm-6 col-md-3">
            <small className="text-muted text-uppercase fw-semibold d-block">Order Number</small>
            <strong className="text-dark small">{order.order_number}</strong>
          </div>
          <div className="col-sm-6 col-md-3">
            <small className="text-muted text-uppercase fw-semibold d-block">Order Date</small>
            <strong className="text-dark small">{new Date(order.created_at || Date.now()).toLocaleDateString()}</strong>
          </div>
          <div className="col-sm-6 col-md-3">
            <small className="text-muted text-uppercase fw-semibold d-block">Status</small>
            <span className="badge bg-primary text-capitalize">{order.status || 'Processing'}</span>
          </div>
          <div className="col-sm-6 col-md-3">
            <small className="text-muted text-uppercase fw-semibold d-block">Payment Method</small>
            <strong className="text-dark small text-capitalize">{order.payment_method?.replace(/_/g, ' ')}</strong>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-4 p-4 border rounded-4">
          <h6 className="fw-bold text-dark mb-2">
            <i className="bi bi-geo-alt-fill text-primary me-2"></i>Shipping Destination
          </h6>
          <p className="mb-0 text-secondary">
            <strong className="text-dark">{order.shipping_name}</strong><br />
            {order.shipping_street}<br />
            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}, {order.shipping_country}<br />
            {order.shipping_phone && <span className="small text-muted">Phone: {order.shipping_phone}</span>}
          </p>
        </div>

        {/* Order Items Table */}
        <div className="mb-4">
          <h6 className="fw-bold text-dark mb-3">Items Summary</h6>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Product</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            className="rounded-2 border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        )}
                        <span className="fw-semibold text-dark small">{item.product_title}</span>
                      </div>
                    </td>
                    <td className="text-center small">{item.quantity}</td>
                    <td className="text-end small">{formatOrderPrice(item.unit_price, order.currency || 'USD')}</td>
                    <td className="text-end fw-bold text-dark small">{formatOrderPrice(item.total_price, order.currency || 'USD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Financials Breakdown */}
        <div className="p-4 bg-light rounded-4 mb-5">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Subtotal</span>
            <span className="fw-semibold">{formatOrderPrice(order.subtotal, order.currency || 'USD')}</span>
          </div>
          {order.discount_amount && Number(order.discount_amount) > 0 && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-tag-fill"></i>
                <span>Coupon ({order.coupon_code || 'Promo'})</span>
              </span>
              <span className="fw-bold">-{formatOrderPrice(order.discount_amount, order.currency || 'USD')}</span>
            </div>
          )}
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Estimated Tax (8%)</span>
            <span className="fw-semibold">{formatOrderPrice(order.tax_amount, order.currency || 'USD')}</span>
          </div>
          <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
            <span className="text-muted">
              {order.shipping_tier === 'express' ? 'Express Priority (1–2 business days)' : 'Standard Ground (3–5 business days)'}
            </span>
            <span className="fw-semibold text-success">
              {Number(order.shipping_cost) === 0 ? 'FREE' : formatOrderPrice(order.shipping_cost, order.currency || 'USD')}
            </span>
          </div>
          {order.shipping_info?.estimate_label && (
            <div className="alert alert-info py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2 border-0 bg-info-subtle text-info-emphasis">
              <i className="bi bi-truck fs-5 text-primary"></i>
              <div>
                <strong>{order.shipping_info.estimate_label}</strong>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.shipping_info.estimate_disclaimer}</div>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-baseline">
            <div>
              <span className="h5 fw-bold text-dark mb-0 d-block">Total Paid</span>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Settled in base currency ({order.currency || 'USD'}). Unaffected by display currency switcher.
              </small>
            </div>
            <span className="h3 fw-bold text-primary mb-0">{formatOrderPrice(order.total_amount, order.currency || 'USD')}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <Link to="/orders" className="btn btn-shopera-primary rounded-pill px-4 py-2">
            <i className="bi bi-clock-history me-2"></i>View in Order History
          </Link>
          <Link to="/products" className="btn btn-shopera-outline rounded-pill px-4 py-2">
            <i className="bi bi-arrow-left me-2"></i>Continue Shopping
          </Link>
          <button
            type="button"
            className="btn btn-light border rounded-pill px-4 py-2 text-secondary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
