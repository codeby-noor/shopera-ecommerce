import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import OrderStatusBadge from '../components/admin/OrderStatusBadge';
import { useCurrency } from '../context/CurrencyContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');
  const { formatOrderPrice } = useCurrency();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;

    try {
      setCancellingId(orderId);
      const res = await ordersAPI.cancelOrder(orderId);
      if (res.data.success) {
        setMessage('Order cancelled successfully.');
        await fetchOrders();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary m-auto" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bold mb-1">My Orders</h1>
        <p className="text-muted small mb-0">Track and manage your marketplace deliveries</p>
      </div>

      {message && (
        <div className="alert alert-success rounded-4 shadow-sm mb-4">
          <i className="bi bi-check-circle me-2"></i>{message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
          <i className="bi bi-box-seam text-muted fs-1 mb-3"></i>
          <h4 className="fw-bold">No Orders Placed Yet</h4>
          <p className="text-muted">You haven't placed any orders on SHOPERA yet.</p>
          <div>
            <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4">
              Explore Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => {
            const canCancel = ['pending', 'processing'].includes(order.status?.toLowerCase());

            return (
              <div key={order.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {/* Header Strip */}
                <div className="card-header bg-light py-3 px-4 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex flex-wrap gap-4 align-items-center">
                    <div>
                      <small className="text-muted text-uppercase fw-semibold d-block">Order #</small>
                      <strong className="text-dark">{order.order_number}</strong>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold d-block">Date Placed</small>
                      <span className="text-secondary small">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold d-block">Total Settled</small>
                      <span className="fw-bold text-primary">{formatOrderPrice(order.total_amount, order.currency || 'USD')}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    {canCancel && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Body */}
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-lg-8">
                      <div className="d-flex flex-column gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-3">
                            <img
                              src={item.product_image}
                              alt={item.product_title}
                              className="rounded-3 border"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold text-dark">{item.product_title}</h6>
                              <small className="text-muted">
                                Qty: {item.quantity} &bull; {formatOrderPrice(item.unit_price, order.currency || 'USD')} each
                              </small>
                            </div>
                            <span className="fw-bold text-dark">
                              {formatOrderPrice(item.total_price, order.currency || 'USD')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-lg-4 border-start-lg ps-lg-4">
                      <small className="text-muted text-uppercase fw-semibold d-block mb-1">Delivering To</small>
                      <p className="small text-secondary mb-3">
                        <strong className="text-dark">{order.shipping_name}</strong><br />
                        {order.shipping_street}<br />
                        {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                      </p>

                      <div className="d-flex flex-column gap-2">
                        <Link
                          to={`/order-confirmation/${order.order_number}`}
                          className="btn btn-sm btn-outline-primary rounded-pill w-100"
                        >
                          <i className="bi bi-receipt me-1"></i>View Order Receipt
                        </Link>
                        <Link
                          to={`/track-order?orderNumber=${order.order_number}`}
                          className="btn btn-sm btn-shopera-primary rounded-pill w-100"
                        >
                          <i className="bi bi-geo-alt-fill me-1"></i>Track Package
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
