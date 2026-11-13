import { useState } from 'react';
import Navbar from '../components/Navbar';

const DEFAULT_BENCHMARK = 70; // 70% practice benchmark

export default function Result({
  examData = {},
  onRetakeExam,
  onBackToInstructions
}) {
  const {
    attemptId,
    totalQuestions: backendTotal,
    correctAnswers: backendCorrect,
    incorrectAnswers: backendIncorrect,
    unanswered: backendUnanswered,
    percentage: backendPercentage,
    practiceBenchmark = DEFAULT_BENCHMARK,
    benchmarkMet,
    domainScores: backendDomainScores = {},
    review = [],
    submittedAt,
    reviewFlags = {},
    timeSpent = 0,
    isTimedOut = false
  } = examData;

  const [filterType, setFilterType] = useState('all'); // 'all', 'correct', 'incorrect', 'unanswered', 'marked'

  const totalQuestions = backendTotal ?? review.length ?? 0;
  const correctCount = backendCorrect ?? 0;
  const incorrectCount = backendIncorrect ?? 0;
  const unansweredCount = backendUnanswered ?? 0;
  const scorePercent = backendPercentage ?? (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);
  const isPassed = benchmarkMet ?? (scorePercent >= practiceBenchmark);

  // Format time spent
  const formatTimeSpent = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
  };

  // Format timestamp
  const formatTimestamp = (isoString) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return null;
    }
  };

  // Filtered review questions
  const filteredQuestions = review.filter((q) => {
    const selected = q.selectedAnswers || [];
    const isAnswered = selected.length > 0;
    const isCorrect = !!q.isCorrect;
    const isMarked = !!reviewFlags[q.id];

    if (filterType === 'correct') return isAnswered && isCorrect;
    if (filterType === 'incorrect') return isAnswered && !isCorrect;
    if (filterType === 'unanswered') return !isAnswered;
    if (filterType === 'marked') return isMarked;
    return true;
  });

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar examMode={false} />

      <main className="container-fluid px-3 px-sm-4 px-lg-5 py-3 py-md-4 flex-grow-1 w-100" style={{ maxWidth: '1500px', margin: '0 auto' }}>
        {/* Timeout alert notice if auto-submitted */}
        {isTimedOut && (
          <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center gap-2 mb-3 mb-md-4 shadow-sm" role="alert">
            <i className="bi bi-clock-history fs-5 text-warning-emphasis flex-shrink-0"></i>
            <div className="small">
              <strong>Time Expired!</strong> The 90-minute limit was reached and your examination was automatically evaluated by AWS Lambda.
            </div>
          </div>
        )}

        {/* Top Scorecard Banner */}
        <div className="card cp-card border-0 shadow-sm mb-3 mb-md-4 overflow-hidden">
          <div
            className="p-3 p-sm-4 p-md-5 text-white"
            style={{
              background: isPassed
                ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
                : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)'
            }}
          >
            <div className="row align-items-center g-3 g-md-4">
              <div className="col-12 col-md-7">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                    OFFICIAL SERVERLESS EVALUATION
                  </span>
                  {attemptId && (
                    <span className="badge bg-black bg-opacity-25 text-white-50 border border-white border-opacity-10 px-2 py-1 rounded-pill small" title={`DynamoDB Attempt ID: ${attemptId}`}>
                      <i className="bi bi-database-check me-1 text-success"></i>
                      ID: {attemptId.slice(0, 8)}...
                    </span>
                  )}
                </div>

                <h1 className="h3 h2-md fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.35rem, 4vw, 2rem)' }}>
                  AWS Certified Cloud Practitioner (CLF-C02)
                </h1>
                <p className="lead text-white-50 mb-3" style={{ fontSize: 'clamp(0.88rem, 2vw, 1rem)' }}>
                  {isPassed
                    ? 'Congratulations! You achieved or exceeded the practice benchmark for this examination.'
                    : 'Good attempt. Review the official AWS architectural explanations below to strengthen your preparation.'}
                </p>

                {/* Benchmark disclaimer banner */}
                <div
                  className="bg-black bg-opacity-25 rounded-3 p-2 p-sm-2.5 small text-white-50 d-inline-flex align-items-center gap-2"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}
                >
                  <i className="bi bi-info-circle-fill text-warning flex-shrink-0"></i>
                  <span>
                    <strong>Practice Benchmark:</strong> Pass threshold is {practiceBenchmark}%. This is a practice benchmark and not an official AWS pass prediction.
                  </span>
                </div>
              </div>

              {/* Big Score Circular Display */}
              <div className="col-12 col-md-5 text-center text-md-end">
                <div className="d-inline-flex flex-column align-items-center bg-white bg-opacity-10 rounded-4 p-3 p-sm-4 border border-white border-opacity-10 w-100 w-sm-auto">
                  <span className="small text-white-50 text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>
                    Your Score
                  </span>
                  <div className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', lineHeight: 1 }}>
                    {scorePercent}%
                  </div>
                  <div className="small text-white-50 mb-2">
                    {correctCount} of {totalQuestions} Correct
                  </div>
                  <span
                    className={`badge ${
                      isPassed ? 'bg-success text-white' : 'bg-danger text-white'
                    } px-3 py-1.5 fs-6 fw-bold shadow-sm`}
                  >
                    {isPassed ? 'Benchmark Met' : 'Review Needed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="row g-2 g-sm-3 mb-3 mb-md-4">
          <div className="col-6 col-md-3">
            <div className="card cp-card text-center p-2.5 p-sm-3">
              <i className="bi bi-question-circle text-primary fs-4 fs-sm-3 mb-1"></i>
              <div className="fs-5 fs-sm-4 fw-bold text-dark">{totalQuestions}</div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Total Questions</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card cp-card text-center p-2.5 p-sm-3 border-success-subtle bg-success-subtle">
              <i className="bi bi-check-circle-fill text-success fs-4 fs-sm-3 mb-1"></i>
              <div className="fs-5 fs-sm-4 fw-bold text-success">{correctCount}</div>
              <small className="text-success fw-medium" style={{ fontSize: '0.75rem' }}>Correct (+1 pt)</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card cp-card text-center p-2.5 p-sm-3 border-danger-subtle bg-danger-subtle">
              <i className="bi bi-x-circle-fill text-danger fs-4 fs-sm-3 mb-1"></i>
              <div className="fs-5 fs-sm-4 fw-bold text-danger">{incorrectCount}</div>
              <small className="text-danger fw-medium" style={{ fontSize: '0.75rem' }}>Incorrect</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card cp-card text-center p-2.5 p-sm-3 border-secondary-subtle">
              <i className="bi bi-dash-circle text-secondary fs-4 fs-sm-3 mb-1"></i>
              <div className="fs-5 fs-sm-4 fw-bold text-secondary">{unansweredCount}</div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Skipped ({formatTimeSpent(timeSpent)})
              </small>
            </div>
          </div>
        </div>

        {/* Domain-wise Performance Breakdown */}
        {Object.keys(backendDomainScores).length > 0 && (
          <div className="card cp-card border-0 shadow-sm mb-3 mb-md-4">
            <div className="card-header bg-white border-bottom py-2.5 py-sm-3 px-3 px-sm-4">
              <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)' }}>
                <i className="bi bi-bar-chart-fill text-primary"></i>
                Domain Performance Analysis (Evaluated by AWS)
              </h5>
            </div>
            <div className="card-body p-3 p-sm-4">
              <div className="row g-2 g-sm-3">
                {Object.keys(backendDomainScores).map((domain) => {
                  const stat = backendDomainScores[domain];
                  const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  return (
                    <div key={domain} className="col-12 col-md-6">
                      <div className="p-2.5 p-sm-3 border rounded-3 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                          <span className="fw-semibold text-dark small text-truncate">{domain}</span>
                          <span className="badge bg-light text-secondary border flex-shrink-0">
                            {stat.correct}/{stat.total} ({pct}%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${pct >= 70 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-danger'}`}
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Retake Exam or Return to Home */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 mb-md-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: 'clamp(1.15rem, 3vw, 1.35rem)' }}>
              <i className="bi bi-card-checklist me-2 text-primary"></i>
              Official Answer Review & Explanations
            </h4>
            <p className="text-muted small mb-0">
              Revealed directly by AWS Lambda from private question bank key in S3.
              {submittedAt && (
                <span className="ms-1">
                  Submitted at {formatTimestamp(submittedAt)}.
                </span>
              )}
            </p>
          </div>

          <div className="d-flex gap-2 w-100 w-sm-auto">
            <button
              type="button"
              className="btn btn-outline-secondary flex-fill flex-sm-grow-0 px-3"
              onClick={onBackToInstructions}
            >
              <i className="bi bi-house me-1"></i> Home
            </button>
            <button
              type="button"
              className="btn btn-primary flex-fill flex-sm-grow-0 px-4 fw-semibold"
              onClick={onRetakeExam}
            >
              <i className="bi bi-arrow-repeat me-1"></i> Retake
            </button>
          </div>
        </div>

        {/* Filter review buttons */}
        <div className="filter-scroll-container d-flex gap-2 mb-3 mb-md-4">
          <button
            type="button"
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline-secondary'} flex-shrink-0`}
            onClick={() => setFilterType('all')}
          >
            All ({totalQuestions})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterType === 'incorrect' ? 'btn-danger' : 'btn-outline-danger'} flex-shrink-0`}
            onClick={() => setFilterType('incorrect')}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterType === 'correct' ? 'btn-success' : 'btn-outline-success'} flex-shrink-0`}
            onClick={() => setFilterType('correct')}
          >
            Correct ({correctCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterType === 'unanswered' ? 'btn-secondary' : 'btn-outline-secondary'} flex-shrink-0`}
            onClick={() => setFilterType('unanswered')}
          >
            Unanswered ({unansweredCount})
          </button>
        </div>

        {/* Questions Review List */}
        <div className="d-flex flex-column gap-3">
          {filteredQuestions.length === 0 ? (
            <div className="card cp-card p-4 p-sm-5 text-center text-muted">
              <i className="bi bi-funnel fs-2 mb-2"></i>
              <p className="mb-0">No questions match the selected filter.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const selected = q.selectedAnswers || [];
              const correct = q.correctAnswers || [];
              const isAnswered = selected.length > 0;
              const isCorrect = !!q.isCorrect;

              let statusBadge = (
                <span className="badge bg-secondary-subtle text-secondary border">
                  <i className="bi bi-dash-circle me-1"></i> Unanswered
                </span>
              );

              if (isAnswered) {
                if (isCorrect) {
                  statusBadge = (
                    <span className="badge bg-success text-white">
                      <i className="bi bi-check-circle-fill me-1"></i> Correct (+1 pt)
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="badge bg-danger text-white">
                      <i className="bi bi-x-circle-fill me-1"></i> Incorrect (0 pts)
                    </span>
                  );
                }
              }

              return (
                <div key={q.id} className="card cp-card border-0 shadow-sm">
                  {/* Card Header */}
                  <div className="card-header bg-white border-bottom py-2.5 px-3 px-sm-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex flex-wrap align-items-center gap-1.5 gap-sm-2">
                      <span className="badge bg-primary-subtle text-primary fw-bold">
                        Q{q.id}
                      </span>
                      <span className="cp-badge-domain text-truncate" style={{ maxWidth: '180px' }}>{q.domain}</span>
                      <span className="badge bg-light text-secondary border d-none d-sm-inline">
                        {q.type === 'multiple' ? 'Multi' : 'Single'}
                      </span>
                    </div>

                    <div>{statusBadge}</div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-3 p-sm-4">
                    <h5 className="fw-semibold text-dark mb-3" style={{ fontSize: 'clamp(0.96rem, 2.2vw, 1.05rem)' }}>
                      {q.question}
                    </h5>

                    {/* Options list */}
                    <div className="mb-3">
                      {q.options.map((opt) => {
                        const isOptionSelected = selected.includes(opt.id);
                        const isOptionCorrect = correct.includes(opt.id);

                        let optionStyleClass = 'review-option neutral';
                        let indicatorIcon = null;

                        if (isOptionCorrect) {
                          optionStyleClass = 'review-option correct';
                          indicatorIcon = (
                            <span className="badge bg-success ms-auto">
                              <i className="bi bi-check-lg me-1"></i> Correct Answer
                            </span>
                          );
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optionStyleClass = 'review-option user-incorrect';
                          indicatorIcon = (
                            <span className="badge bg-danger ms-auto">
                              <i className="bi bi-x-lg me-1"></i> Your Choice
                            </span>
                          );
                        }

                        return (
                          <div key={opt.id} className={optionStyleClass}>
                            <span
                              className={`option-badge ${
                                isOptionCorrect
                                  ? 'bg-success text-white'
                                  : isOptionSelected
                                  ? 'bg-danger text-white'
                                  : ''
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="flex-grow-1">{opt.text}</span>
                            {indicatorIcon}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    <div className="p-2.5 p-sm-3 bg-light rounded-3 border">
                      <div className="fw-bold text-dark small mb-1 d-flex align-items-center gap-1.5">
                        <i className="bi bi-lightbulb-fill text-warning"></i>
                        Official AWS Explanation & Reference:
                      </div>
                      <p className="mb-0 text-secondary small lh-base">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
