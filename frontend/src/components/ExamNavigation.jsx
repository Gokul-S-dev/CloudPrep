export default function ExamNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onClearResponse,
  hasAnswerSelected = false,
  onTogglePalette = null,
  answeredCount = 0
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="pv-bottombar fixed-bottom d-flex align-items-center justify-content-between px-3 px-sm-4">
      {/* Left: Previous */}
      <div>
        <button
          type="button"
          className="btn btn-outline-secondary pv-nav-btn"
          onClick={onPrevious}
          disabled={isFirst}
          title="Go to Previous Question"
        >
          <i className="bi bi-chevron-left"></i>
          <span>Previous</span>
        </button>
      </div>

      {/* Center: Clear & Palette toggle */}
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-light border pv-nav-btn text-secondary"
          onClick={onClearResponse}
          disabled={!hasAnswerSelected}
          title="Clear response for current question"
        >
          <i className="bi bi-eraser"></i>
          <span className="d-none d-sm-inline">Clear Response</span>
        </button>

        {onTogglePalette && (
          <button
            type="button"
            className="btn btn-outline-primary pv-nav-btn d-lg-none"
            onClick={onTogglePalette}
            title="Open Question Palette"
          >
            <i className="bi bi-grid-3x3-gap-fill"></i>
            <span>Palette ({answeredCount}/{totalQuestions})</span>
          </button>
        )}
      </div>

      {/* Right: Next */}
      <div>
        <button
          type="button"
          className="btn btn-primary pv-nav-btn px-4"
          onClick={onNext}
          disabled={isLast}
          title="Go to Next Question"
        >
          <span>Next</span>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
