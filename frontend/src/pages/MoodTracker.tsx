import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MoodTracker.css';

interface MoodEntry {
  id: string;
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear' | 'Disgust';
  level: number; // 1 to 7 corresponding to y-axis
  emoji: string;
  date: string;
  time: string;
  type: 'AI Facial Scan' | 'Manual Selection';
  confidence?: string;
  note?: string;
}

const moodLevelsMap: Record<string, { level: number; emoji: string; color: string }> = {
  Surprise: { level: 7, emoji: '😲', color: '#8b5cf6' },
  Happy: { level: 6, emoji: '😄', color: '#10b981' },
  Neutral: { level: 5, emoji: '😐', color: '#3b82f6' },
  Sad: { level: 4, emoji: '😢', color: '#64748b' },
  Fear: { level: 3, emoji: '😨', color: '#f59e0b' },
  Disgust: { level: 2, emoji: '🤢', color: '#14b8a6' },
  Angry: { level: 1, emoji: '😡', color: '#ef4444' }
};

const initialSampleEntries: MoodEntry[] = [
  {
    id: 'entry-1',
    mood: 'Neutral',
    level: 5,
    emoji: '😐',
    date: '18 Aug',
    time: '09:30 AM',
    type: 'Manual Selection',
    note: 'Starting work week with regular focus.'
  },
  {
    id: 'entry-2',
    mood: 'Sad',
    level: 4,
    emoji: '😢',
    date: '19 Aug',
    time: '07:15 PM',
    type: 'Manual Selection',
    note: 'Felt tired and overwhelmed in the evening.'
  },
  {
    id: 'entry-3',
    mood: 'Neutral',
    level: 5,
    emoji: '😐',
    date: '20 Aug',
    time: '11:00 AM',
    type: 'AI Facial Scan',
    note: 'Mid-week balanced mental clarity.'
  },
  {
    id: 'entry-4',
    mood: 'Happy',
    level: 6,
    emoji: '😄',
    date: '21 Aug',
    time: '03:45 PM',
    type: 'AI Facial Scan',
    note: 'Enjoyed productive team collaboration.'
  },
  {
    id: 'entry-5',
    mood: 'Surprise',
    level: 7,
    emoji: '😲',
    date: '22 Aug',
    time: '01:20 PM',
    type: 'Manual Selection',
    note: 'Got good feedback on project goals.'
  },
  {
    id: 'entry-6',
    mood: 'Happy',
    level: 6,
    emoji: '😄',
    date: '23 Aug',
    time: '06:00 PM',
    type: 'AI Facial Scan',
    note: 'Relaxed evening mindfulness walk.'
  },
  {
    id: 'entry-7',
    mood: 'Happy',
    level: 6,
    emoji: '😄',
    date: 'Today',
    time: '08:30 AM',
    type: 'AI Facial Scan',
    note: 'Woke up feeling positive and clear-headed.'
  }
];

const past7Days = ['18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', 'Today'];

const MoodTracker: React.FC = () => {
  const navigate = useNavigate();
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // AI Facial Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanCountdown, setScanCountdown] = useState(5);
  const [detectedScanResult, setDetectedScanResult] = useState<{ mood: string; confidence: number } | null>(null);

  // Manual Selection state
  const [selectedMood, setSelectedMood] = useState<'Happy' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear' | 'Disgust'>('Happy');
  const [manualNote, setManualNote] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mood entries list
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(initialSampleEntries);
  const [selectedDateFilter, setSelectedDateFilter] = useState('2026-08-24');

  // Trigger AI Facial Scan
  const handleStartScan = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setIsScanning(true);
    setScanCountdown(5);
    setDetectedScanResult(null);

    const interval = setInterval(() => {
      setScanCountdown((prev) => {
        if (prev > 1) return prev - 1;
        clearInterval(interval);
        
        // Scan completed
        const detectedMoods = ['Happy', 'Neutral', 'Surprise'] as const;
        const resultMood = detectedMoods[Math.floor(Math.random() * detectedMoods.length)];
        const confidenceScore = Math.floor(Math.random() * 15) + 85; // 85-99%

        setDetectedScanResult({
          mood: resultMood,
          confidence: confidenceScore
        });

        // Add to entries
        const newEntry: MoodEntry = {
          id: `entry-${Date.now()}`,
          mood: resultMood,
          level: moodLevelsMap[resultMood].level,
          emoji: moodLevelsMap[resultMood].emoji,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'AI Facial Scan',
          confidence: `${confidenceScore}%`
        };

        setMoodEntries((prev) => [...prev, newEntry]);
        setIsScanning(false);
        setToastMessage(`AI Detected: ${resultMood} (${confidenceScore}% confidence)`);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        return 5;
      });
    }, 1000);
  };

  // Save Manual Mood Entry
  const handleSaveManualMood = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const newEntry: MoodEntry = {
      id: `entry-${Date.now()}`,
      mood: selectedMood,
      level: moodLevelsMap[selectedMood].level,
      emoji: moodLevelsMap[selectedMood].emoji,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Manual Selection',
      note: manualNote.trim() || undefined
    };

    setMoodEntries((prev) => [...prev, newEntry]);
    setManualNote('');
    setToastMessage(`Saved your ${selectedMood} mood entry successfully!`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleDeleteEntry = (id: string) => {
    setMoodEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="mood-tracker-page">
      {/* Toast notification */}
      {showSuccessToast && (
        <div className="toast-notification-success">
          <span className="toast-icon">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          HERO SECTION: AI-POWERED MOOD DETECTION
          ==================================================================== */}
      <section className="mood-hero-banner">
        <div className="container mood-hero-container">
          <div className="mood-hero-grid">
            
            {/* Left Col: Info & Actions */}
            <div className="mood-hero-text-col">
              <span className="hero-eyebrow-tag">BIOMETRIC NEURAL ANALYSIS</span>
              <h1 className="mood-hero-title">AI-POWERED MOOD DETECTION</h1>
              <p className="mood-hero-desc">
                Track your daily emotional wellbeing through AI-powered facial expression analysis or manual mood selection. 
                Track your mood instantly using advanced AI technology.
              </p>

              <div className="mood-hero-action-row">
                <button 
                  className={`btn-hero-check-mood ${isScanning ? 'scanning' : ''}`}
                  onClick={handleStartScan}
                  disabled={isScanning}
                >
                  {isScanning ? `Scanning Face (${scanCountdown}s)...` : 'Check Mood Now'}
                </button>

                {!isLoggedIn ? (
                  <button 
                    className="btn-hero-login-link"
                    onClick={() => navigate('/login')}
                  >
                    🔒 Login to Sync History
                  </button>
                ) : (
                  <div className="hero-logged-pill">
                    <span className="dot-green"></span>
                    <span>Logged In (User)</span>
                    <button className="btn-hero-logout" onClick={handleLogout}>Log Out</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: AI Camera Scanner Card */}
            <div className="mood-hero-scanner-col">
              <div className="face-scan-camera-card">
                <div className="scanner-img-wrapper">
                  <img 
                    src="/ai_face_detection_hero.jpg" 
                    alt="AI Facial Expression Scan" 
                    className="scanner-live-preview-img"
                  />

                  {/* Scanning Animation Laser Line */}
                  {isScanning && (
                    <div className="scanning-laser-beam"></div>
                  )}

                  {/* Facial landmarks mesh grid overlay */}
                  <div className="biometric-hud-overlay">
                    <div className="hud-corner top-left"></div>
                    <div className="hud-corner top-right"></div>
                    <div className="hud-corner bottom-left"></div>
                    <div className="hud-corner bottom-right"></div>

                    {isScanning && (
                      <div className="scan-countdown-badge">
                        <span className="countdown-ring"></span>
                        <span className="countdown-num">{scanCountdown}</span>
                        <span className="countdown-label">Analyzing Facial Markers</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scanner Card Footer Status */}
                <div className="scanner-card-footer">
                  {!isLoggedIn ? (
                    <div className="scanner-login-notice" onClick={() => navigate('/login')}>
                      <span>Login to capture and save your mood entries.</span>
                    </div>
                  ) : detectedScanResult ? (
                    <div className="scanner-result-notice">
                      <span className="detected-badge">● Detected: {detectedScanResult.mood} ({detectedScanResult.confidence}%)</span>
                      <span className="detected-sub">Saved to your personal chart</span>
                    </div>
                  ) : (
                    <div className="scanner-ready-notice">
                      <span className="dot-green"></span>
                      <span>AI Camera Ready • Click "Check Mood Now" to start scan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: YOUR MOOD HISTORY & RECENT MOOD ENTRIES
          ==================================================================== */}
      <section className="mood-analytics-section">
        <div className="container">
          <div className="mood-analytics-grid">

            {/* Left: 7-Day Interactive Mood Chart */}
            <div className="analytics-card mood-history-chart-card">
              <div className="analytics-card-header">
                <div>
                  <h3 className="chart-main-title">Your Mood History</h3>
                  <div className="chart-date-filter-row">
                    <label>Show from:</label>
                    <input 
                      type="date" 
                      className="date-input-field"
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                    />
                    <span className="date-hint-tag">(Last 7 days only)</span>
                  </div>
                  <p className="chart-sub-desc">Track how your mood has changed over the past 7 days.</p>
                </div>

                {isLoggedIn && (
                  <div className="chart-legend-badge">
                    <span className="legend-indicator"></span>
                    <span>Mood Level</span>
                  </div>
                )}
              </div>

              {/* Chart Canvas Area */}
              <div className="mood-chart-wrapper">
                {!isLoggedIn && (
                  <div className="chart-locked-backdrop">
                    <div className="locked-card-prompt">
                      <div className="lock-icon-circle">🔒</div>
                      <h4>Login to View Mood History</h4>
                      <p>Sign in to record your daily emotions and view your 7-day psychological trajectory.</p>
                      <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Login to View Activity
                      </button>
                    </div>
                  </div>
                )}

                <div className={`mood-chart-grid-container ${!isLoggedIn ? 'blurred' : ''}`}>
                  {/* Y-Axis Mood Levels */}
                  <div className="chart-y-axis">
                    {['Surprise', 'Happy', 'Neutral', 'Sad', 'Fear', 'Disgust', 'Angry'].map((moodName) => (
                      <div className="y-axis-label-row" key={moodName}>
                        <span className="y-mood-name">{moodName}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart Plot Area with dynamic SVG line */}
                  <div className="chart-plot-area">
                    <div className="chart-grid-lines">
                      {[7, 6, 5, 4, 3, 2, 1].map((lvl) => (
                        <div className="grid-horizontal-line" key={lvl}></div>
                      ))}
                    </div>

                    {/* SVG Line Graph */}
                    <svg className="mood-line-svg" viewBox="0 0 700 240" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="moodLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3f72af" />
                          <stop offset="50%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#3f72af" />
                        </linearGradient>
                      </defs>

                      {/* Line connecting points */}
                      <polyline
                        fill="none"
                        stroke="url(#moodLineGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="50,105 150,140 250,105 350,70 450,35 550,70 650,70"
                      />

                      {/* Points */}
                      {[
                        { cx: 50, cy: 105, mood: 'Neutral', day: '18 Aug' },
                        { cx: 150, cy: 140, mood: 'Sad', day: '19 Aug' },
                        { cx: 250, cy: 105, mood: 'Neutral', day: '20 Aug' },
                        { cx: 350, cy: 70, mood: 'Happy', day: '21 Aug' },
                        { cx: 450, cy: 35, mood: 'Surprise', day: '22 Aug' },
                        { cx: 550, cy: 70, mood: 'Happy', day: '23 Aug' },
                        { cx: 650, cy: 70, mood: 'Happy', day: 'Today' }
                      ].map((pt, i) => (
                        <g key={i} className="chart-point-group">
                          <circle cx={pt.cx} cy={pt.cy} r="6" className="chart-node-circle" />
                          <circle cx={pt.cx} cy={pt.cy} r="2" fill="#ffffff" />
                        </g>
                      ))}
                    </svg>

                    {/* X-Axis Days */}
                    <div className="chart-x-axis">
                      {past7Days.map((dayName, idx) => (
                        <div className="x-axis-day" key={idx}>
                          <span>{dayName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recent Mood Entries Activity */}
            <div className="analytics-card recent-entries-card">
              <div className="analytics-card-header">
                <h3 className="chart-main-title">Recent Mood Entries</h3>
                {isLoggedIn && (
                  <span className="entry-count-pill">{moodEntries.length} Recorded</span>
                )}
              </div>

              <div className="recent-entries-body">
                {!isLoggedIn ? (
                  <div className="entries-locked-state">
                    <p className="login-req-italic">Login to view your mood history.</p>
                    <button className="btn btn-outline btn-unlock-entries" onClick={() => navigate('/login')}>
                      🔒 Login to View Entries
                    </button>
                  </div>
                ) : moodEntries.length === 0 ? (
                  <div className="no-entries-placeholder">
                    <p>No mood entries recorded yet.</p>
                    <span>Use the AI Scanner or Manual selection below to record your first entry.</span>
                  </div>
                ) : (
                  <div className="entries-scroll-list">
                    {[...moodEntries].reverse().slice(0, 5).map((entry) => (
                      <div className="entry-item-row" key={entry.id}>
                        <div className="entry-emoji-box">
                          {entry.emoji}
                        </div>
                        <div className="entry-details">
                          <div className="entry-title-row">
                            <strong className="entry-mood-name">{entry.mood}</strong>
                            <span className="entry-type-tag">{entry.type}</span>
                          </div>
                          {entry.note && (
                            <p className="entry-note-snippet">"{entry.note}"</p>
                          )}
                          <span className="entry-time-stamp">{entry.date} • {entry.time}</span>
                        </div>
                        <button 
                          className="btn-delete-entry" 
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Delete entry"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: MANUAL MOOD SELECTION
          ==================================================================== */}
      <section className="manual-mood-section">
        <div className="container">
          <div className="manual-mood-card">
            <h2 className="section-center-heading">Manual Mood Selection</h2>
            <p className="section-center-sub">Select how you're feeling right now to keep an accurate emotional record.</p>

            {/* Mood Emojis Grid */}
            <div className="mood-emojis-row">
              {(['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'] as const).map((moodName) => (
                <button
                  key={moodName}
                  type="button"
                  className={`mood-select-pill ${selectedMood === moodName ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(moodName)}
                >
                  <span className="mood-emoji-large">{moodLevelsMap[moodName].emoji}</span>
                  <span className="mood-label-name">{moodName}</span>
                </button>
              ))}
            </div>

            {/* Optional Notes Textarea */}
            <div className="mood-notes-box">
              <textarea
                className="mood-textarea"
                rows={3}
                placeholder="Add any notes about how you're feeling today (optional)..."
                value={manualNote}
                maxLength={400}
                onChange={(e) => setManualNote(e.target.value)}
              />
              <span className="char-limit">{manualNote.length}/400</span>
            </div>

            {/* Submit Button */}
            <div className="manual-submit-row">
              <button 
                type="button" 
                className="btn-save-manual-mood"
                onClick={handleSaveManualMood}
              >
                Save Manual Mood
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: HOW TO USE AI MOOD DETECTION
          ==================================================================== */}
      <section className="how-to-ai-section">
        <div className="container">
          <div className="how-to-ai-card">
            
            {/* Left Biometric Icon */}
            <div className="how-to-icon-box">
              <div className="biometric-icon-wrapper">
                <svg viewBox="0 0 100 100" width="110" height="110" fill="none" xmlns="http://www.w3.org/2000/svg" className="biometric-main-svg">
                  {/* Scanner Frame Corners */}
                  <path d="M 16 32 L 16 20 A 4 4 0 0 1 20 16 L 32 16" stroke="#3f72af" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 84 32 L 84 20 A 4 4 0 0 0 80 16 L 68 16" stroke="#3f72af" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 16 68 L 16 80 A 4 4 0 0 0 20 84 L 32 84" stroke="#3f72af" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 84 68 L 84 80 A 4 4 0 0 1 80 84 L 68 84" stroke="#3f72af" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Clean Human Head & Body Outline */}
                  <circle cx="50" cy="38" r="14" stroke="#3f72af" strokeWidth="4" fill="none" />
                  <path d="M 28 76 C 28 62 38 56 50 56 C 62 56 72 62 72 76" stroke="#3f72af" strokeWidth="4" strokeLinecap="round" fill="none" />

                  {/* Verified Check Badge */}
                  <circle cx="74" cy="74" r="13" fill="#10b981" />
                  <path d="M 68 74 L 72 78 L 80 70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            {/* Right Instructions List */}
            <div className="how-to-instructions-col">
              <h3 className="how-to-title">How to use AI Mood Detection:</h3>
              <ul className="how-to-steps-list">
                <li>
                  <span className="step-num">1</span>
                  <span>Position yourself in front of the camera with good lighting</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>Click <strong>"Check Mood Now"</strong> to start a 5-second countdown</span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>Maintain a natural facial expression during the countdown</span>
                </li>
                <li>
                  <span className="step-num">4</span>
                  <span>The AI will analyze your expression and record your mood</span>
                </li>
                <li>
                  <span className="step-num">5</span>
                  <span>Your mood history will be updated on the chart below</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default MoodTracker;
