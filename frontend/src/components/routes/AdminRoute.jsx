import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="display-1 text-danger mb-3">
            <i className="bi bi-shield-x"></i>
          </div>
          <h2 className="fw-bold">Access Restricted</h2>
          <p className="text-muted">
            You need administrator privileges to access this control center.
          </p>
          <div>
            <Link to="/" className="btn btn-shopera-primary rounded-pill px-4">Return to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
