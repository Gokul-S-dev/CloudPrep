import { useEffect } from 'react';

export default function Timer({
  timeRemaining,
  setTimeRemaining,
  onTimeUp,
  isActive = true
}) {
  useEffect(() => {
    if (!isActive) return;

    if (timeRemaining <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, setTimeRemaining, timeRemaining]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Warning thresholds: <= 10 min (600s), Critical <= 2 min (120s)
  let timerClass = '';
  if (timeRemaining <= 120) {
    timerClass = 'pv-timer-danger';
  } else if (timeRemaining <= 600) {
    timerClass = 'pv-timer-warning';
  }

  return (
    <div className={`pv-timer-container ${timerClass}`} title="Time Remaining">
      <i className={`bi ${timeRemaining <= 600 ? 'bi-alarm-fill' : 'bi-stopwatch'}`}></i>
      <span className="d-none d-md-inline text-white-50 small me-1">Time:</span>
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
}
