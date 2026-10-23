import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || searchParams.get('orderNumber') || '';
  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const fetchTracking = async (query) => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      let res;
      try {
        res = await ordersAPI.trackOrder(q);
      } catch (trackErr) {
        res = await ordersAPI.getOrder(q);
      }
      if (res.data && res.data.order) {
        setOrder(res.data.order);
      } else {
        setError('No order found matching the entered reference.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to locate order. Please check your order reference number.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const param = searchParams.get('order') || searchParams.get('orderNumber');
    if (param && param.trim()) {
      setOrderQuery(param.trim());
      fetchTracking(param.trim());
    }
  }, [searchParams]);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    fetchTracking(orderQuery);
  };

  // Helper to determine status step
  const getStepStatus = (currentStatus) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const idx = steps.indexOf(currentStatus.toLowerCase());
    return idx >= 0 ? idx + 1 : 2;
  };

  return (
    <div className="track-order-page py-5">
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Track Order</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge rounded-pill px-3 py-2 fw-semibold mb-2" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)' }}>
            REAL-TIME LOGISTICS
          </span>
          <h1 className="fw-black display-5 mb-2">Track Your Shipment</h1>
          <p className="text-secondary mx-auto" style={{ maxWidth: '520px' }}>
            Enter your SHOPERA order number (e.g. <code>ORD-202610-84729</code>) below to view live dispatch milestones and delivery estimates.
          </p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="mx-auto mt-4" style={{ maxWidth: '540px' }}>
            <div className="input-group shadow-sm rounded-pill overflow-hidden border border-2 border-secondary border-opacity-25 bg-white p-1">
              <span className="input-group-text bg-transparent border-0 ps-3 text-secondary">
                <i className="bi bi-box-seam fs-5"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 bg-transparent px-2"
                placeholder="Enter order number (e.g. ORD-202610-...)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-shopera-primary rounded-pill px-4 fw-bold"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Track Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="alert alert-warning border-0 rounded-4 shadow-sm p-4 text-center mb-5">
            <i className="bi bi-exclamation-triangle-fill fs-3 text-warning mb-2 d-block"></i>
            <h5 className="fw-bold mb-1">Order Lookup Notice</h5>
            <p className="mb-3 small">{error}</p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/orders" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                View My Orders History
              </Link>
              <Link to="/contact" className="btn btn-sm btn-shopera-primary rounded-pill px-3">
                Contact Customer Support
              </Link>
            </div>
          </div>
        )}

        {/* Order Details & Timeline Card */}
        {order && (
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-5 animate-fade-in">
            <div className="d-flex flex-wrap justify-content-between align-items-center pb-4 mb-4 border-bottom gap-3">
              <div>
                <span className="badge bg-secondary bg-opacity-10 text-secondary text-uppercase fw-bold px-3 py-1 rounded-pill small mb-2 d-inline-block">
                  Verified Order
                </span>
                <h3 className="fw-bold mb-1 text-navy">{order.order_number}</h3>
                <small className="text-secondary">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </small>
              </div>
              <div className="text-md-end">
                <span className={`badge rounded-pill px-3 py-2 fw-bold text-uppercase fs-6 ${
                  order.status === 'delivered' ? 'bg-success' :
                  order.status === 'shipped' ? 'bg-info text-dark' :
                  order.status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                }`}>
                  {order.status}
                </span>
                <div className="text-secondary small mt-1">Payment Status: <strong className="text-success text-capitalize">{order.payment_status}</strong></div>
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="py-4 my-2">
              <h5 className="fw-bold text-navy mb-4">Fulfillment Progress</h5>
              <div className="d-flex justify-content-between position-relative px-2">
                {/* Connecting track line */}
                <div className="position-absolute top-50 start-0 w-100 translate-middle-y bg-light"
                     style={{ height: '4px', zIndex: 1 }}></div>
                <div className="position-absolute top-50 start-0 translate-middle-y"
                     style={{
                       height: '4px',
                       zIndex: 1,
                       width: getStepStatus(order.status) === 1 ? '15%' :
                              getStepStatus(order.status) === 2 ? '45%' :
                              getStepStatus(order.status) === 3 ? '75%' : '100%',
                       background: 'var(--color-primary)',
                       transition: 'width 0.4s ease'
                     }}></div>

                {/* Step 1: Placed */}
                <div className="text-center position-relative" style={{ zIndex: 2 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-white shadow-sm"
                       style={{ width: '40px', height: '40px', background: 'var(--color-primary)' }}>
                    <i className="bi bi-check-lg fs-5"></i>
                  </div>
                  <div className="fw-bold small text-navy">Order Placed</div>
                  <small className="text-secondary d-none d-sm-block">Confirmed</small>
                </div>

                {/* Step 2: Processing */}
                <div className="text-center position-relative" style={{ zIndex: 2 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-white shadow-sm"
                       style={{
                         width: '40px',
                         height: '40px',
                         background: getStepStatus(order.status) >= 2 ? 'var(--color-primary)' : '#e2e8f0',
                         color: getStepStatus(order.status) >= 2 ? '#fff' : '#64748b'
                       }}>
                    <i className="bi bi-gear-fill fs-6"></i>
                  </div>
                  <div className="fw-bold small text-navy">Processing</div>
                  <small className="text-secondary d-none d-sm-block">Packing Hub</small>
                </div>

                {/* Step 3: Shipped */}
                <div className="text-center position-relative" style={{ zIndex: 2 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-white shadow-sm"
                       style={{
                         width: '40px',
                         height: '40px',
                         background: getStepStatus(order.status) >= 3 ? 'var(--color-primary)' : '#e2e8f0',
                         color: getStepStatus(order.status) >= 3 ? '#fff' : '#64748b'
                       }}>
                    <i className="bi bi-truck fs-6"></i>
                  </div>
                  <div className="fw-bold small text-navy">In Transit</div>
                  <small className="text-secondary d-none d-sm-block">Carrier Dispatched</small>
                </div>

                {/* Step 4: Delivered */}
                <div className="text-center position-relative" style={{ zIndex: 2 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-white shadow-sm"
                       style={{
                         width: '40px',
                         height: '40px',
                         background: getStepStatus(order.status) >= 4 ? 'var(--bs-success)' : '#e2e8f0',
                         color: getStepStatus(order.status) >= 4 ? '#fff' : '#64748b'
                       }}>
                    <i className="bi bi-house-door-fill fs-6"></i>
                  </div>
                  <div className="fw-bold small text-navy">Delivered</div>
                  <small className="text-secondary d-none d-sm-block">Final Destination</small>
                </div>
              </div>
            </div>

            {/* Shipment Items */}
            <div className="pt-4 border-top mt-4">
              <h5 className="fw-bold text-navy mb-3">Order Items</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={item.product_title}
                        className="rounded-3 object-fit-cover"
                        style={{ width: '56px', height: '56px' }}
                      />
                      <div>
                        <div className="fw-bold text-navy">{item.product_title}</div>
                        <small className="text-secondary">Quantity: {item.quantity} &bull; Unit: ${parseFloat(item.unit_price).toFixed(2)}</small>
                      </div>
                    </div>
                    <div className="fw-bold text-navy text-end">
                      ${parseFloat(item.total_price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details & Summary */}
              <div className="row g-4 pt-3 border-top">
                <div className="col-md-6">
                  <h6 className="fw-bold text-navy mb-2">Shipping Destination</h6>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    <strong>{order.shipping_name}</strong><br />
                    {order.shipping_street}<br />
                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br />
                    {order.shipping_country}<br />
                    Phone: {order.shipping_phone}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-navy mb-2">Financial Breakdown</h6>
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Subtotal:</span>
                    <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="d-flex justify-content-between small text-success fw-semibold mb-1">
                      <span>Discount ({order.coupon_code}):</span>
                      <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Tax (8%):</span>
                    <span>${parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Shipping:</span>
                    <span>{order.shipping_cost === '0.00' || order.shipping_cost === 0 ? <span className="text-success fw-bold">FREE</span> : `$${parseFloat(order.shipping_cost).toFixed(2)}`}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold text-navy border-top pt-2 mt-2">
                    <span>Total Amount:</span>
                    <span className="fs-5 text-primary">${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
