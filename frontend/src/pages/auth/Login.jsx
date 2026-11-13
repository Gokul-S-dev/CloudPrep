import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await login(email, password, rememberMe);
      const target =
        session.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      if (err.code === 'UserNotConfirmedException') {
        navigate('/verify-email', { state: { email: err.email } });
        return;
      }
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <AuthLayout
      title="Welcome back to CloudPrep"
      subtitle="Sign in to access your AWS certification practice portal."
    >
      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="loginEmail" className="form-label small fw-semibold text-dark">
            Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              id="loginEmail"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label htmlFor="loginPassword" className="form-label small fw-semibold text-dark mb-0">
              Password
            </label>
            <Link to="/forgot-password" className="small text-decoration-none fw-medium">
              Forgot password?
            </Link>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-lock"></i>
            </span>
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="form-check">
            <input
              id="rememberMe"
              type="checkbox"
              className="form-check-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="form-check-label small text-secondary">
              Remember me
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <i className="bi bi-arrow-right"></i>
            </>
          )}
        </button>
      </form>

      {/* Demo Login Preview Box */}
      <div className="mt-4 p-3 rounded-3 bg-light border">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
            <i className="bi bi-eye me-1"></i> Demo Preview Mode
          </span>
          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Frontend Preview Only</small>
        </div>
        <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
          Click below to autofill temporary preview credentials (separate from Amazon Cognito):
        </p>

        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between"
            onClick={() => fillDemoAccount('student@cloudprep.demo', 'CloudPrep@2026')}
          >
            <div>
              <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-mortarboard me-1"></i> Student Demo Account
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                student@cloudprep.demo • CloudPrep@2026
              </div>
            </div>
            <span className="badge bg-primary-subtle text-primary">Fill</span>
          </button>

          <button
            type="button"
            className="btn btn-outline-dark btn-sm text-start d-flex align-items-center justify-content-between"
            onClick={() => fillDemoAccount('admin@cloudprep.demo', 'Admin@2026!')}
          >
            <div>
              <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-shield-lock me-1"></i> Admin Demo Account
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                admin@cloudprep.demo • Admin@2026!
              </div>
            </div>
            <span className="badge bg-dark-subtle text-dark">Fill</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-4 small text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="fw-semibold text-decoration-none">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}

