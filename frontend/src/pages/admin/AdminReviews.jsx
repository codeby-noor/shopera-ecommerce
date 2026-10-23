import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { adminAPI } from '../../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllReviews();
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId, productTitle) => {
    if (!window.confirm(`Are you sure you want to remove this review for "${productTitle}"? This will recalculate the product's average rating.`)) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      const res = await adminAPI.deleteReview(reviewId);
      if (res.data.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setActionMessage({
          type: 'success',
          text: `Review #${reviewId} successfully deleted. Product rating has been recalculated.`
        });
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to delete review.'
      });
    } finally {
      setDeleteLoading(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.product_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (verifiedFilter === 'verified') return r.is_verified_purchase === 1;
    if (verifiedFilter === 'unverified') return r.is_verified_purchase !== 1;
    return true;
  });

  const totalReviews = reviews.length;
  const verifiedCount = reviews.filter(r => r.is_verified_purchase === 1).length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Customer Reviews Moderation</h1>
            <p className="text-muted small mb-0">
              Audit verified purchases, moderate customer feedback, and preserve marketplace integrity
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill"
            onClick={fetchReviews}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
            Refresh Reviews
          </button>
        </div>

        {/* Metrics Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary-subtle text-primary rounded-3">
                  <i className="bi bi-chat-square-quote fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block fw-semibold">Total Reviews</small>
                  <strong className="fs-4 text-dark">{totalReviews}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-success-subtle text-success rounded-3">
                  <i className="bi bi-patch-check-fill fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block fw-semibold">Verified Purchases</small>
                  <strong className="fs-4 text-dark">{verifiedCount} ({totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0}%)</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-warning-subtle text-warning rounded-3">
                  <i className="bi bi-star-fill fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block fw-semibold">Average Store Rating</small>
                  <strong className="fs-4 text-dark">{avgRating} / 5.0</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Alert */}
        {actionMessage && (
          <div className={`alert alert-${actionMessage.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
            <i className={`bi ${actionMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {actionMessage.text}
            <button type="button" className="btn-close" onClick={() => setActionMessage(null)}></button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by customer, email, product, or review text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-5">
              <div className="d-flex gap-2">
                <select
                  className="form-select bg-light"
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                >
                  <option value="all">All Buyer Types</option>
                  <option value="verified">Verified Purchases Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted small mt-2">Loading marketplace reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text text-muted fs-1 mb-2"></i>
              <h5 className="fw-bold">No Reviews Found</h5>
              <p className="text-muted small">
                {searchTerm || verifiedFilter !== 'all' ? 'Try adjusting your search filters.' : 'No customer reviews submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating & Review</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((rev) => (
                    <tr key={rev.id}>
                      <td style={{ minWidth: '220px' }}>
                        <div className="d-flex align-items-center gap-2">
                          {rev.product_image && (
                            <img
                              src={rev.product_image}
                              alt={rev.product_title}
                              className="rounded-2 border"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <Link
                              to={`/products/${rev.product_id}`}
                              target="_blank"
                              className="fw-bold text-dark text-decoration-none small d-block text-truncate"
                              style={{ maxWidth: '180px' }}
                              title={rev.product_title}
                            >
                              {rev.product_title}
                            </Link>
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                              ID #{rev.product_id}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td style={{ minWidth: '160px' }}>
                        <strong className="d-block small text-dark">{rev.user_name}</strong>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '160px' }}>
                          {rev.user_email}
                        </small>
                      </td>

                      <td style={{ maxWidth: '340px' }}>
                        <div className="d-flex align-items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i
                              key={s}
                              className={`bi bi-star-fill ${s <= rev.rating ? 'text-warning' : 'text-secondary opacity-25'}`}
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                          ))}
                          <span className="small fw-bold text-dark ms-1">{rev.rating}/5</span>
                        </div>
                        {rev.title && <strong className="d-block small text-dark mb-1">{rev.title}</strong>}
                        <p className="small text-muted mb-0 text-truncate" style={{ maxWidth: '320px' }} title={rev.comment}>
                          {rev.comment}
                        </p>
                      </td>

                      <td>
                        {rev.is_verified_purchase === 1 ? (
                          <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                            <i className="bi bi-patch-check-fill me-1"></i>Verified Buyer
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 small">
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="small text-muted text-nowrap">
                        {new Date(rev.created_at || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => handleDeleteReview(rev.id, rev.product_title)}
                          disabled={deleteLoading === rev.id}
                          title="Remove review"
                        >
                          {deleteLoading === rev.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <>
                              <i className="bi bi-trash3 me-1"></i>Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReviews;
