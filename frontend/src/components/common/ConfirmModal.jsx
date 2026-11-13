export default function ConfirmModal({
  show,
  title = 'Confirm Action',
  message,
  warningText = null,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  secondaryActionLabel = null,
  onSecondaryAction = null,
  onCancel,
  onConfirm,
  isLoading = false
}) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(12, 35, 64, 0.55)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto" style={{ maxWidth: '460px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
          <div className="modal-header border-bottom py-3 px-4">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.08rem' }}>
              <i className={`bi ${confirmVariant === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-question-circle-fill text-primary'}`}></i>
              {title}
            </h5>
            {!isLoading && (
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
            )}
          </div>

          <div className="modal-body px-4 py-3">
            <p className="text-secondary mb-2" style={{ fontSize: '0.95rem' }}>{message}</p>
            {warningText && (
              <div className="alert alert-warning py-2 px-3 small d-flex align-items-start gap-2 mb-0 mt-2">
                <i className="bi bi-shield-exclamation fs-6 flex-shrink-0 mt-0.5"></i>
                <div>{warningText}</div>
              </div>
            )}
          </div>

          <div className="modal-footer border-top py-2.5 px-4 bg-light rounded-bottom-4 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            {secondaryActionLabel && onSecondaryAction && (
              <button
                type="button"
                className="btn btn-warning btn-sm px-3 fw-semibold"
                onClick={onSecondaryAction}
                disabled={isLoading}
              >
                {secondaryActionLabel}
              </button>
            )}
            <button
              type="button"
              className={`btn btn-${confirmVariant} btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

