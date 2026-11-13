import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({ fullName, email, password });
      navigate('/verify-email', {
        state: {
          email: res.email,
          demoHintCode: res.demoHintCode
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your CloudPrep account"
      subtitle="Start preparing for your AWS Certified Cloud Practitioner exam."
    >
      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="regName" className="form-label small fw-semibold text-dark">
            Full Name
          </label>
          <input
            id="regName"
            type="text"
            className="form-control"
            placeholder="e.g. Aarav Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="regEmail" className="form-label small fw-semibold text-dark">
            Email Address
          </label>
          <input
            id="regEmail"
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="regPassword" className="form-label small fw-semibold text-dark">
            Password
          </label>
          <div className="input-group">
            <input
              id="regPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="regConfirmPassword" className="form-label small fw-semibold text-dark">
            Confirm Password
          </label>
          <input
            id="regConfirmPassword"
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-check mb-4">
          <input
            id="acceptTerms"
            type="checkbox"
            className="form-check-input"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <label htmlFor="acceptTerms" className="form-check-label small text-secondary">
            I agree to the <span className="text-primary fw-medium">Terms of Service</span> and{' '}
            <span className="text-primary fw-medium">Privacy Policy</span>.
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <i className="bi bi-person-plus"></i>
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4 small text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="fw-semibold text-decoration-none">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

