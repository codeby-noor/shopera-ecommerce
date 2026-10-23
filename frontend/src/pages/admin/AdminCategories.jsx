import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoriesAPI, adminAPI } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '', image_url: '', is_active: true });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormData({
      name: c.name,
      description: c.description || '',
      image_url: c.image_url || '',
      is_active: c.is_active === 1
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      setSubmitting(true);
      if (isEditing) {
        await adminAPI.updateCategory(editingId, formData);
      } else {
        await adminAPI.createCategory(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete "${name}" because it contains ${count} active products. Please delete or reassign products first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await adminAPI.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold mb-1">Product Categories & Departments</h1>
            <p className="text-muted small mb-0">Organize electronics, lifestyle, computing, audio, and studio gear</p>
          </div>
          <button className="btn btn-shopera-primary rounded-pill px-4" onClick={handleOpenAdd}>
            <i className="bi bi-plus-lg me-2"></i>New Category
          </button>
        </div>

        {/* Categories Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Department</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Models Count</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      <span>Loading categories...</span>
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="rounded-3 border"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                          )}
                          <strong className="text-dark small">{c.name}</strong>
                        </div>
                      </td>
                      <td className="small text-muted font-monospace">{c.slug}</td>
                      <td className="small text-secondary line-clamp-1" style={{ maxWidth: '300px' }}>
                        {c.description}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border rounded-pill">
                          {c.product_count || 0} products
                        </span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${c.is_active === 1 ? 'bg-success' : 'bg-secondary'}`}>
                          {c.is_active === 1 ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Category"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            onClick={() => handleDelete(c.id, c.name, c.product_count)}
                            title="Delete Category"
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 p-3">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    {isEditing ? 'Edit Category' : 'Add New Category'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {modalError && (
                      <div className="alert alert-danger py-2 small rounded-3 mb-3">{modalError}</div>
                    )}
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Department Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Smart Wearables"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Banner Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Department summary..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="catActiveCheck"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <label className="form-check-label small" htmlFor="catActiveCheck">
                        Category Active on Storefront
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-shopera-primary rounded-pill px-4" disabled={submitting}>
                      {submitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
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

export default AdminCategories;
