import { useState, useEffect, useCallback } from 'react';
import './App.css';

const MODES = {
  work: { label: '专注工作', duration: 25 * 60 },
  shortBreak: { label: '短休息', duration: 5 * 60 },
  longBreak: { label: '长休息', duration: 15 * 60 },
};

const SESSIONS_BEFORE_LONG_BREAK = 4;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function playNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [880, 660, 880, 660, 880, 660, 880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.2);
    });
  } catch {}
}

function App() {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const totalSeconds = MODES[mode].duration;
  const progress = 1 - timeLeft / totalSeconds;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  const switchMode = useCallback((nextMode) => {
    setMode(nextMode);
    setTimeLeft(MODES[nextMode].duration);
    setRunning(false);
  }, []);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        playNotification();

        if (Notification.permission === 'granted') {
          new Notification('番茄钟', {
            body: `${MODES[mode].label} 结束！`,
            icon: '/favicon.svg',
          });
        }

        if (mode === 'work') {
          const newSessions = sessions + 1;
          setSessions(newSessions);
          const next =
            newSessions % SESSIONS_BEFORE_LONG_BREAK === 0
              ? 'longBreak'
              : 'shortBreak';
          setTimeout(() => switchMode(next), 0);
        } else {
          setTimeout(() => switchMode('work'), 0);
        }
        return 0;
      }
      return prev - 1;
    });
  }, [mode, sessions, switchMode]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${MODES[mode].label}`;
  }, [timeLeft, mode]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStartPause = () => setRunning((r) => !r);

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const handleSkip = () => {
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      const next =
        newSessions % SESSIONS_BEFORE_LONG_BREAK === 0
          ? 'longBreak'
          : 'shortBreak';
      switchMode(next);
    } else {
      switchMode('work');
    }
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    switchMode(newMode);
  };

  return (
    <div className="app">
      <h1 className="title">番茄钟</h1>

      <div className="mode-tabs">
        {Object.entries(MODES).map(([key, { label }]) => (
          <button
            key={key}
            className={`mode-tab ${mode === key ? 'active' : ''}`}
            onClick={() => handleModeChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="timer-container">
        <svg className="progress-ring" viewBox="0 0 300 300">
          <circle
            className="progress-ring-bg"
            cx="150"
            cy="150"
            r="140"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-fill"
            cx="150"
            cy="150"
            r="140"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 150 150)"
          />
        </svg>
        <div className="timer-display">
          <span className="time">{formatTime(timeLeft)}</span>
          <span className="mode-label">{MODES[mode].label}</span>
        </div>
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={handleStartPause}>
          {running ? '暂停' : '开始'}
        </button>
        <button className="btn" onClick={handleReset}>
          重置
        </button>
        <button className="btn" onClick={handleSkip}>
          跳过
        </button>
      </div>

      <div className="session-info">
        <span>
          已完成 <strong>{sessions}</strong> 个番茄
        </span>
        {sessions > 0 && (
          <span className="session-progress">
            {SESSIONS_BEFORE_LONG_BREAK -
              (sessions % SESSIONS_BEFORE_LONG_BREAK ||
                SESSIONS_BEFORE_LONG_BREAK)}{' '}
            个后长休息
          </span>
        )}
      </div>
    </div>
  );
}

export default App;
