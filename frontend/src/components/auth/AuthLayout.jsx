export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row w-100 bg-light">
      {/* Left branding panel (desktop) */}
      <div
        className="d-none d-lg-flex flex-column justify-content-between p-5 text-white flex-shrink-0"
        style={{
          width: '44%',
          maxWidth: '560px',
          background: 'linear-gradient(155deg, #0c2340 0%, #163a6b 60%, #0073e6 100%)'
        }}
      >
        <div>
          <div className="d-flex align-items-center gap-2.5 mb-5">
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3"
              style={{ width: '42px', height: '42px' }}
            >
              <i className="bi bi-cloud-check-fill fs-4"></i>
            </div>
            <span className="fw-bold fs-4 text-white">CloudPrep</span>
            <span className="pv-brand-badge">AWS</span>
          </div>

          <h2 className="display-6 fw-bold text-white mb-3" style={{ lineHeight: 1.25 }}>
            Master AWS Certifications with Confidence.
          </h2>
          <p className="text-white-50 fs-6 mb-4 lh-base">
            Authentic Pearson VUE simulated mock exams, real-time domain analytics, and serverless scoring powered by AWS Lambda & DynamoDB.
          </p>

          <div className="d-flex flex-column gap-3 mt-4">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <i className="bi bi-laptop text-info"></i>
              </div>
              <div>
                <div className="fw-semibold small">Full-Screen Proctored Interface</div>
                <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Distraction-free testing engine aligned to CLF-C02</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <i className="bi bi-bar-chart-fill text-warning"></i>
              </div>
              <div>
                <div className="fw-semibold small">Domain-Level Mastery Analytics</div>
                <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Track strengths, weaknesses, and score progression</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <i className="bi bi-shield-lock-fill text-success"></i>
              </div>
              <div>
                <div className="fw-semibold small">Cognito-Ready Security Architecture</div>
                <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Role-based portals with private S3 answer keys</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-top border-white border-opacity-10 text-white-50 small">
          CloudPrep EdTech Platform • AWS Serverless Architecture
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3 p-sm-4 p-md-5">
        {/* Mobile Brand Header */}
        <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3"
            style={{ width: '38px', height: '38px' }}
          >
            <i className="bi bi-cloud-check-fill fs-5"></i>
          </div>
          <span className="fw-bold fs-4 text-dark">CloudPrep</span>
          <span className="pv-brand-badge">AWS</span>
        </div>

        <div className="card border-0 shadow-sm w-100" style={{ maxWidth: '460px', borderRadius: '16px' }}>
          <div className="card-body p-4 p-sm-5">
            <div className="mb-4">
              <h1 className="h4 fw-bold text-dark mb-1">{title}</h1>
              {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

