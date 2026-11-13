import { useState } from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/AuthContext';

export default function StudentSettings() {
  const { user, isDemoMode } = useAuth();
  const [autoFullscreen, setAutoFullscreen] = useState(true);
  const [tenMinuteAlert, setTenMinuteAlert] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <StudentLayout
      pageTitle="Settings"
      pageSubtitle="Configure your examination workspace and notification preferences."
    >
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '14px' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-bold text-dark">Examination Preferences</h6>
            </div>
            <div className="card-body p-4">
              {savedNotice && (
                <div className="alert alert-success py-2 px-3 small mb-3">
                  <i className="bi bi-check-circle-fill me-2"></i> Preferences saved.
                </div>
              )}
              <form onSubmit={handleSave}>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefFullscreen"
                    checked={autoFullscreen}
                    onChange={(e) => setAutoFullscreen(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold small text-dark" htmlFor="prefFullscreen">
                    Enter Full-Screen Proctored Mode Automatically
                  </label>
                  <div className="text-muted small">
                    Automatically expands the browser into Pearson VUE full-screen mode when starting an exam.
                  </div>
                </div>

                <div className="form-check form-switch mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefTimerWarn"
                    checked={tenMinuteAlert}
                    onChange={(e) => setTenMinuteAlert(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold small text-dark" htmlFor="prefTimerWarn">
                    10-Minute Remaining Warning Highlight
                  </label>
                  <div className="text-muted small">
                    Displays an amber timer warning when 10 minutes remain in your exam.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '14px' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-bold text-dark">Session Information</h6>
            </div>
            <div className="card-body p-4 small">
              <div className="mb-2">
                <span className="text-muted d-block">Authenticated Email</span>
                <strong className="text-dark">{user?.email}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted d-block">Role</span>
                <span className="badge bg-primary-subtle text-primary text-uppercase">{user?.role}</span>
              </div>
              <div>
                <span className="text-muted d-block">Authentication Provider</span>
                <span className="badge bg-light text-dark border">
                  {isDemoMode ? 'Demo Preview Adapter (Cognito Ready)' : 'Amazon Cognito'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

