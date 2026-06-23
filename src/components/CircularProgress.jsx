import './CircularProgress.css';

export default function CircularProgress({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-green)" />
            <stop offset="100%" stopColor="var(--accent-gold)" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          className="circular-progress__bg"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress__bar"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke="url(#progressGradient)"
        />
      </svg>
      <div className="circular-progress__text">
        <span className="circular-progress__percentage">{Math.round(percentage)}</span>
        <span className="circular-progress__symbol">%</span>
      </div>
    </div>
  );
}
