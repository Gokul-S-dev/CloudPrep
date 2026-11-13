import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      setDemoCode(res.demoHintCode || '654321');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Unable to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been updated."
      >
        <div className="text-center py-3">
          <div
            className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '64px', height: '64px' }}
          >
            <i className="bi bi-shield-check fs-1"></i>
          </div>
          <h5 className="fw-bold text-dark mb-2">You&apos;re all set!</h5>
          <p className="text-muted small mb-4">
            You can now sign in to your CloudPrep account using your new password.
          </p>
          <button
            type="button"
            className="btn btn-primary w-100 py-2.5 fw-semibold"
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={step === 'request' ? 'Forgot your password?' : 'Reset your password'}
      subtitle={
        step === 'request'
          ? 'Enter your email address and we will send you a password reset code.'
          : 'Enter the verification code sent to your email along with your new password.'
      }
    >
      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestCode}>
          <div className="mb-4">
            <label htmlFor="fpEmail" className="form-label small fw-semibold text-dark">
              Registered Email Address
            </label>
            <input
              id="fpEmail"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 fw-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <div className="alert alert-info py-2 px-3 small mb-3">
            <i className="bi bi-info-circle-fill me-1"></i>
            Demo Reset Code for <strong>{email}</strong>: <strong>{demoCode}</strong>
          </div>

          <div className="mb-3">
            <label htmlFor="resetCode" className="form-label small fw-semibold text-dark">
              Verification Code
            </label>
            <input
              id="resetCode"
              type="text"
              className="form-control"
              placeholder="654321"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="resetNewPass" className="form-label small fw-semibold text-dark">
              New Password
            </label>
            <input
              id="resetNewPass"
              type="password"
              className="form-control"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="resetConfirmPass" className="form-label small fw-semibold text-dark">
              Confirm New Password
            </label>
            <input
              id="resetConfirmPass"
              type="password"
              className="form-control"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 fw-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      <div className="text-center mt-4 small">
        <Link to="/login" className="text-secondary text-decoration-none">
          <i className="bi bi-arrow-left me-1"></i> Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

