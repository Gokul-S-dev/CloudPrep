export default function StatCard({
  title,
  value,
  subtitle,
  icon = 'bi-bar-chart',
  color = 'primary',
  trend = null
}) {
  return (
    <div className="card border-0 shadow-sm h-100 saas-stat-card" style={{ borderRadius: '12px' }}>
      <div className="card-body p-3 p-sm-4 d-flex align-items-start justify-content-between gap-3">
        <div className="flex-grow-1 min-w-0">
          <div className="text-muted small fw-semibold text-uppercase mb-1 text-truncate" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div className="fs-3 fw-bold text-dark mb-1 lh-sm">{value}</div>
          {subtitle && (
            <div className="small text-secondary text-truncate">{subtitle}</div>
          )}
          {trend && (
            <div className={`small fw-semibold mt-1 ${trend.positive ? 'text-success' : 'text-danger'}`}>
              <i className={`bi ${trend.positive ? 'bi-arrow-up-right' : 'bi-arrow-down-right'} me-1`}></i>
              {trend.text}
            </div>
          )}
        </div>

        <div
          className={`rounded-3 d-flex align-items-center justify-content-center bg-${color}-subtle text-${color} flex-shrink-0`}
          style={{ width: '46px', height: '46px' }}
        >
          <i className={`bi ${icon} fs-4`}></i>
        </div>
      </div>
    </div>
  );
}

