export default function QuestionPalette({
  questions = [],
  currentIndex = 0,
  userAnswers = {},
  reviewFlags = {},
  onSelectQuestion,
  onClose = null,
  isMobileDrawer = false
}) {
  const total = questions.length;

  const answeredCount = questions.filter(
    (q) => userAnswers[q.id] && userAnswers[q.id].length > 0
  ).length;

  const markedCount = questions.filter((q) => reviewFlags[q.id]).length;
  const notAnsweredCount = total - answeredCount;

  const getButtonClass = (index, question) => {
    const isCurrent = index === currentIndex;
    const isAnswered = userAnswers[question.id] && userAnswers[question.id].length > 0;
    const isMarked = reviewFlags[question.id];

    let baseClass = 'palette-not-answered';

    if (isMarked && isAnswered) {
      baseClass = 'palette-review-answered';
    } else if (isMarked) {
      baseClass = 'palette-review';
    } else if (isAnswered) {
      baseClass = 'palette-answered';
    }

    if (isCurrent) {
      return `${baseClass} current`;
    }
    return baseClass;
  };

  const handleQuestionClick = (idx) => {
    onSelectQuestion(idx);
    if (isMobileDrawer && onClose) {
      onClose();
    }
  };

  return (
    <div className={`card cp-card palette-card-container ${isMobileDrawer ? 'border-0 rounded-0 h-100' : 'shadow-sm'}`}>
      {/* Palette Header */}
      <div className="card-header bg-white border-bottom py-2.5 px-3 d-flex align-items-center justify-content-between">
        <h6 className="card-title mb-0 fw-bold d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.95rem' }}>
          <i className="bi bi-grid-3x3-gap-fill text-primary fs-5"></i>
          <span>Question Palette</span>
        </h6>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-semibold">
            {answeredCount}/{total} Done
          </span>
          {isMobileDrawer && onClose && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          )}
        </div>
      </div>

      <div className="card-body p-3 d-flex flex-column">
        {/* Quick Summary Counts (3 balanced boxes, no awkward wrapping) */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="palette-stat-box bg-success-subtle text-success border border-success-subtle">
              <div className="fs-6 fw-bold">{answeredCount}</div>
              <span className="palette-stat-label">Answered</span>
            </div>
          </div>
          <div className="col-4">
            <div className="palette-stat-box bg-warning-subtle text-warning-emphasis border border-warning-subtle">
              <div className="fs-6 fw-bold">{markedCount}</div>
              <span className="palette-stat-label">Review</span>
            </div>
          </div>
          <div className="col-4">
            <div className="palette-stat-box bg-secondary-subtle text-secondary border border-secondary-subtle">
              <div className="fs-6 fw-bold">{notAnsweredCount}</div>
              <span className="palette-stat-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Scrollable Question Grid */}
        <div className="palette-scroll flex-grow-1 mb-2">
          <div className="palette-grid">
            {questions.map((q, idx) => {
              const btnClass = getButtonClass(idx, q);
              const isMarked = reviewFlags[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  className={`btn palette-btn ${btnClass}`}
                  onClick={() => handleQuestionClick(idx)}
                  aria-label={`Go to Question ${idx + 1}`}
                  title={`Question ${idx + 1}${isMarked ? ' (Marked for review)' : ''}`}
                >
                  {idx + 1}
                  {isMarked && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"
                      style={{ width: '7px', height: '7px' }}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-top mt-auto">
          <div className="fw-bold text-muted mb-2 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Legend
          </div>
          <div className="row g-2" style={{ fontSize: '0.78rem' }}>
            <div className="col-6 d-flex align-items-center gap-2">
              <span className="legend-dot answered"></span>
              <span className="text-secondary text-nowrap">Answered</span>
            </div>
            <div className="col-6 d-flex align-items-center gap-2">
              <span className="legend-dot not-answered"></span>
              <span className="text-secondary text-nowrap">Not Answered</span>
            </div>
            <div className="col-6 d-flex align-items-center gap-2">
              <span className="legend-dot review"></span>
              <span className="text-secondary text-nowrap">Marked Review</span>
            </div>
            <div className="col-6 d-flex align-items-center gap-2">
              <span className="legend-dot current"></span>
              <span className="text-secondary text-nowrap">Current Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
