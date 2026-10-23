import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Title & Action Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Executive Dashboard</h1>
            <p className="text-muted small mb-0">Live commerce metrics, telemetry, and fulfillment operations</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/admin/reviews" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center">
              <i className="bi bi-chat-square-quote me-1"></i>Moderate Reviews
            </Link>
            <Link to="/admin/products" className="btn btn-shopera-primary btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center">
              <i className="bi bi-plus-lg me-1"></i>New Product
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="row g-4 mb-4">
              <div className="col-xl-3 col-sm-6">
                <StatCard
                  title="Total Revenue"
                  value={`$${(stats?.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  icon="bi-currency-dollar"
                  iconBg="bg-success-subtle text-success"
                  subtitle="Completed & active sales"
                />
              </div>
              <div className="col-xl-3 col-sm-6">
                <StatCard
                  title="Total Orders"
                  value={stats?.totalOrders || 0}
                  icon="bi-receipt"
                  iconBg="bg-primary-subtle text-primary"
                  subtitle="Lifetime transactions"
                />
              </div>
              <div className="col-xl-3 col-sm-6">
                <StatCard
                  title="Registered Customers"
                  value={stats?.totalCustomers || 0}
                  icon="bi-people"
                  iconBg="bg-info-subtle text-info"
                  subtitle="Verified user profiles"
                />
              </div>
              <div className="col-xl-3 col-sm-6">
                <StatCard
                  title="Marketplace Catalogue"
                  value={stats?.totalProducts || 0}
                  icon="bi-box-seam"
                  iconBg="bg-warning-subtle text-warning"
                  subtitle={`${stats?.lowStockCount || 0} low stock alert(s)`}
                />
              </div>
            </div>

            {/* Low Stock Warning Alert if any */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-3 p-md-4">
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-exclamation-triangle-fill fs-3 text-warning flex-shrink-0 mt-1"></i>
                  <div>
                    <strong className="d-block text-dark fw-bold mb-1">
                      Inventory Alert: {stats.lowStockProducts.length} product(s) have 15 or fewer units remaining.
                    </strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {stats.lowStockProducts.map((p, idx) => (
                        <span key={p.id || idx} className="badge bg-white text-dark border shadow-xs py-1 px-2 fw-normal d-inline-flex align-items-center gap-1">
                          <span className="fw-semibold">{p.title}</span>
                          <span className="text-danger fw-bold">({p.stock_quantity} left)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link to="/admin/products" className="btn btn-warning btn-sm rounded-pill fw-semibold text-nowrap px-3 py-2 flex-shrink-0 align-self-start align-self-md-center">
                  Manage Inventory
                </Link>
              </div>
            )}

            {/* Sales By Department & Status Breakdown */}
            <div className="row g-4 mb-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3">Revenue by Marketplace Department</h5>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th>Department</th>
                          <th className="text-center">Units Sold</th>
                          <th className="text-end">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.categorySales && stats.categorySales.length > 0 ? (
                          stats.categorySales.map((cat, idx) => (
                            <tr key={idx}>
                              <td className="fw-bold text-dark small">{cat.category_name}</td>
                              <td className="text-center small">{cat.units_sold}</td>
                              <td className="text-end fw-bold text-primary small">
                                ${Number(cat.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted small py-3">
                              No category sales registered yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3">Order Status Distribution</h5>
                  <div className="d-flex flex-column gap-3">
                    {stats?.statusBreakdown && stats.statusBreakdown.length > 0 ? (
                      stats.statusBreakdown.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light">
                          <OrderStatusBadge status={item.status} />
                          <span className="fw-bold text-dark fs-6">{item.count} orders</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small">No order breakdown data.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Recent Orders</h5>
                <Link to="/admin/orders" className="text-primary small fw-semibold text-decoration-none">
                  View All Orders <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Order #</th>
                      <th>Recipient</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <strong className="text-dark small">{ord.order_number}</strong>
                        </td>
                        <td>
                          <span className="small text-dark d-block fw-semibold">{ord.shipping_name}</span>
                          <small className="text-muted">{ord.customer_email}</small>
                        </td>
                        <td className="fw-bold text-dark small">
                          ${Number(ord.total_amount).toFixed(2)}
                        </td>
                        <td>
                          <OrderStatusBadge status={ord.status} />
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success small text-capitalize">
                            {ord.payment_status}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
