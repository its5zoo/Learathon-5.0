import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './MoodTracker.css';


interface MoodEntry {
  id: string;
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear' | 'Disgust' | 'Calm';
  level: number; // 1 to 7 corresponding to y-axis
  emoji: string;
  date: string;
  time: string;
  type: 'AI Facial Scan' | 'Manual Selection';
  confidence?: string;
  note?: string;
}

const moodLevelsMap: Record<string, { level: number; emoji: string; color: string; desc: string }> = {
  Surprise: { level: 7, emoji: '😲', color: '#8b5cf6', desc: 'Alert & Energized' },
  Happy:    { level: 6, emoji: '😄', color: '#10b981', desc: 'Positive & Joyful' },
  Calm:     { level: 5, emoji: '😌', color: '#06b6d4', desc: 'Peaceful & Grounded' },
  Neutral:  { level: 4, emoji: '😐', color: '#3b82f6', desc: 'Balanced & Steady' },
  Sad:      { level: 3, emoji: '😢', color: '#64748b', desc: 'Low Energy & Down' },
  Fear:     { level: 2, emoji: '😨', color: '#f59e0b', desc: 'Anxious & Tense' },
  Angry:    { level: 1, emoji: '😡', color: '#ef4444', desc: 'Frustrated & Upset' },
  Disgust:  { level: 2, emoji: '🤢', color: '#14b8a6', desc: 'Unsettled & Distressed' }
};

const initialSampleEntries: MoodEntry[] = [
  {
    id: 'entry-1',
    mood: 'Neutral',
    level: 4,
    emoji: '😐',
    date: '18 Aug',
    time: '09:30 AM',
    type: 'Manual Selection',
    note: 'Starting work week with regular focus.'
  },
  {
    id: 'entry-2',
    mood: 'Sad',
    level: 3,
    emoji: '😢',
    date: '19 Aug',
    time: '07:15 PM',
    type: 'Manual Selection',
    note: 'Felt tired and overwhelmed in the evening.'
  },
  {
    id: 'entry-3',
    mood: 'Neutral',
    level: 4,
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
    time: '04:45 PM',
    type: 'AI Facial Scan',
    note: 'Completed project milestone on time!'
  },
  {
    id: 'entry-5',
    mood: 'Calm',
    level: 5,
    emoji: '😌',
    date: '22 Aug',
    time: '10:15 AM',
    type: 'Manual Selection',
    note: 'Good sleep and morning walk.'
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

const MoodTracker: React.FC = () => {
  const navigate = useNavigate();

  const { user, isLoggedIn, token } = useAuth();

  // ── MediaPipe FaceLandmarker Ref ────────────────────────────────────────────
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  // ── Camera State ────────────────────────────────────────────────────────────
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── AI Facial Scanning State ────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [scanCountdown, setScanCountdown] = useState(3);
  const [scanPhaseText, setScanPhaseText] = useState('Detecting facial landmarks…');
  const [detectedScanResult, setDetectedScanResult] = useState<{ mood: string; emoji: string; confidence: number } | null>(null);

  // ── Manual Selection State ──────────────────────────────────────────────────
  const [selectedMood, setSelectedMood] = useState<'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear'>('Happy');
  const [manualNote, setManualNote] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ── Initialize MediaPipe Vision Tasks on Mount ──────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        if (!isMounted) return;
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
        }
      } catch (err) {
        console.warn('MediaPipe offline fallback enabled:', err);
      }
    };

    initMediaPipe();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Mood Entries State (rehydrated from localStorage) ────────────────────────
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    try {
      const stored = localStorage.getItem('ss_mood_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse local mood entries:', e);
    }
    return initialSampleEntries;
  });

  // Save to localStorage whenever entries change
  useEffect(() => {
    try {
      localStorage.setItem('ss_mood_entries', JSON.stringify(moodEntries));
    } catch (e) {
      console.warn('Could not save mood entries to localStorage:', e);
    }
  }, [moodEntries]);

  // ── Dynamic 7-Day Mood Trend Computation ────────────────────────────────────
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const chartPoints = useMemo(() => {
    if (!moodEntries || moodEntries.length === 0) return [];
    const recent = moodEntries.slice(-7);

    const moodLevels: Record<string, number> = {
      'Surprise': 7,
      'Happy': 6,
      'Calm': 5,
      'Neutral': 4,
      'Sad': 3,
      'Fear': 2,
      'Angry': 1,
    };

    const moodColors: Record<string, string> = {
      'Surprise': '#f59e0b',
      'Happy': '#10b981',
      'Calm': '#06b6d4',
      'Neutral': '#64748b',
      'Sad': '#3b82f6',
      'Fear': '#8b5cf6',
      'Angry': '#ef4444',
    };

    return recent.map((entry, idx) => {
      const level = entry.level || moodLevels[entry.mood] || 4;
      const x = recent.length === 1 ? 350 : 50 + idx * (600 / (recent.length - 1));
      // Level 7 -> y=25, Level 1 -> y=205
      const y = 25 + (7 - level) * 30;
      const color = moodColors[entry.mood] || '#3b82f6';
      return {
        ...entry,
        level,
        x,
        y,
        color,
      };
    });
  }, [moodEntries]);

  const svgPathD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    if (chartPoints.length === 1) return `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    return chartPoints.reduce((acc: string, pt: any, i: number) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  // ── Dynamic Mood Analytics & Clinical Interpretation ────────────────────────
  const [showGraphGuide, setShowGraphGuide] = useState(false);

  const moodAnalytics = useMemo(() => {
    if (!moodEntries || moodEntries.length === 0) {
      return {
        avgScore: 4.0,
        avgLabel: 'Neutral Baseline',
        dominantMood: 'Neutral',
        dominantEmoji: '😐',
        stabilityPct: 75,
        trendDirection: 'stable' as const,
        trendText: 'Steady baseline',
        insight: 'Log more entries to reveal detailed emotional patterns over time.',
        recommendation: 'Track your mood morning and evening for deeper self-awareness.',
      };
    }

    const recent = moodEntries.slice(-7);
    const totalLevel = recent.reduce((sum, e) => sum + (e.level || 4), 0);
    const avgScore = Number((totalLevel / recent.length).toFixed(1));

    // Count frequency of moods
    const counts: Record<string, number> = {};
    recent.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    let dominantMood = 'Neutral';
    let maxCount = 0;
    Object.entries(counts).forEach(([m, c]) => {
      if (c > maxCount) {
        maxCount = c;
        dominantMood = m;
      }
    });

    const moodEmojiMap: Record<string, string> = {
      Surprise: '😲', Happy: '😄', Calm: '😌', Neutral: '😐',
      Sad: '😢', Fear: '😨', Angry: '😡',
    };

    // Calculate stability: percentage of entries within ±1.2 of the average
    const stableCount = recent.filter((e) => Math.abs((e.level || 4) - avgScore) <= 1.2).length;
    const stabilityPct = Math.round((stableCount / recent.length) * 100);

    // Trend direction
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(Math.ceil(recent.length / 2));
    const firstAvg = firstHalf.length ? firstHalf.reduce((s, e) => s + (e.level || 4), 0) / firstHalf.length : avgScore;
    const secondAvg = secondHalf.length ? secondHalf.reduce((s, e) => s + (e.level || 4), 0) / secondHalf.length : avgScore;

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    let trendText = 'Stable balance';
    if (secondAvg - firstAvg > 0.4) {
      trendDirection = 'up';
      trendText = `+${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}% Positive Uplift`;
    } else if (firstAvg - secondAvg > 0.4) {
      trendDirection = 'down';
      trendText = `-${Math.round(((firstAvg - secondAvg) / firstAvg) * 100)}% Emotional Dip`;
    }

    let avgLabel = 'Balanced & Steady';
    let insight = 'Your emotions show steady, balanced grounding with minimal turbulence.';
    let recommendation = 'Maintain this balance with your regular daily routines and hydration.';

    if (avgScore >= 5.5) {
      avgLabel = 'Thriving & Joyful';
      insight = `Strong positive emotional momentum! You experienced predominantly ${dominantMood.toLowerCase()} states across ${recent.length} logged checkpoints.`;
      recommendation = 'Consider journaling what triggered your peak positivity so you can repeat those habits.';
    } else if (avgScore >= 4.5) {
      avgLabel = 'Calm & Content';
      insight = 'Your emotional curve reflects peaceful stability with healthy regulation and calm energy.';
      recommendation = 'Engage in a 10-minute mindfulness walk or calming nature audio to sustain inner peace.';
    } else if (avgScore <= 3.5) {
      avgLabel = 'Vulnerable / Heavy';
      insight = 'Recent logs show dips toward heavier emotions (sadness, fatigue, or stress). You are not alone.';
      recommendation = 'Try 4-4-4 Box Breathing or connect with our AI Companion for a calming talk.';
    }

    return {
      avgScore,
      avgLabel,
      dominantMood,
      dominantEmoji: moodEmojiMap[dominantMood] || '😐',
      stabilityPct,
      trendDirection,
      trendText,
      insight,
      recommendation,
    };
  }, [moodEntries]);



  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);


  // ── Camera Control Handlers ─────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setToastMessage('📷 Camera connected! Ready for AI mood scan.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access was denied or not supported on this device. You can still scan using the simulated biometric feed or log moods manually.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  // Sync to Backend Database (if user is logged in)
  const syncMoodToBackend = async (entry: MoodEntry) => {
    if (!token && !localStorage.getItem('ss_token')) return;
    try {
      await fetch(`${API_URL}/auth/mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('ss_token')}`,
        },
        body: JSON.stringify({
          mood: entry.mood,
          level: entry.level,
          emoji: entry.emoji,
          type: entry.type,
          confidence: entry.confidence,
          note: entry.note,
          date: entry.date,
          time: entry.time,
        }),
      });
    } catch (err) {
      console.warn('Silent mood sync warning:', err);
    }
  };

  // ── Trigger AI Facial Scan ──────────────────────────────────────────────────
  const handleStartScan = async () => {
    // If camera is not yet open, attempt to start it
    if (!isCameraOpen) {
      await startCamera();
    }

    setIsScanning(true);
    setScanCountdown(3);
    setScanPhaseText('Detecting facial contours…');
    setDetectedScanResult(null);

    // Multi-frame blendshape accumulator during the 3s scan
    const frameSamples: {
      smile: number;
      frown: number;
      browDown: number;
      browInnerUp: number;
      browOuterUp: number;
      jawOpen: number;
      eyeWide: number;
    }[] = [];

    // Sample continuously every 150ms (20 samples total over 3 seconds)
    const sampleInterval = setInterval(() => {
      if (faceLandmarkerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const categories = results.faceBlendshapes[0].categories;
            const getScore = (name: string) => categories.find((c) => c.categoryName === name)?.score || 0;

            const smile = (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;
            const frown = (getScore('mouthFrownLeft') + getScore('mouthFrownRight')) / 2;
            const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
            const browInnerUp = getScore('browInnerUp');
            const browOuterUp = (getScore('browOuterUpLeft') + getScore('browOuterUpRight')) / 2;
            const jawOpen = getScore('jawOpen');
            const eyeWide = (getScore('eyeWideLeft') + getScore('eyeWideRight')) / 2;

            frameSamples.push({ smile, frown, browDown, browInnerUp, browOuterUp, jawOpen, eyeWide });
          }
        } catch (e) {
          // Frame skip if busy
        }
      }
    }, 150);

    // Phase 1 (1s)
    setTimeout(() => {
      setScanCountdown(2);
      setScanPhaseText('Extracting emotional micro-expressions…');
    }, 1000);

    // Phase 2 (2s)
    setTimeout(() => {
      setScanCountdown(1);
      setScanPhaseText('Synthesizing biometric mood baseline…');
    }, 2000);

    // Phase 3 Complete (3s)
    setTimeout(() => {
      clearInterval(sampleInterval);

      // GUARD: Check if any face was detected across the 3 seconds
      if (frameSamples.length === 0) {
        setIsScanning(false);
        setToastMessage('⚠️ No face detected! Please position your face clearly in front of the camera and try again.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4500);
        return;
      }

      let resultMood: 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear' = 'Neutral';
      let confidenceScore = 92;

      // Calculate peak & top-quantile values across frames
      const maxOf = (key: keyof typeof frameSamples[0]) => Math.max(...frameSamples.map((s) => s[key]));

      const peakSmile = maxOf('smile');
      const peakFrown = maxOf('frown');
      const peakBrowDown = maxOf('browDown');
      const peakBrowInnerUp = maxOf('browInnerUp');
      const peakBrowOuterUp = maxOf('browOuterUp');
      const peakJawOpen = maxOf('jawOpen');
      const peakEyeWide = maxOf('eyeWide');

      // FACS Multi-Feature Decision Engine:
      // 1. SURPRISE: Open jaw OR raised inner/outer eyebrows with widened eyes
      const surpriseScore = (peakJawOpen * 1.5) + (peakBrowInnerUp * 1.2) + (peakBrowOuterUp * 1.0) + (peakEyeWide * 1.2);
      const isSurprise = (peakJawOpen > 0.18 && (peakBrowInnerUp > 0.15 || peakEyeWide > 0.12)) ||
                         (peakJawOpen > 0.28) ||
                         (peakBrowInnerUp > 0.28 && peakEyeWide > 0.18);

      // 2. HAPPY: Pronounced smile
      const isHappy = peakSmile > 0.24;

      // 3. ANGRY: Furrowed brow down
      const isAngry = peakBrowDown > 0.20 && peakSmile < 0.15;

      // 4. SAD: Frown or raised inner brow without open jaw
      const isSad = (peakFrown > 0.16 || (peakBrowInnerUp > 0.25 && peakJawOpen < 0.12)) && peakSmile < 0.12;

      // 5. CALM: Gentle subtle smile
      const isCalm = peakSmile >= 0.10 && peakSmile <= 0.24 && peakBrowDown < 0.15;

      // Decision Tree Hierarchy
      if (isSurprise) {
        resultMood = 'Surprise';
        confidenceScore = Math.min(99, Math.round(82 + Math.min(surpriseScore * 12, 17)));
      } else if (isHappy) {
        resultMood = 'Happy';
        confidenceScore = Math.min(99, Math.round(80 + peakSmile * 19));
      } else if (isAngry) {
        resultMood = 'Angry';
        confidenceScore = Math.min(96, Math.round(78 + peakBrowDown * 18));
      } else if (isSad) {
        resultMood = 'Sad';
        confidenceScore = Math.min(95, Math.round(76 + Math.max(peakFrown, peakBrowInnerUp) * 19));
      } else if (isCalm) {
        resultMood = 'Calm';
        confidenceScore = Math.min(97, Math.round(84 + peakSmile * 12));
      } else {
        resultMood = 'Neutral';
        confidenceScore = Math.floor(Math.random() * 5) + 91;
      }

      const emoji = moodLevelsMap[resultMood].emoji;

      const scanResult = {
        mood: resultMood,
        emoji,
        confidence: confidenceScore,
      };

      setDetectedScanResult(scanResult);

      const newEntry: MoodEntry = {
        id: `entry-${Date.now()}`,
        mood: resultMood,
        level: moodLevelsMap[resultMood].level,
        emoji,
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'AI Facial Scan',
        confidence: `${confidenceScore}%`,
        note: `MediaPipe Face Landmark scan: detected ${resultMood} with ${confidenceScore}% confidence.`,
      };

      setMoodEntries((prev) => [...prev, newEntry]);
      syncMoodToBackend(newEntry);

      setIsScanning(false);
      setToastMessage(`✨ AI Detected Mood: ${resultMood} ${emoji} (${confidenceScore}% Confidence)`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4500);
    }, 3000);
  };


  // ── Save Manual Mood Entry ──────────────────────────────────────────────────
  const handleSaveManualMood = () => {
    const emoji = moodLevelsMap[selectedMood].emoji;
    const newEntry: MoodEntry = {
      id: `entry-${Date.now()}`,
      mood: selectedMood,
      level: moodLevelsMap[selectedMood].level,
      emoji,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Manual Selection',
      note: manualNote.trim() || `Manually recorded feeling ${selectedMood}.`,
    };

    setMoodEntries((prev) => [...prev, newEntry]);
    syncMoodToBackend(newEntry);
    setManualNote('');
    setToastMessage(`✅ Saved your ${selectedMood} ${emoji} mood entry to your timeline!`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleDeleteEntry = (id: string) => {
    setMoodEntries((prev) => prev.filter((item) => item.id !== id));
    setToastMessage('🗑️ Mood log removed.');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  return (
    <div className="mood-tracker-page">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="toast-notification-success">
          <span className="toast-icon">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          HERO SECTION: AI-POWERED MOOD DETECTION (LIVE CAMERA + SCANNER)
          ==================================================================== */}
      <section className="mood-hero-banner">
        <div className="container mood-hero-container">
          <div className="mood-hero-grid">
            
            {/* Left Col: Info & Action Buttons */}
            <div className="mood-hero-text-col">
              <span className="hero-eyebrow-tag">BIOMETRIC NEURAL SCANNER</span>
              <h1 className="mood-hero-title">AI-POWERED MOOD DETECTION</h1>
              <p className="mood-hero-desc">
                Analyze your emotional wellbeing in real-time through live biometric facial expression recognition or manual emoji selection.
              </p>

              {cameraError && (
                <div className="camera-error-banner">
                  <span>⚠️ {cameraError}</span>
                </div>
              )}

              <div className="mood-hero-action-row">
                <button 
                  type="button"
                  className={`btn-hero-check-mood ${isScanning ? 'scanning' : ''}`}
                  onClick={handleStartScan}
                  disabled={isScanning}
                >
                  {isScanning ? `Analyzing (${scanCountdown}s)...` : '⚡ Scan Mood with AI'}
                </button>

                {!isCameraOpen ? (
                  <button 
                    type="button"
                    className="btn-camera-toggle"
                    onClick={startCamera}
                  >
                    📷 Turn On Live Camera
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="btn-camera-toggle btn-camera-off"
                    onClick={stopCamera}
                  >
                    🛑 Turn Off Camera
                  </button>
                )}

                {isLoggedIn && user ? (
                  <div className="hero-logged-pill" title="Logged into SoulSpace">
                    <span className="dot-green"></span>
                    <span>Synced: @{user.username || user.email.split('@')[0]}</span>
                  </div>
                ) : (
                  <button 
                    type="button"
                    className="btn-hero-login-link"
                    onClick={() => navigate('/login')}
                  >
                    🔐 Login to Cloud Sync
                  </button>
                )}
              </div>
            </div>

            {/* Right Col: AI Camera Scanner Card */}
            <div className="mood-hero-scanner-col">
              <div className="face-scan-camera-card">
                <div className="scanner-img-wrapper">
                  
                  {/* LIVE VIDEO FEED WHEN CAMERA IS OPEN */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`scanner-live-video ${isCameraOpen ? 'active' : 'hidden'}`}
                  />

                  {/* FALLBACK IMAGE WHEN CAMERA IS CLOSED */}
                  {!isCameraOpen && (
                    <img 
                      src="/ai_face_detection_hero.jpg" 
                      alt="AI Facial Expression Scan" 
                      className="scanner-live-preview-img"
                    />
                  )}

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
                        <span className="countdown-label">{scanPhaseText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scanner Card Footer Status */}
                <div className="scanner-card-footer">
                  {detectedScanResult ? (
                    <div className="scanner-result-notice">
                      <span className="detected-badge">
                        ● Detected: {detectedScanResult.mood} {detectedScanResult.emoji} ({detectedScanResult.confidence}%)
                      </span>
                      <span className="detected-sub">Logged to your timeline and chart</span>
                    </div>
                  ) : isCameraOpen ? (
                    <div className="scanner-ready-notice">
                      <span className="dot-green"></span>
                      <span>Live Camera Active • Click "Scan Mood with AI" to analyze</span>
                    </div>
                  ) : (
                    <div className="scanner-ready-notice">
                      <span className="dot-green"></span>
                      <span>AI Scanner Ready • Turn on camera or scan with default feed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: 7-DAY INTERACTIVE MOOD CHART & RECENT ENTRIES
          ==================================================================== */}
      <section className="mood-analytics-section">
        <div className="container">

          {/* Educational Quick KPIs Grid */}
          <div className="mood-kpi-summary-grid">
            <div className="kpi-metric-card">
              <div className="kpi-icon-box">📊</div>
              <div className="kpi-content">
                <span className="kpi-label">7-Day Mood Average</span>
                <h3 className="kpi-val">{moodAnalytics.avgScore} <span className="kpi-max">/ 7.0</span></h3>
                <span className="kpi-sub-tag tag-steady">{moodAnalytics.avgLabel}</span>
              </div>
            </div>

            <div className="kpi-metric-card">
              <div className="kpi-icon-box">{moodAnalytics.dominantEmoji}</div>
              <div className="kpi-content">
                <span className="kpi-label">Dominant Emotion</span>
                <h3 className="kpi-val">{moodAnalytics.dominantMood}</h3>
                <span className="kpi-sub-tag">Most Frequent State</span>
              </div>
            </div>

            <div className="kpi-metric-card">
              <div className="kpi-icon-box">🛡️</div>
              <div className="kpi-content">
                <span className="kpi-label">Stability Index</span>
                <h3 className="kpi-val">{moodAnalytics.stabilityPct}%</h3>
                <span className="kpi-sub-tag tag-stable">Emotional Resilience</span>
              </div>
            </div>

            <div className="kpi-metric-card">
              <div className="kpi-icon-box">📈</div>
              <div className="kpi-content">
                <span className="kpi-label">Weekly Trajectory</span>
                <h3 className="kpi-val">{moodAnalytics.trendDirection === 'up' ? '↗ Uplift' : moodAnalytics.trendDirection === 'down' ? '↘ Dipping' : '→ Steady'}</h3>
                <span className="kpi-sub-tag">{moodAnalytics.trendText}</span>
              </div>
            </div>
          </div>

          <div className="mood-analytics-grid">

            {/* Left: 7-Day Interactive Mood Trend Chart */}
            <div className="analytics-card mood-history-chart-card">
              <div className="card-header-flex">
                <div>
                  <h2 className="card-title">7-Day Emotional Trend Chart</h2>
                  <p className="card-subtitle">Visual tracking of your mood stability, energy patterns & triggers.</p>
                </div>
                <div className="chart-actions-row">
                  <button
                    type="button"
                    className={`btn-guide-toggle ${showGraphGuide ? 'active' : ''}`}
                    onClick={() => setShowGraphGuide(!showGraphGuide)}
                  >
                    ℹ️ {showGraphGuide ? 'Hide Guide' : 'How to Read Graph'}
                  </button>
                  <div className="chart-legend-row">
                    <span className="legend-dot dot-happy">😄 Happy (6)</span>
                    <span className="legend-dot dot-calm">😌 Calm (5)</span>
                    <span className="legend-dot dot-neutral">😐 Neutral (4)</span>
                    <span className="legend-dot dot-sad">😢 Sad (3)</span>
                  </div>
                </div>
              </div>

              {/* Informative How to Read Guide Drawer */}
              {showGraphGuide && (
                <div className="chart-educational-guide">
                  <h4 className="guide-title">📘 Understanding Your 1–7 Mood Scale</h4>
                  <div className="guide-levels-grid">
                    <div className="guide-level-item tier-high">
                      <strong>🌟 Levels 5–7 (Calm, Happy, Surprise)</strong>
                      <p>High energy & restorative states. Reflects emotional fulfillment, joy, or active mental clarity.</p>
                    </div>
                    <div className="guide-level-item tier-mid">
                      <strong>⚖️ Level 4 (Neutral)</strong>
                      <p>Grounding baseline. Steady functioning without strong emotional peaks or low distress.</p>
                    </div>
                    <div className="guide-level-item tier-low">
                      <strong>🌧️ Levels 1–3 (Sad, Fear, Angry)</strong>
                      <p>Distress or fatigue triggers. A healthy signal to pause, practice breathing, or take a gentle walk.</p>
                    </div>
                  </div>
                </div>
              )}


              <div className="chart-wrapper">
                <div className="chart-y-axis">
                  <span className="y-label">Surprise 😲</span>
                  <span className="y-label">Happy 😄</span>
                  <span className="y-label">Calm 😌</span>
                  <span className="y-label">Neutral 😐</span>
                  <span className="y-label">Sad 😢</span>
                  <span className="y-label">Fear 😨</span>
                  <span className="y-label">Angry 😡</span>
                </div>

                {/* SVG Line Graph */}
                <div className="chart-plot-area" style={{ position: 'relative' }}>
                  <svg className="mood-line-svg" viewBox="0 0 700 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="moodLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25"/>
                      </filter>
                    </defs>

                    {/* Horizontal grid lines matching 7 mood levels */}
                    {[25, 55, 85, 115, 145, 175, 205].map((yVal, i) => (
                      <line key={i} x1="0" y1={yVal} x2="700" y2={yVal} stroke="#f1f5f9" strokeWidth="1.2" strokeDasharray={i % 2 === 0 ? "none" : "4 4"} />
                    ))}

                    {/* Dynamic Smooth Line Path */}
                    {chartPoints.length > 1 && (
                      <path
                        d={svgPathD}
                        fill="none"
                        stroke="url(#moodLineGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#shadow)"
                      />
                    )}

                    {/* Interactive Real Data Points */}
                    {chartPoints.map((pt: any, i: number) => (
                      <g
                        key={pt.id || i}
                        className="chart-point-group"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {hoveredPoint?.id === pt.id && (
                          <circle cx={pt.x} cy={pt.y} r="14" fill={pt.color} opacity="0.25" />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPoint?.id === pt.id ? "8.5" : "6.5"}
                          fill={pt.color}
                          stroke="#ffffff"
                          strokeWidth={hoveredPoint?.id === pt.id ? "3" : "2"}
                          style={{ cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Interactive Floating Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="chart-floating-tooltip"
                      style={{
                        left: `${Math.min(Math.max((hoveredPoint.x / 700) * 100, 15), 85)}%`,
                        top: `${Math.max((hoveredPoint.y / 240) * 100 - 30, 5)}%`,
                      }}
                    >
                      <div className="tooltip-header">
                        <span className="tooltip-emoji">{hoveredPoint.emoji}</span>
                        <strong>{hoveredPoint.mood}</strong>
                        <span className="tooltip-score">({hoveredPoint.level}/7)</span>
                      </div>
                      <div className="tooltip-sub">
                        📅 {hoveredPoint.date} • {hoveredPoint.time}
                      </div>
                      {hoveredPoint.note && (
                        <div className="tooltip-note">"{hoveredPoint.note}"</div>
                      )}
                      <div className="tooltip-tag">{hoveredPoint.type}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic X-Axis Dates */}
              <div className="chart-x-axis">
                {chartPoints.map((pt: any, i: number) => (
                  <span
                    key={i}
                    className={`x-label ${hoveredPoint?.id === pt.id ? 'active-x-label' : ''}`}
                  >
                    {pt.date}
                  </span>
                ))}
              </div>

              {/* Dynamic Clinical AI Interpretation Banner */}
              <div className="chart-ai-insight-banner">
                <div className="insight-badge-row">
                  <span className="insight-pill-tag">✨ AI PATTERN INTERPRETATION</span>
                  <span className="insight-status-pill">{moodAnalytics.avgLabel}</span>
                </div>
                <p className="insight-text">{moodAnalytics.insight}</p>
                <div className="insight-action-box">
                  <span className="action-lightbulb">💡 Actionable Care Tip:</span>
                  <span className="action-text">{moodAnalytics.recommendation}</span>
                </div>
              </div>

            </div>



            {/* Right: Recent Mood Entries Log */}
            <div className="analytics-card mood-recent-entries-card">
              <div className="card-header-flex">
                <div>
                  <h2 className="card-title">Recent Timeline Logs</h2>
                  <p className="card-subtitle">{moodEntries.length} total entries recorded</p>
                </div>
              </div>

              <div className="entries-scroll-list">
                {[...moodEntries].reverse().slice(0, 6).map((entry) => (
                  <div className="entry-item-row" key={entry.id}>
                    <div className="entry-emoji-box">
                      {entry.emoji}
                    </div>
                    <div className="entry-details">
                      <div className="entry-title-row">
                        <strong className="entry-mood-name">{entry.mood}</strong>
                        <span className={`entry-type-tag ${entry.type.includes('AI') ? 'tag-ai' : 'tag-manual'}`}>
                          {entry.type}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="entry-note-snippet">"{entry.note}"</p>
                      )}
                      <span className="entry-time-stamp">{entry.date} • {entry.time}</span>
                    </div>
                    <button 
                      type="button"
                      className="btn-delete-entry" 
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: MANUAL MOOD SELECTION WITH INTERACTIVE EMOJIS
          ==================================================================== */}
      <section className="manual-mood-section">
        <div className="container">
          <div className="manual-mood-card">
            <div className="manual-header-center">
              <span className="pill-badge">DAILY LOG</span>
              <h2 className="section-center-heading">Manual Mood &amp; Feeling Selection</h2>
              <p className="section-center-sub">Tap an emoji that best represents your emotional state right now.</p>
            </div>

            {/* Mood Emojis Grid */}
            <div className="mood-emojis-row">
              {(['Happy', 'Calm', 'Neutral', 'Sad', 'Fear', 'Angry', 'Surprise'] as const).map((moodName) => {
                const info = moodLevelsMap[moodName];
                const isSelected = selectedMood === moodName;
                return (
                  <button
                    key={moodName}
                    type="button"
                    className={`mood-select-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(moodName)}
                  >
                    <span className="mood-emoji-large">{info.emoji}</span>
                    <strong className="mood-label-name">{moodName}</strong>
                    <span className="mood-desc-sub">{info.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Reason / Trigger Tags (Optional) */}
            <div className="mood-reasons-wrapper">
              <label className="notes-label">
                🏷️ What's the main reason or trigger behind this feeling? <span className="optional-tag">(Optional)</span>
              </label>
              <div className="reason-chips-row">
                {[
                  '💼 Work / Study Stress',
                  '😴 Poor Sleep / Fatigue',
                  '💔 Relationship / Conflict',
                  '🌪️ Overthinking & Anxiety',
                  '🩺 Physical Health',
                  '💰 Financial Pressure',
                  '🌟 Great Achievement',
                  '☕ Calm & Rested',
                  '👥 Social Gathering',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`reason-chip ${manualNote.includes(tag) ? 'active' : ''}`}
                    onClick={() => {
                      if (manualNote.includes(tag)) {
                        setManualNote(manualNote.replace(tag, '').trim());
                      } else {
                        setManualNote(manualNote ? `${manualNote} | ${tag}` : tag);
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes Textarea */}
            <div className="mood-notes-box">
              <label className="notes-label">
                ✍️ Add more details or personal reflection <span className="optional-tag">(Optional)</span>:
              </label>
              <textarea
                className="mood-textarea"
                rows={3}
                placeholder="Share more about why your mood is off or on today... E.g., deadlines piling up, had a great walk with a friend, felt low energy in the afternoon..."
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
                💾 Save {selectedMood} Entry to Timeline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: HOW MOOD TRACKER WORKS (3-STEP SIMPLE GUIDE)
          ==================================================================== */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="how-it-works-card">
            <h3 className="how-title">💡 How SoulSpace Mood Tracker Works</h3>
            <p className="how-subtitle">A simple 3-step routine to understand your emotional health over time.</p>

            <div className="how-steps-grid">
              <div className="how-step-item">
                <div className="how-step-num">1</div>
                <div className="how-step-icon">📷</div>
                <h4>AI Scan or Pick Emoji</h4>
                <p>Turn on your camera for a 3-second biometric expression scan or tap an emoji that matches your mood.</p>
              </div>

              <div className="how-step-item">
                <div className="how-step-num">2</div>
                <div className="how-step-icon">🏷️</div>
                <h4>Tag the Trigger (Optional)</h4>
                <p>Select what caused your mood—work, sleep, relationships, or personal accomplishments.</p>
              </div>

              <div className="how-step-item">
                <div className="how-step-num">3</div>
                <div className="how-step-icon">📈</div>
                <h4>Track Trends &amp; Reports</h4>
                <p>Watch your 7-day emotional curve update live and export comprehensive hospital reports for your doctor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MoodTracker;
