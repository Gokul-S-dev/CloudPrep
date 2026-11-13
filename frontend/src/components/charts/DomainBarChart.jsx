export default function DomainBarChart({
  items = [],
  emptyMessage = 'No domain analytics available yet.'
}) {
  if (!items || items.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-muted py-4 bg-light rounded-3 border border-dashed">
        <i className="bi bi-bar-chart fs-2 mb-2 text-secondary"></i>
        <span className="small">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((item, idx) => {
        const pct = Number(item.accuracy ?? item.percentage ?? 0);
        let barColor = 'bg-danger';
        if (pct >= 75) barColor = 'bg-success';
        else if (pct >= 55) barColor = 'bg-warning';

        return (
          <div key={item.domain || idx}>
            <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
              <span className="fw-semibold text-dark small text-truncate">{item.domain || item.label}</span>
              <span className="small text-secondary fw-semibold flex-shrink-0">
                {item.correct !== undefined && item.total !== undefined
                  ? `${item.correct}/${item.total} (${pct}%)`
                  : `${pct}%`}
              </span>
            </div>
            <div className="progress" style={{ height: '9px', backgroundColor: '#e2e8f0', borderRadius: '6px' }}>
              <div
                className={`progress-bar ${barColor}`}
                role="progressbar"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%`, borderRadius: '6px', transition: 'width 0.4s ease' }}
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

