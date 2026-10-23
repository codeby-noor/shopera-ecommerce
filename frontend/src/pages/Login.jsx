import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShoperaLogo from '../components/common/ShoperaLogo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@shopera.com');
      setPassword('Admin@123');
    } else {
      setEmail('john@example.com');
      setPassword('Customer@123');
    }
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-xl rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="mb-3 d-flex justify-content-center">
            <ShoperaLogo size="lg" withTagline={true} />
          </div>
          <h2 className="fw-bold mb-1">Welcome Back</h2>
          <p className="text-muted small">Sign in to your customer account or administrator portal</p>
        </div>

        {/* Recruiter / Portfolio Demo Auto-fill Helper */}
        <div className="bg-light p-3 rounded-4 border mb-4">
          <small className="fw-bold text-muted text-uppercase d-block mb-2 text-center" style={{ fontSize: '0.72rem' }}>
            ⚡ Instant Recruiter / Portfolio Demo Login
          </small>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill flex-grow-1 fw-semibold"
              onClick={() => handleFillDemo('customer')}
            >
              Demo Customer
            </button>
            <button
              type="button"
              className="btn btn-outline-dark btn-sm rounded-pill flex-grow-1 fw-semibold"
              onClick={() => handleFillDemo('admin')}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold mb-0">Password</label>
              <Link to="/forgot-password" className="small text-primary text-decoration-none">
                Forgot Password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-key"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
              Demo: <code>Admin@123</code> / <code>Customer@123</code>
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-shopera-primary btn-lg w-100 rounded-pill py-3 fw-bold mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <p className="text-center text-muted small mb-0">
            Don't have an account yet?{' '}
            <Link to="/register" className="fw-semibold text-primary text-decoration-none">
              Create an Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
