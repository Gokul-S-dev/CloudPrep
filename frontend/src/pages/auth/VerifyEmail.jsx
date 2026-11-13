import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || '';
  const demoHintCode = location.state?.demoHintCode || '123456';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      await verifyEmail(email, code);
      setIsConfirmed(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const res = await resendVerificationCode(email);
      setInfoMessage(`A new verification code has been sent to ${email}. (Demo code: ${res.demoHintCode})`);
    } catch (err) {
      setError(err.message || 'Unable to resend verification code.');
    }
  };

  if (isConfirmed) {
    return (
      <AuthLayout
        title="Account Confirmed"
        subtitle="Your email address has been verified successfully."
      >
        <div className="text-center py-3">
          <div
            className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '64px', height: '64px' }}
          >
            <i className="bi bi-check-lg fs-1"></i>
          </div>
          <h5 className="fw-bold text-dark mb-2">Email Verified!</h5>
          <p className="text-muted small mb-4">
            Your CloudPrep student account ({email}) is now active. Sign in to access your dashboard and start practicing.
          </p>
          <button
            type="button"
            className="btn btn-primary w-100 py-2.5 fw-semibold"
            onClick={() => navigate('/login', { replace: true })}
          >
            Continue to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit confirmation code sent to your email address."
    >
      <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-envelope-check-fill flex-shrink-0"></i>
        <span>
          Demo Preview Verification Code: <strong>{demoHintCode}</strong>
        </span>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}

      {infoMessage && (
        <div className="alert alert-success py-2 px-3 small mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="mb-3">
          <label htmlFor="verifyEmailInput" className="form-label small fw-semibold text-dark">
            Email Address
          </label>
          <input
            id="verifyEmailInput"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="verifyCodeInput" className="form-label small fw-semibold text-dark">
            Confirmation Code
          </label>
          <input
            id="verifyCodeInput"
            type="text"
            className="form-control text-center fw-bold fs-5"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2.5 fw-semibold mb-3"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none"
            onClick={handleResend}
          >
            Didn&apos;t receive a code? Resend
          </button>
        </div>
      </form>

      <div className="text-center mt-3 small">
        <Link to="/login" className="text-secondary text-decoration-none">
          <i className="bi bi-arrow-left me-1"></i> Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

