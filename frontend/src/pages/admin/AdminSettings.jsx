import AdminLayout from '../../components/admin/AdminLayout';
import { isCognitoConfigured } from '../../services/authService';

export default function AdminSettings() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fbp9d6e1b1.execute-api.ap-south-1.amazonaws.com';

  return (
    <AdminLayout
      pageTitle="Platform Settings"
      pageSubtitle="AWS Serverless endpoints, Cognito integration readiness, and security settings."
    >
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '14px' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-bold text-dark">AWS Infrastructure Configuration</h6>
            </div>
            <div className="card-body p-4 small">
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">API Gateway Endpoint</label>
                <input type="text" className="form-control form-control-sm bg-light font-monospace" value={apiUrl} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Cognito User Pool Status</label>
                <div>
                  <span className={`badge ${isCognitoConfigured ? 'bg-success' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}`}>
                    {isCognitoConfigured ? 'Connected to Amazon Cognito' : 'Frontend Demo Adapter Active (Set VITE_COGNITO_USER_POOL_ID)'}
                  </span>
                </div>
              </div>
              <div className="alert alert-info mb-0">
                <i className="bi bi-shield-lock-fill me-2"></i>
                <strong>Security Policy:</strong> Answer keys and explanations remain isolated in Amazon S3 (`GetQuestionsFunction` strips them prior to delivery). Backend IAM/Cognito authorizers must enforce admin permissions for production CRUD APIs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

