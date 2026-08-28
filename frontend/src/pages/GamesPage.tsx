import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GamesPage.css';

// ── Web Audio Synth for Calming Sounds ───────────────────────────────────────
class ZenSoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Satisfying bubble pop sound
  playPop() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 420 + Math.random() * 260;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Calming chime / singing bowl chord
  playChime(noteIndex = 0) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Pentatonic calming scale in Hz
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
      const freq = scale[noteIndex % scale.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    } catch {
      // Safe catch
    }
  }

  // Soft flip sound
  playFlip() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Safe catch
    }
  }
}

const soundEngine = new ZenSoundEngine();

// ── Game 1: Bubble Wrap Pop Data ─────────────────────────────────────────────
const TOTAL_BUBBLES = 48;

// ── Game 3: Mindful Match Affirmations Data ──────────────────────────────────
interface MatchCard {
  id: number;
  pairId: number;
  text: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const AFFIRMATION_PAIRS = [
  { text: 'I am safe & grounded', emoji: '🌿' },
  { text: 'Peace begins within', emoji: '🕊️' },
  { text: 'One breath at a time', emoji: '🌊' },
  { text: 'My mind is resilient', emoji: '✨' },
  { text: 'Embrace this moment', emoji: '🌸' },
  { text: 'I radiate calm energy', emoji: '☀️' },
];

const generateCards = (): MatchCard[] => {
  const cards: MatchCard[] = [];
  AFFIRMATION_PAIRS.forEach((item, pairIndex) => {
    cards.push(
      { id: pairIndex * 2, pairId: pairIndex, text: item.text, emoji: item.emoji, isFlipped: false, isMatched: false },
      { id: pairIndex * 2 + 1, pairId: pairIndex, text: item.text, emoji: item.emoji, isFlipped: false, isMatched: false }
    );
  });
  return cards.sort(() => Math.random() - 0.5);
};

// ── Game 4: Affirmation Scramble Data ─────────────────────────────────────────
const SCRAMBLE_WORDS = [
  { scrambled: 'CEPAE', answer: 'PEACE', hint: 'A state of tranquil calm inside' },
  { scrambled: 'BLNCKAE', answer: 'BALANCE', hint: 'Keeping mind and body steady' },
  { scrambled: 'HTEBRAE', answer: 'BREATHE', hint: 'What connects your mind and body' },
  { scrambled: 'RTYEENIS', answer: 'SERENITY', hint: 'The state of being untroubled' },
  { scrambled: 'GTIETDRUA', answer: 'GRATITUDE', hint: 'Appreciating the goodness today' },
  { scrambled: 'RSEEENILCI', answer: 'RESILIENCE', hint: 'The power to bounce back stronger' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const GamesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bubbles' | 'lotus' | 'match' | 'ripple' | 'scramble'>('bubbles');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Overall Stats
  const [totalPopped, setTotalPopped] = useState<number>(() => {
    return Number(localStorage.getItem('soulspace_popped_count') || '0');
  });
  const [zenMinutes, setZenMinutes] = useState<number>(() => {
    return Number(localStorage.getItem('soulspace_zen_minutes') || '2');
  });

  // Track time spent in Zen Games
  useEffect(() => {
    const timer = setInterval(() => {
      setZenMinutes((prev) => {
        const next = prev + 1;
        localStorage.setItem('soulspace_zen_minutes', next.toString());
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.soundEnabled = next;
  };

  // ── Game 1: Bubble Wrap State ──────────────────────────────────────────────
  const [bubbles, setBubbles] = useState<boolean[]>(() => Array(TOTAL_BUBBLES).fill(false));

  const handlePop = (index: number) => {
    if (bubbles[index]) return;
    soundEngine.playPop();

    setBubbles((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    setTotalPopped((p) => {
      const next = p + 1;
      localStorage.setItem('soulspace_popped_count', next.toString());
      return next;
    });
  };

  const handleResetBubbles = () => {
    soundEngine.playChime(3);
    setBubbles(Array(TOTAL_BUBBLES).fill(false));
  };

  const poppedCount = bubbles.filter(Boolean).length;

  // ── Game 2: Zen Lotus Breathing State ──────────────────────────────────────
  const [breathingMode, setBreathingMode] = useState<'box' | 'relax' | 'deep'>('box');
  const [lotusPhase, setLotusPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [lotusSeconds, setLotusSeconds] = useState(4);
  const [lotusCycleCount, setLotusCycleCount] = useState(0);

  useEffect(() => {
    if (activeTab !== 'lotus') return;

    const timings: Record<string, { Inhale: number; Hold: number; Exhale: number; Rest: number }> = {
      box:   { Inhale: 4, Hold: 4, Exhale: 4, Rest: 4 },
      relax: { Inhale: 4, Hold: 7, Exhale: 8, Rest: 0 },
      deep:  { Inhale: 5, Hold: 2, Exhale: 5, Rest: 2 },
    };

    const currentTimings = timings[breathingMode];

    const timer = setInterval(() => {
      setLotusSeconds((sec) => {
        if (sec > 1) return sec - 1;

        // Advance phase
        setLotusPhase((currentPhase) => {
          let nextPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Rest' = 'Inhale';
          if (currentPhase === 'Inhale') {
            nextPhase = currentTimings.Hold > 0 ? 'Hold' : 'Exhale';
            soundEngine.playChime(1);
          } else if (currentPhase === 'Hold') {
            nextPhase = 'Exhale';
            soundEngine.playChime(2);
          } else if (currentPhase === 'Exhale') {
            nextPhase = currentTimings.Rest > 0 ? 'Rest' : 'Inhale';
            soundEngine.playChime(0);
            if (nextPhase === 'Inhale') setLotusCycleCount((c) => c + 1);
          } else {
            nextPhase = 'Inhale';
            soundEngine.playChime(4);
            setLotusCycleCount((c) => c + 1);
          }

          setLotusSeconds(currentTimings[nextPhase]);
          return nextPhase;
        });

        return 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, breathingMode]);

  // ── Game 3: Mindful Match Cards State ──────────────────────────────────────
  const [cards, setCards] = useState<MatchCard[]>(generateCards);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.isFlipped || clicked.isMatched) return;

    soundEngine.playFlip();

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsLocked(true);
      const [firstId, secondId] = newSelected;
      const first = newCards.find((c) => c.id === firstId)!;
      const second = newCards.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId) {
        // Matched!
        setTimeout(() => {
          soundEngine.playChime(5);
          setCards((prev) =>
            prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
          setIsLocked(false);
          setMatchScore((s) => s + 100);
        }, 450);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setSelectedCards([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleResetMatch = () => {
    soundEngine.playChime(2);
    setCards(generateCards());
    setSelectedCards([]);
    setIsLocked(false);
    setMatchScore(0);
  };

  const matchedPairsCount = cards.filter((c) => c.isMatched).length / 2;

  // ── Game 4: Affirmation Scramble State ─────────────────────────────────────
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [userInputWord, setUserInputWord] = useState('');
  const [scrambleFeedback, setScrambleFeedback] = useState<'idle' | 'success' | 'retry'>('idle');
  const [scrambleSolvedCount, setScrambleSolvedCount] = useState(0);

  const currentScramble = SCRAMBLE_WORDS[scrambleIndex];

  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputWord.trim().toUpperCase() === currentScramble.answer) {
      soundEngine.playChime(6);
      setScrambleFeedback('success');
      setScrambleSolvedCount((c) => c + 1);
      setTimeout(() => {
        setScrambleFeedback('idle');
        setUserInputWord('');
        setScrambleIndex((idx) => (idx + 1) % SCRAMBLE_WORDS.length);
      }, 1200);
    } else {
      setScrambleFeedback('retry');
      setTimeout(() => setScrambleFeedback('idle'), 1500);
    }
  };

  // ── Game 5: Water Ripple Canvas ────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; alpha: number; color: string }>>([]);

  const addRipple = useCallback((x: number, y: number) => {
    soundEngine.playPop();
    const colors = ['#3f72af', '#60a5fa', '#38bdf8', '#818cf8', '#34d399'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    ripplesRef.current.push({ x, y, radius: 4, alpha: 1, color });
  }, []);

  useEffect(() => {
    if (activeTab !== 'ripple') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(240, 246, 255, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 3;
        ctx.stroke();

        r.radius += 2.2;
        r.alpha -= 0.018;

        if (r.alpha <= 0 || r.radius > 160) {
          ripples.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  return (
    <div className="games-page-container">
      {/* ── Top Hero Header ────────────────────────────────────────────── */}
      <section className="games-hero-section">
        <div className="games-hero-content">
          <h1 className="games-hero-title">
            Take a Gentle Mental Micro-Break
          </h1>
          <p className="games-hero-subtitle">
            Science shows that 2 to 3 minutes of tactile focus or rhythmic breathing resets your autonomic nervous system, reduces stress hormones, and restores inner balance.
          </p>

          {/* Quick Metrics */}
          <div className="games-metrics-bar">
            <div className="game-metric-card">
              <span className="metric-icon">🫧</span>
              <div>
                <div className="metric-number">{totalPopped}</div>
                <div className="metric-label">Bubbles Popped</div>
              </div>
            </div>
            <div className="game-metric-card">
              <span className="metric-icon">🧘</span>
              <div>
                <div className="metric-number">{zenMinutes} min</div>
                <div className="metric-label">Mindful Break Time</div>
              </div>
            </div>
            <div className="game-metric-card">
              <span className="metric-icon">🌸</span>
              <div>
                <div className="metric-number">{lotusCycleCount}</div>
                <div className="metric-label">Breath Cycles</div>
              </div>
            </div>
            <button className={`sound-toggle-btn ${soundEnabled ? 'on' : 'off'}`} onClick={toggleSound} title="Toggle calming sound effects">
              {soundEnabled ? '🔊 Sound On' : '🔇 Muted'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="games-nav-tabs">
        <button
          className={`game-tab-btn ${activeTab === 'bubbles' ? 'active' : ''}`}
          onClick={() => setActiveTab('bubbles')}
        >
          <span className="tab-icon">🫧</span>
          <span className="tab-label">Bubble Pop</span>
        </button>
        <button
          className={`game-tab-btn ${activeTab === 'lotus' ? 'active' : ''}`}
          onClick={() => setActiveTab('lotus')}
        >
          <span className="tab-icon">🌸</span>
          <span className="tab-label">Zen Lotus Breath</span>
        </button>
        <button
          className={`game-tab-btn ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => setActiveTab('match')}
        >
          <span className="tab-icon">🧩</span>
          <span className="tab-label">Affirmation Match</span>
        </button>
        <button
          className={`game-tab-btn ${activeTab === 'ripple' ? 'active' : ''}`}
          onClick={() => setActiveTab('ripple')}
        >
          <span className="tab-icon">🌊</span>
          <span className="tab-label">Water Ripples</span>
        </button>
        <button
          className={`game-tab-btn ${activeTab === 'scramble' ? 'active' : ''}`}
          onClick={() => setActiveTab('scramble')}
        >
          <span className="tab-icon">✍️</span>
          <span className="tab-label">Mind Word Scramble</span>
        </button>
      </div>

      {/* ── Active Game Arena ─────────────────────────────────────────── */}
      <main className="games-arena">
        {/* ════ GAME 1: Bubble Wrap Pop ════ */}
        {activeTab === 'bubbles' && (
          <div className="game-card bubble-pop-card">
            <div className="game-card-header">
              <div>
                <h2 className="game-card-title">Sensory Bubble Wrap</h2>
                <p className="game-card-desc">Click or tap any bubble to pop it. Sensory popping releases tactile tension and anchors your mind in the present moment.</p>
              </div>
              <div className="bubble-actions">
                <span className="bubble-counter-badge">
                  {poppedCount} / {TOTAL_BUBBLES} Popped
                </span>
                <button className="reset-game-btn" onClick={handleResetBubbles}>
                  🔄 Reset Wrap
                </button>
              </div>
            </div>

            <div className="bubble-grid">
              {bubbles.map((isPopped, idx) => (
                <button
                  key={idx}
                  className={`bubble-item ${isPopped ? 'popped' : 'unpopped'}`}
                  onClick={() => handlePop(idx)}
                  aria-label={`Bubble ${idx + 1}`}
                >
                  <span className="bubble-shine"></span>
                  {isPopped && <span className="pop-ripple"></span>}
                </button>
              ))}
            </div>

            {poppedCount === TOTAL_BUBBLES && (
              <div className="completion-toast">
                🎉 Wonderful! All bubbles popped. Take a deep breath and feel the tension leave your shoulders.
              </div>
            )}
          </div>
        )}

        {/* ════ GAME 2: Zen Lotus Breath ════ */}
        {activeTab === 'lotus' && (
          <div className="game-card lotus-breath-card">
            <div className="game-card-header">
              <div>
                <h2 className="game-card-title">Zen Lotus Flower Breath</h2>
                <p className="game-card-desc">Synchronize your breath with the expanding and contracting lotus blossom. Deep slow breathing stimulates your vagus nerve.</p>
              </div>
              <div className="breathing-mode-pills">
                <button
                  className={`mode-pill ${breathingMode === 'box' ? 'active' : ''}`}
                  onClick={() => { setBreathingMode('box'); setLotusSeconds(4); setLotusPhase('Inhale'); }}
                >
                  Box (4-4-4-4)
                </button>
                <button
                  className={`mode-pill ${breathingMode === 'relax' ? 'active' : ''}`}
                  onClick={() => { setBreathingMode('relax'); setLotusSeconds(4); setLotusPhase('Inhale'); }}
                >
                  Relax (4-7-8)
                </button>
                <button
                  className={`mode-pill ${breathingMode === 'deep' ? 'active' : ''}`}
                  onClick={() => { setBreathingMode('deep'); setLotusSeconds(5); setLotusPhase('Inhale'); }}
                >
                  Deep Resonance (5-2-5-2)
                </button>
              </div>
            </div>

            <div className="lotus-stage">
              <div className={`lotus-flower-container phase-${lotusPhase.toLowerCase()}`}>
                <div className="lotus-petal petal-1"></div>
                <div className="lotus-petal petal-2"></div>
                <div className="lotus-petal petal-3"></div>
                <div className="lotus-petal petal-4"></div>
                <div className="lotus-petal petal-5"></div>
                <div className="lotus-petal petal-6"></div>
                <div className="lotus-center-core">
                  <span className="phase-text">{lotusPhase}</span>
                  <span className="countdown-number">{lotusSeconds}s</span>
                </div>
              </div>

              <div className="lotus-instructions">
                {lotusPhase === 'Inhale' && '🌱 Breathe in slowly through your nose, filling your belly.'}
                {lotusPhase === 'Hold' && '✨ Gently hold your breath with softness. Relax your jaw.'}
                {lotusPhase === 'Exhale' && '💨 Release slowly and smoothly through your mouth.'}
                {lotusPhase === 'Rest' && '🌿 Rest comfortably in quiet stillness before the next breath.'}
              </div>
            </div>
          </div>
        )}

        {/* ════ GAME 3: Affirmation Match ════ */}
        {activeTab === 'match' && (
          <div className="game-card match-game-card">
            <div className="game-card-header">
              <div>
                <h2 className="game-card-title">Mindful Affirmation Match</h2>
                <p className="game-card-desc">Flip two matching positive affirmation cards. Boost working memory and positive self-talk simultaneously.</p>
              </div>
              <div className="match-actions">
                <span className="match-score-badge">Score: {matchScore}</span>
                <span className="matched-counter-badge">{matchedPairsCount} / 6 Matched</span>
                <button className="reset-game-btn" onClick={handleResetMatch}>
                  🔄 Shuffle Cards
                </button>
              </div>
            </div>

            <div className="match-grid">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`match-card-wrapper ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="match-card-inner">
                    <div className="card-front">
                      <span className="card-lotus-icon">🌸</span>
                      <span className="card-hint-text">SoulSpace</span>
                    </div>
                    <div className="card-back">
                      <span className="card-back-emoji">{card.emoji}</span>
                      <p className="card-back-text">{card.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {matchedPairsCount === 6 && (
              <div className="completion-toast match-win">
                🌟 Congratulations! You aligned all 6 positive mindset affirmations. Carry this positive clarity with you today.
              </div>
            )}
          </div>
        )}

        {/* ════ GAME 4: Water Ripple Sandbox ════ */}
        {activeTab === 'ripple' && (
          <div className="game-card ripple-card">
            <div className="game-card-header">
              <div>
                <h2 className="game-card-title">Zen Water Ripple Pond</h2>
                <p className="game-card-desc">Move your cursor or tap anywhere inside the pond to create calming fluid ripples. Like ripples on water, allow thoughts to appear and gently dissolve.</p>
              </div>
              <button
                className="reset-game-btn"
                onClick={() => {
                  soundEngine.playChime(1);
                  ripplesRef.current = [];
                }}
              >
                🌊 Clear Pond
              </button>
            </div>

            <div
              className="ripple-canvas-wrapper"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                addRipple(e.clientX - rect.left, e.clientY - rect.top);
              }}
              onMouseMove={(e) => {
                if (Math.random() < 0.18) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  addRipple(e.clientX - rect.left, e.clientY - rect.top);
                }
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="ripple-canvas"
              />
              <div className="ripple-hint-overlay">
                <span>Touch or drag across the water surface</span>
              </div>
            </div>
          </div>
        )}

        {/* ════ GAME 5: Mind Word Scramble ════ */}
        {activeTab === 'scramble' && (
          <div className="game-card scramble-card">
            <div className="game-card-header">
              <div>
                <h2 className="game-card-title">Mindful Word Unscramble</h2>
                <p className="game-card-desc">Unscramble the letters to reveal a core emotional wellness concept. Engaging your cognitive brain gently redirects focus away from worry.</p>
              </div>
              <div className="scramble-score-badge">
                Solved: {scrambleSolvedCount}
              </div>
            </div>

            <div className="scramble-play-area">
              <div className="scramble-badge">Word #{scrambleIndex + 1} of {SCRAMBLE_WORDS.length}</div>
              <div className="scrambled-letters-container">
                {currentScramble.scrambled.split('').map((char, i) => (
                  <span key={i} className="letter-tile">
                    {char}
                  </span>
                ))}
              </div>

              <div className="scramble-hint-box">
                💡 <strong>Clue:</strong> {currentScramble.hint}
              </div>

              <form onSubmit={handleScrambleSubmit} className="scramble-form">
                <input
                  type="text"
                  className={`scramble-input ${scrambleFeedback}`}
                  placeholder="Type unscrambled word…"
                  value={userInputWord}
                  onChange={(e) => setUserInputWord(e.target.value)}
                  maxLength={15}
                  autoFocus
                />
                <button type="submit" className="scramble-submit-btn">
                  Submit Word ✨
                </button>
              </form>

              {scrambleFeedback === 'success' && (
                <div className="scramble-msg success">
                  🎉 Correct! "{currentScramble.answer}" is a powerful pillar of inner peace.
                </div>
              )}
              {scrambleFeedback === 'retry' && (
                <div className="scramble-msg retry">
                  Almost there! Try rearranging the letters again.
                </div>
              )}

              <button
                className="skip-word-btn"
                onClick={() => {
                  soundEngine.playFlip();
                  setUserInputWord('');
                  setScrambleFeedback('idle');
                  setScrambleIndex((idx) => (idx + 1) % SCRAMBLE_WORDS.length);
                }}
              >
                Skip to Next Word →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GamesPage;
