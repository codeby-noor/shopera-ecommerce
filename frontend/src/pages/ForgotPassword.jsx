import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShoperaLogo from '../components/common/ShoperaLogo';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoToken, setDemoToken] = useState('');

  // Step 1: Request reset code
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (res.data.demoResetToken) {
          setDemoToken(res.data.demoResetToken);
          setToken(res.data.demoResetToken);
        }
        setStep(2);
      } else {
        setError(res.data.message || 'Unable to request password recovery.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request recovery. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token.trim()) {
      setError('Please enter your recovery token.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword({ token: token.trim(), newPassword });
      if (res.data.success) {
        setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(res.data.message || 'Password reset failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <div className="card border-0 shadow-xl rounded-4 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '480px' }}>
        {/* Logo & Header */}
        <div className="text-center mb-4">
          <div className="mb-3 d-flex justify-content-center">
            <ShoperaLogo size="lg" withTagline={true} />
          </div>
          <h2 className="fw-bold mb-1">
            {step === 1 ? 'Password Recovery' : 'Create New Password'}
          </h2>
          <p className="text-muted small">
            {step === 1
              ? 'Enter your account email to receive a secure recovery code'
              : 'Enter your recovery code and choose a new secure password'}
          </p>
        </div>

        {/* Demo Notice */}
        <div className="p-3 bg-primary-subtle border border-primary-subtle rounded-3 mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-shield-check text-primary fs-5"></i>
          <small className="text-dark">
            <strong>Portfolio Sandbox:</strong> Recovery tokens are securely verified and auto-populated for instant testing.
          </small>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small rounded-3 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success py-2 small rounded-3 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestToken}>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Registered Email Address *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <small className="text-muted mt-1 d-block">
                Tip: Try <code>john@example.com</code> or <code>admin@shopera.com</code>
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
                  <span>Generating Token...</span>
                </>
              ) : (
                <span>Send Recovery Instructions</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Recovery Token *</label>
              <input
                type="text"
                className="form-control font-monospace small"
                placeholder="Paste recovery token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              {demoToken && (
                <small className="text-success mt-1 d-block">
                  <i className="bi bi-check-circle me-1"></i>Auto-populated from sandbox simulation
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">New Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-key"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Confirm New Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-shopera-primary btn-lg w-100 rounded-pill py-3 fw-bold mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password & Sign In</span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 text-secondary text-decoration-none small"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccessMsg('');
              }}
            >
              <i className="bi bi-arrow-left me-1"></i>Back to Email Step
            </button>
          </form>
        )}

        <div className="text-center pt-3 border-top mt-3">
          <Link to="/login" className="text-decoration-none small text-primary fw-semibold d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrow-left"></i>
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
