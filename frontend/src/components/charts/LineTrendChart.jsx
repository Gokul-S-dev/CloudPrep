export default function LineTrendChart({
  data = [],
  valueKey = 'score',
  labelKey = 'label',
  height = 220,
  emptyMessage = 'No data recorded yet.',
  unit = '%'
}) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-muted py-5 bg-light rounded-3 border border-dashed">
        <i className="bi bi-graph-up fs-2 mb-2 text-secondary"></i>
        <span className="small">{emptyMessage}</span>
      </div>
    );
  }

  const paddingX = 42;
  const paddingY = 24;
  const width = 560;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const maxVal = Math.max(100, ...data.map((d) => Number(d[valueKey] || 0)));
  const minVal = 0;

  const points = data.map((item, idx) => {
    const x =
      data.length === 1
        ? paddingX + plotWidth / 2
        : paddingX + (idx / (data.length - 1)) * plotWidth;
    const val = Number(item[valueKey] || 0);
    const y = paddingY + plotHeight - ((val - minVal) / (maxVal - minVal || 1)) * plotHeight;
    return { x, y, val, label: item[labelKey], item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints =
    points.length > 1
      ? `${points[0].x},${paddingY + plotHeight} ${polylinePoints} ${points[points.length - 1].x},${paddingY + plotHeight}`
      : '';

  const yTicks = [0, 25, 50, 70, 100];

  return (
    <div className="w-100">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-100 h-auto overflow-visible"
        role="img"
        aria-label="Performance trend chart"
      >
        <defs>
          <linearGradient id="cpAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0073e6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0073e6" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = paddingY + plotHeight - (tick / maxVal) * plotHeight;
          const isBenchmark = tick === 70;
          return (
            <g key={tick}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke={isBenchmark ? '#10b981' : '#e2e8f0'}
                strokeWidth={isBenchmark ? '1.25' : '1'}
                strokeDasharray={isBenchmark ? '4 4' : undefined}
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={isBenchmark ? '#059669' : '#64748b'}
                fontWeight={isBenchmark ? '600' : '400'}
              >
                {tick}{unit}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPoints && <polygon points={areaPoints} fill="url(#cpAreaGrad)" />}

        {/* Line */}
        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="#0073e6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}

        {/* Data dots & labels */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#ffffff"
              stroke="#0073e6"
              strokeWidth="2.5"
            />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#0c2340"
            >
              {p.val}{unit}
            </text>
            <text
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="10.5"
              fill="#64748b"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

