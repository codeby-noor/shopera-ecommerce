import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { adminAPI } from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllCustomers({ search });
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold mb-1">Customer Profiles & CRM</h1>
            <p className="text-muted small mb-0">Registered accounts, purchase activity, and lifetime value</p>
          </div>
        </div>

        {/* Search */}
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
                  placeholder="Search by customer name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              <strong>{customers.length}</strong> registered customer(s)
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Customer</th>
                  <th>Contact Phone</th>
                  <th>Joined Date</th>
                  <th className="text-center">Orders Count</th>
                  <th className="pe-4 text-end">Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      <span>Loading customer profiles...</span>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No customer accounts found matching search.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={c.name}
                            className="rounded-circle border"
                            style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong className="text-dark small d-block">{c.name}</strong>
                            <small className="text-muted">{c.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="small text-secondary">{c.phone || 'N/A'}</td>
                      <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border rounded-pill">
                          {c.order_count} orders
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <strong className="text-primary small">
                          ${Number(c.total_spent).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
