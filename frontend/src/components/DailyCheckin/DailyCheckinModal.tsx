import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DailyCheckinModal.css';

export interface DailyCheckinRecord {
  id: string;
  date: string;
  timestamp: number;
  type: 'questions' | 'physical_task';
  streak: number;
  answers?: { question: string; answer: string }[];
  taskTitle?: string;
  insight: string;
}

// Simple, Easy English Daily Question Sets
const DAILY_QUESTION_SETS = [
  // Sunday (0)
  {
    theme: 'Sunday Rest & Relax',
    questions: [
      {
        q: 'How are you feeling as you start your Sunday?',
        options: ['Feeling great and rested', 'Calm and okay', 'A bit tired', 'A little stressed / busy mind'],
      },
      {
        q: 'What would help you relax most today?',
        options: ['Reading or quiet time', 'Going for a walk outside', 'Eating good food & drinking water', 'Just chilling and resting'],
      },
      {
        q: 'How is your mood right now?',
        options: ['Happy and peaceful', 'Normal and balanced', 'A little low', 'A bit restless'],
      },
    ],
  },
  // Monday (1)
  {
    theme: 'Monday Energy & Goals',
    questions: [
      {
        q: 'How is your energy level starting the week?',
        options: ['Full energy (100%)', 'Good energy (75%)', 'Low energy (40%)', 'Tired / need coffee'],
      },
      {
        q: 'What is your main goal for today?',
        options: ['Focus on getting work done', 'Stay calm and not rush', 'Talk nicely with people', 'Take care of myself'],
      },
      {
        q: 'How does your body feel today?',
        options: ['Fresh and active', 'Relaxed and comfortable', 'Neck or shoulders feel tight', 'Need some stretching'],
      },
    ],
  },
  // Tuesday (2)
  {
    theme: 'Tuesday Focus & Flow',
    questions: [
      {
        q: 'How is your work or study going today?',
        options: ['Going very smoothly', 'Doing okay step by step', 'Facing some small difficulties', 'Feeling a bit overloaded'],
      },
      {
        q: 'Did you take a short break today?',
        options: ['Yes, drank water and took a breath', 'Only a quick tea/coffee break', 'Not yet, will take one soon', 'Working non-stop'],
      },
      {
        q: 'What thought is on your mind right now?',
        options: ['Feeling positive and happy', 'Feeling calm and steady', 'Just normal', 'A little worried'],
      },
    ],
  },
  // Wednesday (3)
  {
    theme: 'Midweek Check-in',
    questions: [
      {
        q: 'How are you holding up in the middle of the week?',
        options: ['Feeling strong and steady', 'Doing fine so far', 'Feeling a little drained', 'Need a good break'],
      },
      {
        q: 'What can you do to make your day easier?',
        options: ['Do not overthink things', 'Turn off phone notifications', 'Stop worrying about small things', 'Take things one step at a time'],
      },
      {
        q: 'Are you able to stay in the present moment?',
        options: ['Yes, fully focused right now', 'Mostly focused', 'Thinking about future tasks', 'A bit distracted'],
      },
    ],
  },
  // Thursday (4)
  {
    theme: 'Thursday Calm & Focus',
    questions: [
      {
        q: 'What are you focusing on today?',
        options: ['Finishing important tasks', 'Keeping peace of mind', 'Helping friends or family', 'Handling urgent work'],
      },
      {
        q: 'How is your stress level right now?',
        options: ['Low and relaxed', 'Normal / under control', 'A bit high for now', 'Very high / need care'],
      },
      {
        q: 'What would feel best this evening?',
        options: ['A calm walk outside', 'A warm relaxing shower', 'Listening to calm music', 'Going to bed early'],
      },
    ],
  },
  // Friday (5)
  {
    theme: 'Friday Wrap-up & Peace',
    questions: [
      {
        q: 'Looking back at this week, what are you proud of?',
        options: ['Finished what I planned', 'Handled tough situations well', 'Took care of my health', 'Helped someone out'],
      },
      {
        q: 'How do you feel as the week ends?',
        options: ['Happy and relieved', 'Calm and content', 'Tired but satisfied', 'Ready for the weekend'],
      },
      {
        q: 'How will you relax this weekend?',
        options: ['Staying away from work screens', 'Spending time outside', 'Watching a movie or reading', 'Catching up on sleep'],
      },
    ],
  },
  // Saturday (6)
  {
    theme: 'Saturday Fun & Rest',
    questions: [
      {
        q: 'What makes you happiest on your off day?',
        options: ['Doing fun hobbies or games', 'Going out in nature', 'Sleeping in and resting', 'Talking with friends or family'],
      },
      {
        q: 'How connected do you feel with yourself today?',
        options: ['Feeling really happy and free', 'Peaceful and calm', 'Just average', 'Need some quiet time'],
      },
      {
        q: 'What kind words can you tell yourself today?',
        options: ['I am doing my best', 'I deserve time to rest', 'Everything will be okay', 'Today is my day to enjoy'],
      },
    ],
  },
];

// Simple Everyday Physical Actions
const DAILY_PHYSICAL_TASKS = [
  {
    title: 'Shoulder & Neck Relax',
    instruction: 'Drop your shoulders down. Roll them back 5 times slowly. Soften your jaw and take 3 slow, deep breaths.',
    benefit: 'Releases body stiffness and helps you feel relaxed right away.',
    duration: '1 min',
  },
  {
    title: 'Drink a Glass of Water',
    instruction: 'Drink 1 full glass of cool water slowly. Notice how refreshing and cool it feels.',
    benefit: 'Gives your brain fresh energy and reduces tiredness.',
    duration: '1 min',
  },
  {
    title: '4-Second Deep Breathing',
    instruction: 'Breathe in through your nose for 4 seconds. Hold for 4 seconds. Breathe out slowly for 4 seconds. Do this 3 times.',
    benefit: 'Calms your heartbeat and clears mental stress.',
    duration: '2 min',
  },
  {
    title: 'Look Out the Window',
    instruction: 'Look away from your screen. Look at the sky or distant trees for 1 minute without staring hard.',
    benefit: 'Relaxes your eyes after staring at phones and laptops.',
    duration: '2 min',
  },
  {
    title: '5-Thing Calming Check',
    instruction: 'Look around you right now: name 3 things you can see, 2 things you can touch, and take 1 deep breath.',
    benefit: 'Stops worrying thoughts and brings you back to the present moment.',
    duration: '2 min',
  },
  {
    title: 'Feet on the Ground',
    instruction: 'Put both feet flat on the floor. Feel the solid floor under your feet and take a slow breath out.',
    benefit: 'Helps you feel grounded, calm, and stable.',
    duration: '1 min',
  },
  {
    title: 'Gentle Head & Neck Stretch',
    instruction: 'Gently tilt your head toward your right shoulder for 10 seconds, then to the left shoulder for 10 seconds.',
    benefit: 'Relieves neck tightness from sitting or looking down.',
    duration: '1 min',
  },
];

// Simple Friendly Daily Tips
const INSIGHT_GENERATORS = [
  'Daily Tip: Great job checking in! Taking a 1-minute breathing break between tasks will keep your mind fresh and calm all day.',
  'Daily Tip: Noticing how your body feels is a great habit. Relaxing your shoulders and jaw helps you stay stress-free.',
  'Daily Tip: Awesome consistency! Doing small healthy check-ins every day builds strong mental peace and confidence.',
  'Daily Tip: It is okay to take things slow when energy is low. Give yourself permission to rest whenever you need.',
];

interface DailyCheckinModalProps {
  forceOpen?: boolean;
  onCloseManual?: () => void;
}

const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ forceOpen = false, onCloseManual }) => {
  const { user, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'choose' | 'questions' | 'physical_task' | 'completed'>('choose');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [streakCount, setStreakCount] = useState(1);
  const [isNewStreak, setIsNewStreak] = useState(false);
  const [dailyInsight, setDailyInsight] = useState('');

  const today = useMemo(() => new Date(), []);
  const dayOfWeek = today.getDay(); // 0-6
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const currentQuestionSet = DAILY_QUESTION_SETS[dayOfWeek] || DAILY_QUESTION_SETS[1];
  const currentPhysicalTask = DAILY_PHYSICAL_TASKS[dayOfWeek] || DAILY_PHYSICAL_TASKS[0];

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setIsOpen(false);
      return;
    }

    const checkinDoneKey = `ss_checkin_done_${user._id}_${dateKey}`;
    const isDoneToday = localStorage.getItem(checkinDoneKey) === 'true';

    if (forceOpen) {
      setIsOpen(true);
      setMode(isDoneToday ? 'completed' : 'choose');
      return;
    }

    if (!isDoneToday) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setMode('choose');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, user, dateKey, forceOpen]);

  const handleSelectAnswer = (optionText: string) => {
    const qObj = currentQuestionSet.questions[currentQIndex];
    const newAnswers = [...answers, { question: qObj.q, answer: optionText }];
    setAnswers(newAnswers);

    if (currentQIndex < currentQuestionSet.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finalizeCheckin('questions', newAnswers);
    }
  };

  const handleCompleteTask = () => {
    finalizeCheckin('physical_task', undefined, currentPhysicalTask.title);
  };

  const finalizeCheckin = (
    type: 'questions' | 'physical_task',
    ansList?: { question: string; answer: string }[],
    taskName?: string
  ) => {
    if (!user) return;

    const streakStorageKey = `ss_streak_count_${user._id}`;
    const lastDateKey = `ss_streak_last_date_${user._id}`;
    const checkinDoneKey = `ss_checkin_done_${user._id}_${dateKey}`;

    const storedStreak = parseInt(localStorage.getItem(streakStorageKey) || '0', 10);
    const lastDate = localStorage.getItem(lastDateKey);

    let newStreak = 1;

    if (lastDate) {
      const lastCheckinDate = new Date(lastDate);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const isYesterday =
        lastCheckinDate.getFullYear() === yesterday.getFullYear() &&
        lastCheckinDate.getMonth() === yesterday.getMonth() &&
        lastCheckinDate.getDate() === yesterday.getDate();

      const isToday =
        lastCheckinDate.getFullYear() === today.getFullYear() &&
        lastCheckinDate.getMonth() === today.getMonth() &&
        lastCheckinDate.getDate() === today.getDate();

      if (isToday) {
        newStreak = Math.max(1, storedStreak);
        setIsNewStreak(false);
      } else if (isYesterday) {
        newStreak = storedStreak + 1;
        setIsNewStreak(true);
      } else {
        newStreak = 1;
        setIsNewStreak(true);
      }
    } else {
      newStreak = 1;
      setIsNewStreak(true);
    }

    setStreakCount(newStreak);
    localStorage.setItem(streakStorageKey, String(newStreak));
    localStorage.setItem(lastDateKey, dateKey);
    localStorage.setItem(checkinDoneKey, 'true');

    const chosenInsight = INSIGHT_GENERATORS[(dayOfWeek + newStreak) % INSIGHT_GENERATORS.length];
    setDailyInsight(chosenInsight);

    const historyKey = `ss_daily_history_${user._id}`;
    try {
      const existingHistory: DailyCheckinRecord[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newRecord: DailyCheckinRecord = {
        id: `checkin-${Date.now()}`,
        date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        type,
        streak: newStreak,
        answers: ansList,
        taskTitle: taskName,
        insight: chosenInsight,
      };
      localStorage.setItem(historyKey, JSON.stringify([newRecord, ...existingHistory.slice(0, 30)]));
    } catch (e) {
      console.warn('Could not save check-in journal:', e);
    }

    setMode('completed');
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseManual) onCloseManual();
  };

  if (!isOpen || !isLoggedIn) return null;

  return (
    <div className="daily-checkin-overlay" role="dialog" aria-modal="true">
      <div className="daily-checkin-modal-container">
        
        {/* Sleek Minimalist Header */}
        <div className="checkin-modal-header">
          <div className="checkin-date-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <button
            type="button"
            className="checkin-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* ── STEP 1: CHOICE SELECTION ───────────────────────────────────────── */}
        {mode === 'choose' && (
          <div className="checkin-body-content">
            <div className="checkin-hero-intro">
              <span className="checkin-kicker">DAILY WELLNESS CHECK</span>
              <h2 className="checkin-title">Today's Mindful Pulse</h2>
              <p className="checkin-sub">
                Calibrate your emotional state, track your consistency streak, and receive a clinical wellness insight.
              </p>
            </div>

            <div className="checkin-choice-grid">
              {/* Option A: 3 Questions */}
              <button
                type="button"
                className="checkin-choice-card choice-card-questions"
                onClick={() => {
                  setMode('questions');
                  setCurrentQIndex(0);
                  setAnswers([]);
                }}
              >
                <div className="choice-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div className="choice-text-col">
                  <div className="choice-title-row">
                    <h3>3 Mindful Questions</h3>
                    <span className="choice-pill-time">~60 sec</span>
                  </div>
                  <span className="choice-meta">{currentQuestionSet.theme}</span>
                  <p>Reflect on your mental focus, energy level, and emotional state today.</p>
                </div>
                <div className="choice-arrow-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>

              {/* Option B: Physical Micro-Action */}
              <button
                type="button"
                className="checkin-choice-card choice-card-somatic"
                onClick={() => setMode('physical_task')}
              >
                <div className="choice-icon-wrap icon-somatic">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="choice-text-col">
                  <div className="choice-title-row">
                    <h3>1 Somatic Micro-Action</h3>
                    <span className="choice-pill-time">{currentPhysicalTask.duration}</span>
                  </div>
                  <span className="choice-meta">{currentPhysicalTask.title}</span>
                  <p>Guided somatic physical exercise to dissolve tension and reset posture.</p>
                </div>
                <div className="choice-arrow-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <div className="checkin-streak-preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              <span>Complete today's check-in to extend your continuous wellness streak.</span>
            </div>
          </div>
        )}

        {/* ── STEP 2A: QUESTIONS FLOW ────────────────────────────────────────── */}
        {mode === 'questions' && (
          <div className="checkin-body-content">
            <div className="question-progress-track">
              <div
                className="question-progress-bar"
                style={{ width: `${((currentQIndex + 1) / currentQuestionSet.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="question-header-info">
              <span className="q-step-badge">Question {currentQIndex + 1} of {currentQuestionSet.questions.length}</span>
              <span className="q-theme-tag">{currentQuestionSet.theme}</span>
            </div>

            <h3 className="q-prompt-text">{currentQuestionSet.questions[currentQIndex].q}</h3>

            <div className="q-options-grid">
              {currentQuestionSet.questions[currentQIndex].options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className="q-option-pill-btn"
                  onClick={() => handleSelectAnswer(opt)}
                >
                  <span className="q-opt-label">{opt}</span>
                  <div className="q-opt-select-indicator">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            <div className="checkin-back-row">
              <button
                type="button"
                className="btn-checkin-back"
                onClick={() => {
                  if (currentQIndex > 0) {
                    setCurrentQIndex(currentQIndex - 1);
                    setAnswers(answers.slice(0, -1));
                  } else {
                    setMode('choose');
                  }
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2B: SOMATIC ACTION FLOW ───────────────────────────────────── */}
        {mode === 'physical_task' && (
          <div className="checkin-body-content">
            <div className="physical-task-header-row">
              <span className="task-kicker">SOMATIC GROUNDING</span>
              <span className="task-duration-badge">⏱️ {currentPhysicalTask.duration}</span>
            </div>

            <h3 className="physical-task-title">{currentPhysicalTask.title}</h3>

            <div className="physical-task-instructions-card">
              <p className="task-instruction-paragraph">{currentPhysicalTask.instruction}</p>
              <div className="task-benefit-banner">
                <strong>Why it works:</strong> {currentPhysicalTask.benefit}
              </div>
            </div>

            <div className="physical-task-action-row">
              <button
                type="button"
                className="btn-complete-physical-action"
                onClick={handleCompleteTask}
              >
                ✓ I Completed This Practice
              </button>
              <button
                type="button"
                className="btn-checkin-back"
                onClick={() => setMode('choose')}
              >
                ← Choose Questions Instead
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: COMPLETED SUCCESS VIEW ─────────────────────────────────── */}
        {mode === 'completed' && (
          <div className="checkin-body-content checkin-completed-view">
            <div className="streak-celebration-hero">
              <div className="streak-badge-premium">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <span className="streak-count-value">{streakCount} Day{streakCount > 1 ? 's' : ''}</span>
              </div>
              <h2 className="streak-title">
                {streakCount > 1 ? `${streakCount}-Day Streak Maintained` : 'First Day Logged'}
              </h2>
              <p className="streak-sub">
                {isNewStreak
                  ? 'Your consistency is logged. Regular micro-checkins build lasting emotional stability.'
                  : 'You have completed today\'s mindful check-in. Continue tomorrow to keep your streak.'}
              </p>
            </div>

            {/* Clinical Reflection Card */}
            <div className="daily-improvement-card">
              <div className="improvement-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <strong>Daily Clinical Reflection</strong>
              </div>
              <p className="improvement-text">
                {dailyInsight || 'Small daily calibrations compound into long-term emotional regulation and reduced burnout vulnerability.'}
              </p>
            </div>

            <div className="completed-action-row">
              <button
                type="button"
                className="btn-checkin-done-primary"
                onClick={handleClose}
              >
                Continue to SoulSpace
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DailyCheckinModal;
