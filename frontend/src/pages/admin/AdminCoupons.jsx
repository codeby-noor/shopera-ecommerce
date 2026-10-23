import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { adminAPI } from '../../services/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0.00',
    max_discount_amount: '',
    is_active: 1
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(res.data.coupons || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0.00',
      max_discount_amount: '',
      is_active: 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || '0.00',
      max_discount_amount: coupon.max_discount_amount || '',
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateCoupon(editingId, formData);
        setSuccessMsg(`Coupon "${formData.code}" updated successfully.`);
      } else {
        await adminAPI.createCoupon(formData);
        setSuccessMsg(`Coupon "${formData.code}" created successfully.`);
      }
      setShowModal(false);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(coupon.id);
      setSuccessMsg(`Coupon "${coupon.code}" deleted.`);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon.');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await adminAPI.updateCoupon(coupon.id, {
        ...coupon,
        is_active: coupon.is_active ? 0 : 1
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {/* Top Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom gap-3">
          <div>
            <h1 className="h3 fw-bold text-navy mb-1">Coupon Management</h1>
            <p className="text-secondary small mb-0">Create promotional discount codes and configure minimum spend rules.</p>
          </div>
          <div>
            <button
              className="btn btn-shopera-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              onClick={handleOpenCreate}
              style={{ minHeight: '42px' }}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Create New Coupon</span>
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {successMsg && (
          <div className="alert alert-success border-0 rounded-3 shadow-sm d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-danger border-0 rounded-3 shadow-sm d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Desktop / Tablet Coupons Table Card (>= 768px) */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 d-none d-md-block">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
                  <th className="ps-4" style={{ minWidth: '150px' }}>Code</th>
                  <th style={{ minWidth: '220px' }}>Description</th>
                  <th style={{ minWidth: '120px' }}>Discount</th>
                  <th style={{ minWidth: '120px' }}>Min. Order</th>
                  <th style={{ minWidth: '120px' }}>Max Limit</th>
                  <th style={{ minWidth: '130px' }}>Status</th>
                  <th className="text-end pe-4" style={{ minWidth: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                      Loading promotional coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      No promotional coupons found. Click "Create New Coupon" to add one.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4">
                        <span
                          className="badge font-monospace px-3 py-2 fs-6 rounded-pill shadow-xs"
                          style={{ backgroundColor: '#14213D', color: '#FFFFFF', letterSpacing: '0.05em' }}
                        >
                          {c.code}
                        </span>
                      </td>
                      <td className="small text-secondary" style={{ maxWidth: '280px', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.4 }}>
                        {c.description || '—'}
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-bold">
                          {c.discount_type === 'percentage'
                            ? `${parseFloat(c.discount_value)}% OFF`
                            : `$${parseFloat(c.discount_value).toFixed(2)} OFF`}
                        </span>
                      </td>
                      <td className="small fw-semibold text-secondary">${parseFloat(c.min_order_amount || 0).toFixed(2)}</td>
                      <td className="small text-secondary">{c.max_discount_amount ? `$${parseFloat(c.max_discount_amount).toFixed(2)}` : 'Unlimited'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0"
                          onClick={() => handleToggleStatus(c)}
                          title="Click to toggle status"
                          aria-label={`Coupon ${c.code} is ${c.is_active ? 'active' : 'inactive'}. Click to toggle.`}
                        >
                          {c.is_active ? (
                            <span
                              className="badge rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                              style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', fontSize: '0.78rem' }}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span
                              className="badge rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                              style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                            >
                              <i className="bi bi-pause-circle-fill"></i>
                              <span>Inactive</span>
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleOpenEdit(c)}
                            title={`Edit ${c.code}`}
                            aria-label={`Edit ${c.code}`}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(c)}
                            title={`Delete ${c.code}`}
                            aria-label={`Delete ${c.code}`}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Coupons Card Layout (< 768px) */}
        <div className="d-block d-md-none mb-4">
          {loading ? (
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <span className="spinner-border spinner-border-sm text-primary me-2"></span>
              Loading promotional coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white text-secondary">
              No promotional coupons found. Tap "Create New Coupon" to add one.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {coupons.map((c) => (
                <div key={c.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span
                      className="badge font-monospace px-3 py-2 fs-6 rounded-pill shadow-xs"
                      style={{ backgroundColor: '#14213D', color: '#FFFFFF', letterSpacing: '0.05em' }}
                    >
                      {c.code}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0"
                      onClick={() => handleToggleStatus(c)}
                      aria-label={`Toggle status for ${c.code}`}
                    >
                      {c.is_active ? (
                        <span
                          className="badge rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-check-circle-fill"></i>
                          <span>Active</span>
                        </span>
                      ) : (
                        <span
                          className="badge rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-pause-circle-fill"></i>
                          <span>Inactive</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-bold fs-7">
                      {c.discount_type === 'percentage'
                        ? `${parseFloat(c.discount_value)}% OFF`
                        : `$${parseFloat(c.discount_value).toFixed(2)} OFF`}
                    </span>
                  </div>

                  <p className="small text-secondary mb-3" style={{ lineHeight: 1.4 }}>
                    {c.description || 'No description provided.'}
                  </p>

                  <div className="d-flex justify-content-between small text-muted border-top pt-2 mb-3">
                    <div>
                      <span className="d-block" style={{ fontSize: '0.7rem' }}>MIN. ORDER</span>
                      <strong className="text-dark">${parseFloat(c.min_order_amount || 0).toFixed(2)}</strong>
                    </div>
                    <div className="text-end">
                      <span className="d-block" style={{ fontSize: '0.7rem' }}>MAX DISCOUNT</span>
                      <strong className="text-dark">{c.max_discount_amount ? `$${parseFloat(c.max_discount_amount).toFixed(2)}` : 'Unlimited'}</strong>
                    </div>
                  </div>

                  <div className="d-flex gap-2 border-top pt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2"
                      onClick={() => handleOpenEdit(c)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2"
                      onClick={() => handleDelete(c)}
                    >
                      <i className="bi bi-trash-fill"></i>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-navy">
                    {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-navy">Coupon Code *</label>
                      <input
                        type="text"
                        className="form-control font-monospace text-uppercase"
                        placeholder="e.g. SHOPERA10"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-navy">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 10% off storewide on orders over $50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-navy">Discount Type</label>
                        <select
                          className="form-select"
                          value={formData.discount_type}
                          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-navy">Discount Value *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-control"
                          placeholder={formData.discount_type === 'percentage' ? '10' : '20.00'}
                          required
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-navy">Min Order Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={formData.min_order_amount}
                          onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-navy">Max Discount Cap ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="Optional"
                          value={formData.max_discount_amount}
                          onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-check form-switch mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActiveCheck"
                        checked={Boolean(formData.is_active)}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="isActiveCheck">
                        Active for customer redemption
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-shopera-primary rounded-pill px-4 fw-bold">
                      {editingId ? 'Save Changes' : 'Create Coupon'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCoupons;
