export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswers = [],
  onSelectOption,
  isMarkedForReview = false,
  onToggleReview
}) {
  if (!question) return null;

  const isMultiple = question.type === 'multiple';

  const handleOptionClick = (optionId) => {
    if (isMultiple) {
      if (selectedAnswers.includes(optionId)) {
        onSelectOption(selectedAnswers.filter((id) => id !== optionId));
      } else {
        onSelectOption([...selectedAnswers, optionId]);
      }
    } else {
      onSelectOption([optionId]);
    }
  };

  return (
    <div className="pv-question-container mb-3 text-start">
      {/* Sub-header inside question card */}
      <div className="pv-subheader border-bottom">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="badge bg-dark text-white fw-bold px-2.5 py-1.5" style={{ fontSize: '0.85rem' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold" style={{ fontSize: '0.82rem' }}>
            <i className="bi bi-layers me-1 text-primary"></i>
            {question.domain}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto">
          <span className="badge bg-light text-secondary border px-2.5 py-1.5" style={{ fontSize: '0.75rem' }}>
            {isMultiple ? (
              <>
                <i className="bi bi-ui-checks me-1 text-primary"></i> Multiple Response
              </>
            ) : (
              <>
                <i className="bi bi-ui-radios me-1 text-primary"></i> Single Response
              </>
            )}
          </span>

          {/* Pearson VUE Mark for Review flag button */}
          <button
            type="button"
            className={`btn btn-sm ${
              isMarkedForReview ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'
            } d-flex align-items-center gap-1.5 px-2.5 py-1`}
            onClick={onToggleReview}
            title="Mark this question to review later"
          >
            <i className={`bi ${isMarkedForReview ? 'bi-flag-fill text-danger' : 'bi-flag'}`}></i>
            <span className="small">
              {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
            </span>
          </button>
        </div>
      </div>

      {/* Question prompt & options */}
      <div className="p-3 p-sm-4 text-start">
        <h5 className="pv-question-prompt text-start">
          {question.question}
        </h5>

        <div className="text-muted small mb-3 text-start d-flex align-items-center gap-1.5">
          <i className="bi bi-info-circle text-primary"></i>
          <span>
            {isMultiple
              ? `Select all correct options (${question.correctAnswers?.length || 2} expected)`
              : 'Select the best single option.'}
          </span>
        </div>

        {/* Option list (left-aligned, full width, Pearson VUE rows) */}
        <div className="options-group text-start">
          {question.options.map((option) => {
            const isSelected = selectedAnswers.includes(option.id);
            const inputId = `q${question.id}-opt-${option.id}`;

            return (
              <div
                key={option.id}
                className={`pv-option-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleOptionClick(option.id);
                  }
                }}
              >
                {/* Option Letter */}
                <span className="pv-option-letter">{option.id}</span>

                {/* Radio / Checkbox Indicator */}
                <div className="form-check m-0 p-0 d-flex align-items-center">
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    className="form-check-input m-0 cursor-pointer"
                    style={{ width: '18px', height: '18px' }}
                    name={`question-${question.id}`}
                    id={inputId}
                    checked={isSelected}
                    onChange={() => {}}
                  />
                </div>

                {/* Option text */}
                <label
                  htmlFor={inputId}
                  className="pv-option-text mb-0 cursor-pointer user-select-none"
                >
                  {option.text}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
