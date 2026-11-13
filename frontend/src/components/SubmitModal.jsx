export default function SubmitModal({
  show,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  onCancel,
  onConfirmSubmit,
  isSubmitting = false,
  submitError = null,
  isTimedOut = false
}) {
  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
      >
        <div className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto" role="document" style={{ maxWidth: '480px' }}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
            {/* Modal Header */}
            <div className="modal-header border-bottom py-2.5 px-3 px-sm-4">
              <h5 className="modal-title fw-semibold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <i className="bi bi-question-diamond-fill text-primary"></i>
                {isTimedOut ? 'Time Expired – Submitting Exam' : 'Submit Examination?'}
              </h5>
              {!isSubmitting && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onCancel}
                ></button>
              )}
            </div>

            {/* Modal Body */}
            <div className="modal-body px-3 px-sm-4 py-3">
              {isTimedOut ? (
                <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-alarm-fill fs-5 text-warning-emphasis flex-shrink-0"></i>
                  <div>
                    <strong>Your 90-minute time limit has expired.</strong> Evaluating your answers with AWS Serverless backend...
                  </div>
                </div>
              ) : (
                <p className="text-secondary small mb-3">
                  Are you sure you want to end and submit your exam? Once submitted, your answers will be securely evaluated and recorded in DynamoDB.
                </p>
              )}

              {/* Status summary table / cards */}
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="border rounded-3 p-2 text-center bg-light">
                    <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Total</div>
                    <div className="fs-5 fw-bold text-dark">{totalQuestions}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded-3 p-2 text-center bg-success-subtle text-success border-success-subtle">
                    <div className="small" style={{ fontSize: '0.72rem' }}>Answered</div>
                    <div className="fs-5 fw-bold">{answeredCount}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded-3 p-2 text-center bg-danger-subtle text-danger border-danger-subtle">
                    <div className="small" style={{ fontSize: '0.72rem' }}>Unanswered</div>
                    <div className="fs-5 fw-bold">{unansweredCount}</div>
                  </div>
                </div>
              </div>

              {!isTimedOut && markedCount > 0 && (
                <div className="alert alert-warning py-2 px-2.5 small d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0 fs-6"></i>
                  <div>
                    You have <strong>{markedCount} question(s)</strong> flagged for review.
                  </div>
                </div>
              )}

              {!isTimedOut && unansweredCount > 0 && (
                <div className="alert alert-info py-2 px-2.5 small d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-info-circle-fill flex-shrink-0 fs-6"></i>
                  <div>
                    You have <strong>{unansweredCount} unanswered question(s)</strong>. Unanswered questions receive 0 points.
                  </div>
                </div>
              )}

              {/* Submission error alert */}
              {submitError && (
                <div className="alert alert-danger py-2 px-2.5 small d-flex align-items-start gap-2 mb-0">
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0 fs-6 mt-0.5"></i>
                  <div className="flex-grow-1">
                    <strong>Submission Failed:</strong> {submitError}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top py-2.5 px-3 px-sm-4 bg-light rounded-bottom-4 d-flex justify-content-end gap-2">
              {!isTimedOut && (
                <button
                  type="button"
                  className="btn btn-secondary px-3 btn-sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Resume Exam
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger px-3 px-sm-4 fw-semibold btn-sm d-inline-flex align-items-center gap-1.5"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Submitting to AWS...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check"></i>
                    <span>{submitError ? 'Retry Submission' : 'Yes, Submit Now'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
