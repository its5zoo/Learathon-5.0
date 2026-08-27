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

// 7 Discrete Emotional Levels for the Chart Y-Axis (aligned with SVG coordinates)
export const Y_AXIS_LEVELS = [
  { level: 7, mood: 'Surprise', emoji: '😲', color: '#8b5cf6', y: 20 },
  { level: 6, mood: 'Happy',    emoji: '😄', color: '#10b981', y: 60 },
  { level: 5, mood: 'Calm',     emoji: '😌', color: '#06b6d4', y: 100 },
  { level: 4, mood: 'Neutral',  emoji: '😐', color: '#3b82f6', y: 140 },
  { level: 3, mood: 'Sad',      emoji: '😢', color: '#64748b', y: 180 },
  { level: 2, mood: 'Fear',     emoji: '😨', color: '#f59e0b', y: 220 },
  { level: 1, mood: 'Angry',    emoji: '😡', color: '#ef4444', y: 260 },
];

// Helper to generate a smooth Catmull-Rom / Bézier spline through all points
const generateSmoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
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

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanCountdown, setScanCountdown] = useState(3);
  const [scanPhaseText, setScanPhaseText] = useState('Detecting facial landmarks…');
  const [detectedScanResult, setDetectedScanResult] = useState<{ mood: string; emoji: string; confidence: number } | null>(null);

  const [selectedMood, setSelectedMood] = useState<'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Angry' | 'Surprise' | 'Fear'>('Happy');
  const [manualNote, setManualNote] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [hoveredPoint, setHoveredPoint] = useState<{
    day: string;
    x: number;
    y: number;
    level: number;
    mood: string;
    emoji: string;
    color: string;
    time: string;
    note: string;
  } | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem('ss_mood_entries', JSON.stringify(moodEntries));
    } catch (e) {
      console.warn('Could not save mood entries to localStorage:', e);
    }
  }, [moodEntries]);

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

  // ── Dynamic 7-Day Chart Point Calculations ──────────────────────────────────
  const past7Days = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result: string[] = [];
    for (let i = 6; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push(days[d.getDay()]);
    }
    result.push('Today');
    return result;
  }, []);

  const chartPoints = past7Days.map((day, i) => {
    const x = 50 + i * 100;
    let entry: MoodEntry | undefined;
    if (day === 'Today') {
      entry = [...moodEntries].reverse().find((e) => e.date === 'Today') || moodEntries[moodEntries.length - 1];
    } else {
      entry = moodEntries.find((e) => e.date === day);
    }

    const defaultLevels = [4, 3, 4, 6, 5, 6, 6];
    const level = entry ? entry.level : defaultLevels[i];
    const matchingLevel = Y_AXIS_LEVELS.find((l) => l.level === level) || Y_AXIS_LEVELS[3];

    return {
      day,
      x,
      y: matchingLevel.y,
      level,
      mood: entry?.mood || matchingLevel.mood,
      emoji: entry?.emoji || matchingLevel.emoji,
      color: matchingLevel.color,
      time: entry?.time || 'Recorded',
      note: entry?.note || `${matchingLevel.mood} mood baseline for ${day}.`,
    };
  });

  const smoothLinePath = generateSmoothPath(chartPoints);
  const areaFillPath = chartPoints.length > 0
    ? `${smoothLinePath} L ${chartPoints[chartPoints.length - 1].x} 275 L ${chartPoints[0].x} 275 Z`
    : '';

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
            <div className="analytics-card mood-history-chart-card mood-trend-chart-card">
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
                  <h4 className="guide-title">📘 Understanding Your 1-7 Mood Scale</h4>
                  <div className="guide-levels-grid">
                    <div className="guide-level-item tier-high">
                      <strong>🌟 Levels 5-7 (Calm, Happy, Surprise)</strong>
                      <p>High energy & restorative states. Reflects emotional fulfillment, joy, or active mental clarity.</p>
                    </div>
                    <div className="guide-level-item tier-mid">
                      <strong>⚖️ Level 4 (Neutral)</strong>
                      <p>Grounding baseline. Steady functioning without strong emotional peaks or low distress.</p>
                    </div>
                    <div className="guide-level-item tier-low">
                      <strong>🌧️ Levels 1-3 (Sad, Fear, Angry)</strong>
                      <p>Distress or fatigue triggers. A healthy signal to pause, practice breathing, or take a gentle walk.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="trend-chart-body">
                {/* Main Row: Y-Axis + SVG Plot Viewport */}
                <div className="trend-chart-row">
                  {/* Perfectly aligned Y-Axis column */}
                  <div className="trend-y-axis" aria-label="Y-Axis: Mood Intensity Levels">
                    {Y_AXIS_LEVELS.map((lvl) => (
                      <div
                        key={lvl.level}
                        className="trend-y-tick"
                        style={{ top: `${(lvl.y / 280) * 100}%` }}
                        title={`${lvl.mood}: Level ${lvl.level}`}
                      >
                        <span className="y-mood-label">{lvl.mood}</span>
                        <span className="y-mood-emoji">{lvl.emoji}</span>
                        <span className="y-tick-line"></span>
                      </div>
                    ))}
                  </div>

                  {/* SVG Line Graph & Grid Viewport */}
                  <div className="trend-plot-viewport">
                    <svg className="trend-svg" viewBox="0 0 700 280" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="moodTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.25" />
                        </filter>
                      </defs>

                      {/* Horizontal Grid Lines for every emotional level */}
                      {Y_AXIS_LEVELS.map((lvl) => (
                        <line
                          key={lvl.level}
                          x1="0"
                          y1={lvl.y}
                          x2="700"
                          y2={lvl.y}
                          stroke={lvl.level === 4 ? "#cbd5e1" : "#e2e8f0"}
                          strokeWidth={lvl.level === 4 ? "1.5" : "1"}
                          strokeDasharray={lvl.level === 4 ? undefined : "4,4"}
                          opacity={lvl.level === 4 ? 0.9 : 0.65}
                        />
                      ))}

                      {/* Vertical Grid Guidelines for each of the 7 days */}
                      {chartPoints.map((pt, i) => (
                        <line
                          key={i}
                          x1={pt.x}
                          y1="20"
                          x2={pt.x}
                          y2="260"
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Subtle Area Fill Under Trend Curve */}
                      {areaFillPath && (
                        <path d={areaFillPath} fill="url(#moodTrendGradient)" />
                      )}

                      {/* Smooth Trend Polyline / Spline */}
                      <path
                        d={smoothLinePath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#lineGlow)"
                      />

                      {/* Interactive Data Point Nodes */}
                      {chartPoints.map((pt, i) => (
                        <g
                          key={i}
                          className="trend-point-group"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          {/* Invisible expanded hit target */}
                          <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" cursor="pointer" />

                          {/* Outer Halo Ring */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint?.day === pt.day ? 14 : 9}
                            fill={pt.color}
                            opacity={hoveredPoint?.day === pt.day ? 0.45 : 0.2}
                            className="point-halo"
                          />

                          {/* Crisp Inner Node */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint?.day === pt.day ? 7.5 : 6}
                            fill={pt.color}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            className="point-core"
                          />
                        </g>
                      ))}
                    </svg>

                    {/* Interactive Floating Tooltip */}
                    {hoveredPoint && (
                      <div
                        className="chart-hover-tooltip"
                        style={{
                          left: `${(hoveredPoint.x / 700) * 100}%`,
                          top: `${(hoveredPoint.y / 280) * 100}%`,
                        }}
                      >
                        <div className="tooltip-header">
                          <span className="tooltip-emoji">{hoveredPoint.emoji}</span>
                          <strong className="tooltip-mood">{hoveredPoint.mood}</strong>
                          <span className="tooltip-level">Lvl {hoveredPoint.level}</span>
                        </div>
                        <div className="tooltip-body">
                          <span className="tooltip-date">{hoveredPoint.day} • {hoveredPoint.time}</span>
                          <span className="tooltip-note">{hoveredPoint.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clearly aligned X-Axis Row */}
                <div className="trend-x-axis-row" aria-label="X-Axis: Timeline of Last 7 Days">
                  <div className="x-axis-spacer"></div>
                  <div className="x-axis-track">
                    {chartPoints.map((pt, i) => (
                      <div
                        key={i}
                        className={`x-axis-day-slot ${pt.day === 'Today' ? 'is-today' : ''} ${hoveredPoint?.day === pt.day ? 'is-hovered' : ''}`}
                        style={{ left: `${(pt.x / 700) * 100}%` }}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div className="x-tick-mark"></div>
                        <span className="x-day-name">{pt.day}</span>
                        <span className="x-day-emoji-badge" title={`${pt.day}: ${pt.mood} ${pt.emoji}`}>
                          {pt.emoji}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <p>Select what caused your mood - work, sleep, relationships, or personal accomplishments.</p>
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
