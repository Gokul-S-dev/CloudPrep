export default function Navbar({
  examMode = false,
  timerComponent = null,
  onSubmitClick = null,
  onTogglePalette = null,
  answeredCount = 0,
  totalQuestions = 0,
  isFullscreen = false,
  onToggleFullscreen = null
}) {
  return (
    <nav className="navbar navbar-expand-lg pv-navbar sticky-top py-2 px-2 px-sm-3">
      <div className="container-fluid px-1 px-sm-2">
        {/* Brand & Exam Title */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded-2 p-1.5 flex-shrink-0"
            style={{ width: '34px', height: '34px' }}
          >
            <i className="bi bi-cloud-check-fill fs-5"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="pv-brand-logo mb-0">CloudPrep</span>
              <span className="pv-brand-badge">AWS</span>
            </div>
            <small className="text-white-50 d-none d-md-inline" style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>
              AWS Certified Cloud Practitioner (CLF-C02)
            </small>
          </div>
        </div>

        {/* Right side / Exam controls */}
        {examMode ? (
          <div className="d-flex align-items-center gap-1.5 gap-sm-2 ms-auto">
            {/* Quick mobile palette trigger */}
            {onTogglePalette && (
              <button
                type="button"
                className="btn btn-outline-light btn-sm px-2 px-sm-2.5 d-lg-none d-inline-flex align-items-center gap-1"
                onClick={onTogglePalette}
                aria-label="Toggle Question Palette"
                title="View Question Palette"
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
                <span className="small fw-semibold">{answeredCount}/{totalQuestions}</span>
              </button>
            )}

            {/* Fullscreen Toggle Button */}
            {onToggleFullscreen && (
              <button
                type="button"
                className={`btn btn-sm ${isFullscreen ? 'btn-info text-dark' : 'btn-outline-light'} px-2 px-sm-2.5 d-inline-flex align-items-center gap-1`}
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
                aria-label="Toggle Fullscreen"
              >
                <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                <span className="d-none d-md-inline small fw-semibold">
                  {isFullscreen ? 'Exit Full' : 'Full Screen'}
                </span>
              </button>
            )}

            {/* Timer Component */}
            {timerComponent}

            {/* Pearson VUE Submit Button */}
            <button
              type="button"
              className="btn btn-danger btn-sm px-2.5 px-sm-3 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={onSubmitClick}
            >
              <i className="bi bi-send-check"></i>
              <span className="d-none d-sm-inline">Submit Exam</span>
              <span className="d-sm-none">Submit</span>
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2 ms-auto">
            <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-2.5 py-1.5 fw-medium d-none d-sm-inline-block">
              <i className="bi bi-shield-check me-1 text-warning"></i> Pearson VUE Standard
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
