import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { productsAPI, categoriesAPI, adminAPI } from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const initialForm = {
    title: '',
    category_id: '',
    brand: '',
    sku: '',
    price: '',
    discount_price: '',
    stock_quantity: 10,
    short_description: '',
    description: '',
    image_url: '',
    specifications: '',
    is_featured: false,
    is_active: true
  };
  const [formData, setFormData] = useState(initialForm);

  // Load products & categories
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        productsAPI.getProducts({ q: search, category: categoryFilter, limit: 100 }),
        categoriesAPI.getCategories()
      ]);

      if (prodsRes.data.success) {
        setProducts(prodsRes.data.products);
      }
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...initialForm,
      category_id: categories[0]?.id || ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      title: p.title,
      category_id: p.category_id,
      brand: p.brand || '',
      sku: p.sku,
      price: p.price,
      discount_price: p.discount_price || '',
      stock_quantity: p.stock_quantity,
      short_description: p.short_description || '',
      description: p.description || '',
      image_url: p.image_url,
      specifications: typeof p.specifications === 'object' ? JSON.stringify(p.specifications, null, 2) : (p.specifications || ''),
      is_featured: p.is_featured === 1,
      is_active: p.is_active === 1
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    let specsParsed = {};
    if (formData.specifications && formData.specifications.trim()) {
      try {
        specsParsed = JSON.parse(formData.specifications);
      } catch (err) {
        // Fallback: parse key-value lines
        const lines = formData.specifications.split('\n');
        lines.forEach(l => {
          const parts = l.split(':');
          if (parts.length >= 2) {
            specsParsed[parts[0].trim()] = parts.slice(1).join(':').trim();
          }
        });
      }
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock_quantity: parseInt(formData.stock_quantity, 10),
      specifications: specsParsed
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await adminAPI.updateProduct(editingId, payload);
      } else {
        await adminAPI.createProduct(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await adminAPI.deleteProduct(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Marketplace Product Catalog</h1>
            <p className="text-muted small mb-0">Add, edit, adjust inventory, and manage storefront visibility</p>
          </div>
          <button className="btn btn-shopera-primary rounded-pill px-4" onClick={handleOpenAdd}>
            <i className="bi bi-plus-lg me-2"></i>Add Product
          </button>
        </div>

        {/* Filter & Search Bar */}
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
                  placeholder="Search by title, SKU, or specs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 text-md-end text-muted small">
              <strong>{products.length}</strong> items shown
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Product</th>
                  <th>Department</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      <span>Loading products...</span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No products match your search.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLow = p.stock_quantity > 0 && p.stock_quantity <= 15;
                    const isOut = p.stock_quantity <= 0;

                    return (
                      <tr key={p.id}>
                        {/* Title & Image */}
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="rounded-3 border"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong className="text-dark d-block small line-clamp-1" style={{ maxWidth: '240px' }}>
                                {p.title}
                              </strong>
                              <div className="d-flex gap-1 align-items-center mt-1">
                                {p.brand && (
                                  <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.65rem' }}>
                                    {p.brand}
                                  </span>
                                )}
                                {p.is_featured === 1 && (
                                  <span className="badge bg-primary-subtle text-primary small" style={{ fontSize: '0.65rem' }}>
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="small text-secondary">{p.category_name}</td>

                        {/* SKU */}
                        <td className="small text-muted font-monospace">{p.sku}</td>

                        {/* Price */}
                        <td>
                          <span className="fw-bold text-dark small">${Number(p.price).toFixed(2)}</span>
                          {p.discount_price && Number(p.discount_price) > 0 && (
                            <small className="text-danger d-block">
                              Sale: ${Number(p.discount_price).toFixed(2)}
                            </small>
                          )}
                        </td>

                        {/* Stock Quantity */}
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              isOut
                                ? 'bg-danger-subtle text-danger'
                                : isLow
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-success-subtle text-success'
                            }`}
                          >
                            {p.stock_quantity} units
                          </span>
                        </td>

                        {/* Active Visibility */}
                        <td>
                          <span className={`badge rounded-pill ${p.is_active === 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {p.is_active === 1 ? 'Live' : 'Hidden'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="pe-4 text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-circle"
                              title="Edit Product"
                              onClick={() => handleOpenEdit(p)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              title="Delete Product"
                              onClick={() => handleDelete(p.id, p.title)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content rounded-4 border-0 p-3">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    {isEditing ? 'Edit Marketplace Product' : 'Add New Marketplace Product'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {modalError && (
                      <div className="alert alert-danger py-2 small rounded-3 mb-3">{modalError}</div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold">Product Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Sony WH-1000XM5"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">Brand / Manufacturer</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Sony, Apple, Nike"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Department / Category *</label>
                        <select
                          className="form-select"
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          required
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">SKU / Model Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. SHO-102948"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Standard Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="3499.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Discount Sale Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="Leave empty if regular"
                          value={formData.discount_price}
                          onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Stock Inventory Count *</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">Primary Image URL *</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://images.unsplash.com/..."
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Short Subtitle / Tagline</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="One line summary for search cards"
                          value={formData.short_description}
                          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Full Description & Technical Architecture</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Hardware Specifications (JSON or "Key: Value")</label>
                        <textarea
                          className="form-control font-monospace small"
                          rows="3"
                          placeholder='{"Processor": "M3 Max", "RAM": "36GB"}'
                          value={formData.specifications}
                          onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="adminFeaturedCheck"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          />
                          <label className="form-check-label small" htmlFor="adminFeaturedCheck">
                            Feature on Storefront Homepage
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="adminActiveCheck"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          />
                          <label className="form-check-label small" htmlFor="adminActiveCheck">
                            Product Live & Visible to Customers
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-shopera-primary rounded-pill px-4" disabled={submitting}>
                      {submitting ? 'Saving Product...' : isEditing ? 'Update Product' : 'Create Product'}
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

export default AdminProducts;
