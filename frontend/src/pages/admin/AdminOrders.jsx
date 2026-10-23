import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import { adminAPI } from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllOrders({
        search,
        status: statusFilter,
        page: pagination.page,
        limit: 15
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        // Update local state
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold mb-1">Customer Fulfillment & Orders</h1>
            <p className="text-muted small mb-0">Monitor simulated checkouts, package shipping, and customer records</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by order number, customer name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2 text-md-end text-muted small">
              <strong>{pagination.total}</strong> orders total
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Change Status</th>
                  <th className="pe-4 text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      <span>Loading orders...</span>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No customer orders found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id}>
                      {/* Order Number */}
                      <td className="ps-4 py-3">
                        <strong className="text-dark small font-monospace">{ord.order_number}</strong>
                      </td>

                      {/* Customer */}
                      <td>
                        <strong className="text-dark small d-block">{ord.shipping_name || ord.customer_name}</strong>
                        <small className="text-muted">{ord.customer_email}</small>
                      </td>

                      {/* Items */}
                      <td>
                        <span className="badge bg-light text-secondary border rounded-pill">
                          {ord.items?.length || 1} model(s)
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <strong className="text-primary small">${Number(ord.total_amount).toFixed(2)} <span className="text-muted" style={{ fontSize: '0.75rem' }}>{ord.currency || 'USD'}</span></strong>
                      </td>

                      {/* Date */}
                      <td className="small text-muted">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>

                      {/* Status Badge */}
                      <td>
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      {/* Status Change Dropdown */}
                      <td>
                        <select
                          className="form-select form-select-sm rounded-pill text-capitalize"
                          style={{ width: '130px' }}
                          value={ord.status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Details View */}
                      <td className="pe-4 text-end">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => setSelectedOrder(ord)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Inspect Modal */}
        {selectedOrder && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 p-3">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    Order Details: <span className="font-monospace text-primary">#{selectedOrder.order_number}</span>
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-4">
                        <small className="text-muted fw-bold text-uppercase d-block mb-1">Customer & Delivery</small>
                        <strong className="text-dark d-block">{selectedOrder.shipping_name}</strong>
                        <small className="text-muted d-block">{selectedOrder.customer_email}</small>
                        <small className="text-muted d-block">{selectedOrder.shipping_phone}</small>
                        <small className="text-secondary d-block mt-2">
                          {selectedOrder.shipping_street}<br />
                          {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}<br />
                          {selectedOrder.shipping_country}
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-4">
                        <small className="text-muted fw-bold text-uppercase d-block mb-1">Payment & Logistics</small>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Status:</small>
                          <OrderStatusBadge status={selectedOrder.status} />
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Method:</small>
                          <small className="fw-semibold text-dark text-capitalize">{selectedOrder.payment_method?.replace(/_/g, ' ')}</small>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Subtotal:</small>
                          <small className="fw-semibold text-dark">${Number(selectedOrder.subtotal).toFixed(2)}</small>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Tax (8%):</small>
                          <small className="fw-semibold text-dark">${Number(selectedOrder.tax_amount).toFixed(2)}</small>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <small className="text-muted">Shipping:</small>
                          <small className="fw-semibold text-success">${Number(selectedOrder.shipping_cost).toFixed(2)}</small>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2">
                          <strong className="text-dark">Total:</strong>
                          <strong className="text-primary fs-5">${Number(selectedOrder.total_amount).toFixed(2)} <span className="fs-6 text-muted">({selectedOrder.currency || 'USD'})</span></strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">Purchased Items</h6>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light small">
                        <tr>
                          <th>Hardware</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-end">Unit Price</th>
                          <th className="text-end">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_title}
                                    className="rounded border"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                )}
                                <span className="small fw-semibold text-dark">{item.product_title}</span>
                              </div>
                            </td>
                            <td className="text-center small">{item.quantity}</td>
                            <td className="text-end small">${Number(item.unit_price).toFixed(2)}</td>
                            <td className="text-end fw-bold text-dark small">${Number(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
