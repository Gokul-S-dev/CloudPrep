import Navbar from '../components/Navbar';

export default function Instructions({
  onStartExam,
  isLoading = false,
  error = null,
  onRetry = null,
  totalAvailableQuestions = 0,
  onBackToPortal = null
}) {
  const domains = [
    { name: 'Cloud Concepts', weight: '24%', icon: 'bi-clouds-fill', color: 'text-primary' },
    { name: 'Security and Compliance', weight: '30%', icon: 'bi-shield-lock-fill', color: 'text-danger' },
    { name: 'Cloud Technology and Services', weight: '34%', icon: 'bi-hdd-network-fill', color: 'text-success' },
    { name: 'Billing, Pricing, and Support', weight: '12%', icon: 'bi-cash-coin', color: 'text-warning' }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar examMode={false} />

      <main className="container-fluid px-3 px-sm-4 px-lg-5 py-4 flex-grow-1 w-100" style={{ maxWidth: '1500px', margin: '0 auto' }}>
        {onBackToPortal && (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
              onClick={onBackToPortal}
            >
              <i className="bi bi-arrow-left"></i>
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
        {/* Header banner */}
        <div className="card cp-card border-0 shadow-sm mb-4 overflow-hidden">
          <div
            className="p-4 p-sm-5 text-white"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
            }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill" style={{ fontSize: '0.78rem' }}>
                OFFICIAL SPECIFICATION ALIGNED
              </span>
              <span className="badge bg-white bg-opacity-25 text-white border border-light-subtle px-3 py-1.5 rounded-pill" style={{ fontSize: '0.78rem' }}>
                Exam Code: CLF-C02
              </span>
            </div>

            <h1 className="h2 fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
              AWS Certified Cloud Practitioner
            </h1>
            <p className="lead text-white-50 mb-4" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
              Full-length practice examination simulating the real AWS certification testing environment.
            </p>

            {/* Quick exam stats pill-row */}
            <div className="row g-2 g-sm-3 text-center">
              <div className="col-6 col-md-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-10">
                  <div className="fs-3 fw-bold text-white">65</div>
                  <div className="text-white-50 small">Standard Questions</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-10">
                  <div className="fs-3 fw-bold text-white">90</div>
                  <div className="text-white-50 small">Minutes Duration</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-10">
                  <div className="fs-3 fw-bold text-white">4</div>
                  <div className="text-white-50 small">Exam Domains</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-10">
                  <div className="fs-3 fw-bold text-white">70%</div>
                  <div className="text-white-50 small">Practice Benchmark</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error banner if question fetching failed */}
        {error && (
          <div className="alert alert-danger shadow-sm border-danger-subtle d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 mb-4 rounded-3" role="alert">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon-fill fs-4 text-danger flex-shrink-0"></i>
              <div>
                <strong className="d-block">Unable to load questions from AWS API</strong>
                <span className="small text-danger-emphasis">{error}</span>
              </div>
            </div>
            {onRetry && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger fw-semibold px-3"
                onClick={onRetry}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Retry
              </button>
            )}
          </div>
        )}

        {/* Exam Domains breakdown */}
        <div className="card cp-card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <i className="bi bi-pie-chart-fill text-primary"></i>
              Exam Domain Coverage (CLF-C02)
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {domains.map((domain, idx) => (
                <div key={idx} className="col-12 col-md-6">
                  <div className="p-3 border rounded-3 bg-white h-100 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <i className={`bi ${domain.icon} ${domain.color} fs-3 flex-shrink-0`}></i>
                      <div>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>
                          {domain.name}
                        </div>
                        <small className="text-muted">Domain {idx + 1}</small>
                      </div>
                    </div>
                    <span className="badge bg-light text-secondary border px-2.5 py-1.5 fw-bold ms-2 flex-shrink-0">
                      {domain.weight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions list */}
        <div className="card cp-card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <i className="bi bi-card-checklist text-primary"></i>
              Instructions & Guidelines
            </h5>
          </div>
          <div className="card-body p-4">
            <ul className="list-group list-group-flush">
              <li className="list-group-item px-0 py-2.5 border-0 d-flex align-items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div className="lh-base">
                  <strong>Full Screen Mode:</strong> The exam opens in distraction-free full screen mode to simulate the official testing center environment.
                </div>
              </li>
              <li className="list-group-item px-0 py-2.5 border-0 d-flex align-items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div className="lh-base">
                  <strong>Question Format:</strong> Single-choice (radio) and multiple-response questions (checkboxes). Multiple-response questions require selecting all correct options for credit.
                </div>
              </li>
              <li className="list-group-item px-0 py-2.5 border-0 d-flex align-items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div className="lh-base">
                  <strong>Timer & Auto-Submission:</strong> 90 minutes. A timer displays in the top navigation. When the timer hits 00:00, your exam automatically submits to the AWS backend.
                </div>
              </li>
              <li className="list-group-item px-0 py-2.5 border-0 d-flex align-items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div className="lh-base">
                  <strong>Question Palette:</strong> Jump directly to any question. Color indicators show answered (green), unanswered (grey), review (yellow), and active (blue).
                </div>
              </li>
              <li className="list-group-item px-0 py-2.5 border-0 d-flex align-items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div className="lh-base">
                  <strong>Serverless Scoring & Persistence:</strong> Submissions are processed by an AWS Lambda function and persisted in Amazon DynamoDB with domain analytics.
                </div>
              </li>
            </ul>

            <div className="alert alert-primary-subtle border-primary-subtle d-flex align-items-center gap-2 mt-3 mb-0 py-2.5 px-3">
              <i className="bi bi-cloud-check-fill text-primary fs-5 flex-shrink-0"></i>
              <div className="small text-primary-emphasis">
                Connected to AWS API Gateway: <strong>{totalAvailableQuestions > 0 ? `${totalAvailableQuestions} questions active` : 'Ready to start'}</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="text-center pb-4">
          <button
            type="button"
            className="btn btn-primary btn-lg w-100 w-sm-auto px-sm-5 py-3 fw-bold shadow d-inline-flex align-items-center justify-content-center gap-2"
            onClick={onStartExam}
            disabled={isLoading}
            style={{ fontSize: '1.15rem', borderRadius: '10px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Fetching Exam from AWS...</span>
              </>
            ) : (
              <>
                <span>Start Mock Exam</span>
                <i className="bi bi-arrows-fullscreen fs-5 ms-1"></i>
              </>
            )}
          </button>
          <div className="text-muted small mt-2">
            <i className="bi bi-shield-lock-fill me-1"></i> Exam opens in full-screen proctored mode. Answers are secured until submission.
          </div>
        </div>
      </main>
    </div>
  );
}
