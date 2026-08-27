import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type AssessmentResultItem } from '../context/AuthContext';
import { API_URL } from '../config';
import './MentalHealth.css';

interface QuestionOption {
  text: string;
  score: number;
}

interface Question {
  text: string;
  options: QuestionOption[];
}

interface Assessment {
  id: string;
  code: string;
  title: string;
  category: string;
  questionsCount: number;
  timeEstimate: string;
  badge: string;
  color: string;
  icon?: string;
  description: string;
  questions: Question[];
  getResult: (score: number) => { level: string; color: string; advice: string; emoji: string };
}

const assessmentsData: Assessment[] = [
  {
    id: 'phq9',
    code: 'PHQ-9',
    title: 'Depression & Mood Assessment',
    category: 'Depression Screener',
    questionsCount: 9,
    timeEstimate: '5 mins',
    badge: 'Clinical Gold Standard',
    color: '#6366f1',
    description:
      'Assesses the presence and severity of depressive symptoms over the past two weeks. Widely used by psychiatrists and GPs globally.',
    questions: [
      {
        text: 'Little interest or pleasure in doing things?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Feeling down, depressed, or hopeless?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Trouble falling or staying asleep, or sleeping too much?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Feeling tired or having little energy?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Poor appetite or overeating?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Trouble concentrating on things, such as reading or watching television?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Moving or speaking so slowly that others noticed? Or the opposite — fidgety or restless?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Thoughts that you would be better off dead, or of hurting yourself in some way?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
    ],
    getResult: (score) => {
      if (score <= 4)
        return { level: 'Minimal Depression', color: '#10b981', emoji: '😊', advice: 'Your responses suggest minimal depressive symptoms. Keep investing in your well-being through regular exercise, social connection, and mindful routines.' };
      if (score <= 9)
        return { level: 'Mild Depression', color: '#f59e0b', emoji: '😐', advice: 'Mild depressive symptoms detected. Consider journaling, guided meditation, or talking to a trusted friend. Monitoring your mood over time can be helpful.' };
      if (score <= 14)
        return { level: 'Moderate Depression', color: '#f97316', emoji: '😔', advice: 'Your results indicate moderate depression. We recommend connecting with a counselor or therapist for a personalized care plan.' };
      if (score <= 19)
        return { level: 'Moderately Severe Depression', color: '#ef4444', emoji: '😞', advice: 'Moderately severe symptoms detected. Please consider reaching out to a mental health professional soon. You are not alone in this.' };
      return { level: 'Severe Depression', color: '#dc2626', emoji: '🆘', advice: 'Severe depressive symptoms. Please reach out immediately — contact Tele-MANAS (14416) or speak with a licensed mental health professional today.' };
    },
  },
  {
    id: 'gad7',
    code: 'GAD-7',
    title: 'Anxiety & Panic Screener',
    category: 'Anxiety Index',
    questionsCount: 7,
    timeEstimate: '4 mins',
    badge: 'High Precision',
    color: '#8b5cf6',
    description:
      'Measures the severity of generalized anxiety, restlessness, and excessive worrying in daily life. Standard tool used in clinical settings worldwide.',
    questions: [
      {
        text: 'Feeling nervous, anxious, or on edge?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Not being able to stop or control worrying?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Worrying too much about different things?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Trouble relaxing?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Being so restless that it is hard to sit still?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Becoming easily annoyed or irritable?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
      {
        text: 'Feeling afraid, as if something awful might happen?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 },
        ],
      },
    ],
    getResult: (score) => {
      if (score <= 4)
        return { level: 'Minimal Anxiety', color: '#10b981', emoji: '😌', advice: 'Very low anxiety levels. Great job maintaining your emotional balance. Continue healthy habits and stress-management practices.' };
      if (score <= 9)
        return { level: 'Mild Anxiety', color: '#f59e0b', emoji: '😟', advice: 'Mild anxiety is present. Breathing exercises, physical activity, and limiting caffeine can help regulate your nervous system.' };
      if (score <= 14)
        return { level: 'Moderate Anxiety', color: '#f97316', emoji: '😰', advice: 'Moderate anxiety detected. Consider cognitive-behavioral techniques or speaking with a counselor for structured support.' };
      return { level: 'Severe Anxiety', color: '#dc2626', emoji: '🆘', advice: 'Severe anxiety levels. Please consult a licensed therapist or psychiatrist. Call Tele-MANAS (14416) if you need immediate help.' };
    },
  },
  {
    id: 'pss10',
    code: 'PSS-10',
    title: 'Perceived Stress Scale',
    category: 'Stress Evaluation',
    questionsCount: 10,
    timeEstimate: '6 mins',
    badge: 'Research Validated',
    color: '#ec4899',
    description:
      'The most widely used psychological instrument to measure how unpredictable, uncontrollable, and overloading you perceive your life over the past month.',
    questions: [
      {
        text: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
      {
        text: 'How often have you felt unable to control the important things in your life?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
      {
        text: 'How often have you felt nervous and stressed?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
      {
        text: 'How often have you felt confident in your ability to handle personal problems? (reverse)',
        options: [
          { text: 'Very Often', score: 0 },
          { text: 'Fairly Often', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Almost Never', score: 3 },
          { text: 'Never', score: 4 },
        ],
      },
      {
        text: 'How often have you felt that things were going your way? (reverse)',
        options: [
          { text: 'Very Often', score: 0 },
          { text: 'Fairly Often', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Almost Never', score: 3 },
          { text: 'Never', score: 4 },
        ],
      },
      {
        text: 'How often have you been unable to cope with all the things you had to do?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
      {
        text: 'How often have you been able to control irritations in your life? (reverse)',
        options: [
          { text: 'Very Often', score: 0 },
          { text: 'Fairly Often', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Almost Never', score: 3 },
          { text: 'Never', score: 4 },
        ],
      },
      {
        text: 'How often have you felt that you were on top of things? (reverse)',
        options: [
          { text: 'Very Often', score: 0 },
          { text: 'Fairly Often', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Almost Never', score: 3 },
          { text: 'Never', score: 4 },
        ],
      },
      {
        text: 'How often have you been angered because of things outside of your control?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
      {
        text: 'How often have you felt difficulties were piling up so high that you could not overcome them?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 },
        ],
      },
    ],
    getResult: (score) => {
      if (score <= 13)
        return { level: 'Low Perceived Stress', color: '#10b981', emoji: '🧘', advice: 'You are managing life demands well. Your stress coping mechanisms appear healthy and effective.' };
      if (score <= 26)
        return { level: 'Moderate Perceived Stress', color: '#f59e0b', emoji: '😤', advice: 'Moderate stress is common but worth addressing. Try mindfulness, time-blocking, and setting boundaries to reduce cognitive overload.' };
      return { level: 'High Perceived Stress', color: '#dc2626', emoji: '🆘', advice: 'High stress detected. Your body and mind need relief. Please connect with a professional and explore structured stress management programs.' };
    },
  },
  {
    id: 'wemwbs',
    code: 'WEMWBS',
    title: 'Wellbeing & Positivity Scale',
    category: 'Wellbeing Index',
    questionsCount: 14,
    timeEstimate: '7 mins',
    badge: 'WHO Endorsed',
    color: '#06b6d4',
    description:
      'The Warwick–Edinburgh Mental Wellbeing Scale measures positive aspects of mental health including positive feelings and functioning — not just absence of illness.',
    questions: [
      {
        text: "I've been feeling optimistic about the future.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling useful.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling relaxed.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling interested in other people.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've had energy to spare.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been dealing with problems well.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been thinking clearly.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling good about myself.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling close to other people.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling confident.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been able to make up my own mind about things.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling loved.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been interested in new things.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
      {
        text: "I've been feeling cheerful.",
        options: [
          { text: 'None of the time', score: 1 },
          { text: 'Rarely', score: 2 },
          { text: 'Some of the time', score: 3 },
          { text: 'Often', score: 4 },
          { text: 'All of the time', score: 5 },
        ],
      },
    ],
    getResult: (score) => {
      if (score <= 32)
        return { level: 'Low Wellbeing', color: '#dc2626', emoji: '💙', advice: 'Your wellbeing score is below average. Focus on small daily joys — gratitude journaling, nature walks, and connecting with loved ones can help rebuild positivity.' };
      if (score <= 40)
        return { level: 'Below Average Wellbeing', color: '#f97316', emoji: '🌱', advice: 'Some positive mental health elements present, but there is meaningful room for growth. Try fostering new hobbies and purposeful social activities.' };
      if (score <= 59)
        return { level: 'Average Wellbeing', color: '#f59e0b', emoji: '😊', advice: 'You are in the healthy average range. Building intentional routines around self-care can push your wellbeing even higher.' };
      return { level: 'High Wellbeing', color: '#10b981', emoji: '🌟', advice: 'Excellent wellbeing score! You demonstrate strong mental flourishing. Keep nurturing your social bonds, purpose, and self-compassion.' };
    },
  },
];

type ModalStep = 'consent' | 'questions' | 'results';

const MentalHealth: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isLoggedIn, recordAssessmentLocally, refreshUser } = useAuth();

  const [prereqs, setPrereqs] = useState({
    quietSpace: false,
    honestAnswers: false,
    crisisAwareness: false,
  });
  const allPrereqsMet = isLoggedIn && prereqs.quietSpace && prereqs.honestAnswers && prereqs.crisisAwareness;

  const allAssessmentHistory: AssessmentResultItem[] = useMemo(() => {
    const fromUser = user?.assessmentResults || [];
    let fromLocal: AssessmentResultItem[] = [];
    try {
      const raw = localStorage.getItem('ss_assessment_history');
      if (raw) fromLocal = JSON.parse(raw);
    } catch {}

    const map = new Map<string, AssessmentResultItem>();
    [...fromUser, ...fromLocal].forEach((item) => {
      const key = `${item.assessmentId || item.code}_${item.completedAt}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [user?.assessmentResults]);

  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('consent');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (activeAssessment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeAssessment]);

  const handleStartAssessment = (assessment: Assessment) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!allPrereqsMet) return;
    setActiveAssessment(assessment);
    setModalStep('consent');
    setCurrentQuestionIdx(0);
    setAnswers({});
  };

  const handleConsentAccept = () => setModalStep('questions');

  const handleAnswerSelect = (score: number) => {
    if (!activeAssessment) return;
    const newAnswers = { ...answers, [currentQuestionIdx]: score };
    setAnswers(newAnswers);
    if (currentQuestionIdx < activeAssessment.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      const totalScore = Object.values(newAnswers).reduce((a, b) => a + b, 0);
      const result = activeAssessment.getResult(totalScore);
      const completedAt = new Date().toISOString();

      const resultItem: AssessmentResultItem = {
        assessmentId: activeAssessment.id,
        code: activeAssessment.code,
        title: activeAssessment.title,
        score: totalScore,
        severity: result.level,
        completedAt,
      };

      recordAssessmentLocally(resultItem);

      if (token) {
        fetch(`${API_URL}/assessments/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(resultItem),
        })
          .then(() => refreshUser())
          .catch(() => {});
      }

      setModalStep('results');
    }
  };

  const calculateTotalScore = () => Object.values(answers).reduce((a, b) => a + b, 0);

  const handleCloseModal = () => {
    setActiveAssessment(null);
    setModalStep('consent');
    setCurrentQuestionIdx(0);
    setAnswers({});
  };

  const getSeverityBadgeClass = (severity: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('minimal') || s.includes('none') || s.includes('high') || s.includes('average')) return 'badge-success';
    if (s.includes('mild') || s.includes('subthreshold') || s.includes('below')) return 'badge-warning';
    if (s.includes('moderate')) return 'badge-orange';
    return 'badge-danger';
  };

  return (
    <div className="mental-health-page">
      <section className="mh-hero">
        <div className="mh-hero-bg-overlay"></div>
        <div className="container mh-hero-container">
          <div className="mh-hero-content">
            <div className="mh-title-wrapper">
              <div className="mh-brain-icon-badge">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"></path>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"></path>
                </svg>
              </div>
              <h1 className="mh-hero-title">
                Mental Health<br />Assessment Center
              </h1>
            </div>
            <p className="mh-hero-description">
              Track your mental wellness journey with scientifically validated assessments and personalized insights designed specifically for your well-being.
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="container mh-horizontal-stats-container">
          <div className="mh-stats-pill">
            <div className="mh-pill-stat"><span className="mh-pill-val">50K+</span><span className="mh-pill-lbl">Individuals Helped</span></div>
            <div className="mh-pill-divider"></div>
            <div className="mh-pill-stat"><span className="mh-pill-val">95%</span><span className="mh-pill-lbl">Accuracy Rate</span></div>
            <div className="mh-pill-divider"></div>
            <div className="mh-pill-stat"><span className="mh-pill-val">24/7</span><span className="mh-pill-lbl">Support Available</span></div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <section className="mh-content-section" id="prereq-section">
        <div className="container">

          {/* Prerequisites Card */}
          <div className="prereq-card">
            <div className="prereq-header-row">
              <div className="prereq-header">
                <div className="prereq-icon-badge">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3f72af" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 className="prereq-title">Before You Begin</h2>
                  <p className="prereq-desc">
                    Please confirm these three things to help us deliver the most accurate and meaningful assessment results for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Login gate banner */}
            {!isLoggedIn ? (
              <div className="prereq-alert-banner locked-banner">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b45309" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <div className="locked-banner-text">
                  <strong>Login Required:</strong> Please log in to complete prerequisites and unlock clinical assessments.
                </div>
                <button className="btn btn-outline banner-login-btn" onClick={() => navigate('/login')}>Login Now →</button>
              </div>
            ) : (
              <div className="prereq-alert-banner success-banner">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#059669" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>You are logged in. Complete the checklist below to unlock your assessments.</span>
              </div>
            )}

            {/* Checklist */}
            <div className={`prereq-checklist ${!isLoggedIn ? 'checklist-disabled' : ''}`}>
              {[
                {
                  key: 'quietSpace' as const,
                  title: 'Quiet & Private Environment',
                  desc: 'Ensure you are in a quiet, comfortable space where you won\'t be interrupted for 5–10 minutes.',
                  icon: '🏠',
                },
                {
                  key: 'honestAnswers' as const,
                  title: 'Authentic & Honest Reflection',
                  desc: 'Answer based on your actual feelings over the last 2 weeks rather than what you feel you "should" answer.',
                  icon: '💬',
                },
                {
                  key: 'crisisAwareness' as const,
                  title: 'Emergency Support Awareness',
                  desc: 'I acknowledge that if I am in immediate crisis, I can reach out to national helpline Tele-MANAS (14416) anytime.',
                  icon: '🛡️',
                },
              ].map(({ key, title, desc, icon }) => (
                <label
                  key={key}
                  className={`prereq-item ${prereqs[key] ? 'checked' : ''} ${!isLoggedIn ? 'item-disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={prereqs[key]}
                    disabled={!isLoggedIn}
                    onChange={(e) => setPrereqs({ ...prereqs, [key]: e.target.checked })}
                  />
                  <div className="prereq-item-icon">{icon}</div>
                  <div className="prereq-text">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                  <div className={`prereq-check-indicator ${prereqs[key] ? 'indicator-done' : ''}`}>
                    {prereqs[key] && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* All-met progress row */}
            {isLoggedIn && (
              <div className="prereq-progress-row">
                <div className="prereq-progress-track">
                  <div
                    className="prereq-progress-fill"
                    style={{ width: `${(Object.values(prereqs).filter(Boolean).length / 3) * 100}%` }}
                  ></div>
                </div>
                <span className="prereq-progress-label">
                  {Object.values(prereqs).filter(Boolean).length}/3 completed
                  {allPrereqsMet && ' — Ready! ✓'}
                </span>
              </div>
            )}
          </div>

          {/* Assessment Cards Grid */}
          <div className="assessments-section-header">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
                Available Clinical Assessments
              </h2>
              <p className="section-subtitle-text">
                Scientifically validated screeners designed to offer deep insights into your mental state.
              </p>
            </div>
            <div className="prereq-status-badge">
              {!isLoggedIn ? (
                <span className="status-locked">🔒 Login to Unlock</span>
              ) : allPrereqsMet ? (
                <span className="status-ready">✓ All Set — Assessments Unlocked</span>
              ) : (
                <span className="status-pending">⚠️ Complete Prerequisites First</span>
              )}
            </div>
          </div>

          <div className="assessments-grid">
            {assessmentsData.map((item) => {
              const latestAttempt = allAssessmentHistory.find(
                (h) => (h.assessmentId && h.assessmentId === item.id) || (h.code && h.code.toLowerCase() === item.code.toLowerCase())
              );
              const attemptsCount = allAssessmentHistory.filter(
                (h) => (h.assessmentId && h.assessmentId === item.id) || (h.code && h.code.toLowerCase() === item.code.toLowerCase())
              ).length;

              return (
                <div
                  className={`assessment-card ${!isLoggedIn || !allPrereqsMet ? 'card-locked' : 'card-unlocked'}`}
                  key={item.id}
                  style={{ '--card-accent': item.color } as React.CSSProperties}
                >
                  <div className="card-top-tags">
                    <span className="tag-code" style={{ color: item.color, borderColor: item.color + '33', background: item.color + '11' }}>
                      {item.code}
                    </span>
                    <span className="tag-badge">{item.badge}</span>
                  </div>

                  <div className="card-icon-row">
                    <span className="card-category">{item.category}</span>
                  </div>

                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-description">{item.description}</p>

                  {/* Previous Result / Completed Status Banner */}
                  {latestAttempt && (
                    <div className="card-tracked-status-banner" style={{ borderColor: item.color + '35', background: item.color + '0a' }}>
                      <div className="card-tracked-top">
                        <span className="card-tracked-badge" style={{ color: item.color }}>
                          <span className="tracked-dot" style={{ background: item.color }}></span>
                          Tracked: {latestAttempt.severity}
                        </span>
                        <span className="card-tracked-count">
                          {attemptsCount > 1 ? `${attemptsCount} attempts` : '1st attempt'}
                        </span>
                      </div>
                      <div className="card-tracked-score-row">
                        <span className="card-tracked-score">
                          Score: <strong>{latestAttempt.score}</strong>
                        </span>
                        <span className="card-tracked-date">
                          {new Date(latestAttempt.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="card-meta-row">
                    <div className="meta-item">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{item.timeEstimate}</span>
                    </div>
                    <div className="meta-item">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>{item.questionsCount} Questions</span>
                    </div>
                  </div>

                  <button
                    className={`btn card-start-btn ${!isLoggedIn ? 'btn-login-unlock' : allPrereqsMet ? 'btn-accent' : 'btn-disabled'}`}
                    style={allPrereqsMet ? { background: item.color } : {}}
                    disabled={isLoggedIn && !allPrereqsMet}
                    onClick={() => handleStartAssessment(item)}
                  >
                    {!isLoggedIn
                      ? '🔒 Login to Unlock'
                      : !allPrereqsMet
                      ? 'Complete Prerequisites First'
                      : latestAttempt
                      ? 'Retake Assessment ↺'
                      : 'Begin Assessment →'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Assessment History & Track Record Section ──────────────────────── */}
          <div className="mh-history-container" id="assessment-history">
            <div className="history-section-header">
              <div className="history-header-titles">
                <div className="history-badge-tag">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 8v4l3 3"></path>
                    <circle cx="12" cy="12" r="9"></circle>
                  </svg>
                  <span>Persistent Track Record</span>
                </div>
                <h2 className="section-title" style={{ textAlign: 'left', margin: '8px 0 4px 0' }}>
                  Your Assessment History
                </h2>
                <p className="section-subtitle-text">
                  Every assessment you complete is automatically recorded and tracked over time.
                </p>
              </div>
              <div className="history-header-actions">
                <span className="history-count-pill">
                  {allAssessmentHistory.length} {allAssessmentHistory.length === 1 ? 'Assessment' : 'Assessments'} Recorded
                </span>
                <button className="btn btn-outline btn-sm view-profile-btn" onClick={() => navigate('/profile')}>
                  View in Profile Hub →
                </button>
              </div>
            </div>

            {allAssessmentHistory.length === 0 ? (
              <div className="empty-history-card">
                <div className="empty-history-icon">📋</div>
                <h3 className="empty-history-title">No Assessments Completed Yet</h3>
                <p className="empty-history-text">
                  Complete any clinical screener above — your score, severity classification, and date will be tracked here automatically.
                </p>
              </div>
            ) : (
              <div className="history-cards-list">
                {allAssessmentHistory.map((entry, idx) => {
                  const matchingData = assessmentsData.find(
                    (a) => a.id === entry.assessmentId || a.code.toLowerCase() === entry.code?.toLowerCase()
                  );
                  const color = matchingData?.color || '#3b82f6';
                  return (
                    <div className="history-entry-card" key={idx} style={{ '--entry-accent': color } as React.CSSProperties}>
                      <div className="history-entry-left">
                        <span className="history-code-badge" style={{ color: color, background: color + '15', borderColor: color + '30' }}>
                          {entry.code || 'TEST'}
                        </span>
                        <div className="history-entry-details">
                          <h4 className="history-entry-title">{entry.title || matchingData?.title || 'Clinical Screener'}</h4>
                          <div className="history-entry-meta">
                            <span className="meta-date">
                              📅 {new Date(entry.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="history-entry-right">
                        <div className="history-score-box">
                          <span className="score-num" style={{ color }}>{entry.score}</span>
                          <span className="score-lbl">Score</span>
                        </div>
                        <span className={`history-severity-tag ${getSeverityBadgeClass(entry.severity)}`}>
                          {entry.severity}
                        </span>
                        {matchingData && allPrereqsMet && (
                          <button
                            className="btn btn-sm history-retake-btn"
                            style={{ background: color }}
                            onClick={() => handleStartAssessment(matchingData)}
                          >
                            Retake ↺
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Assessment Modal ──────────────────────────────────────────────── */}
      {activeAssessment && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className="assessment-modal" style={{ '--modal-accent': activeAssessment.color } as React.CSSProperties}>

            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: `3px solid ${activeAssessment.color}22` }}>
              <div className="modal-header-left">
                <div>
                  <span className="modal-code-tag" style={{ color: activeAssessment.color, background: activeAssessment.color + '15' }}>
                    {activeAssessment.code}
                  </span>
                  <h3 className="modal-title">{activeAssessment.title}</h3>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            {/* Step: Consent */}
            {modalStep === 'consent' && (
              <div className="consent-body">
                <div className="consent-illustration">
                  <div className="consent-icon-wrap" style={{ background: activeAssessment.color + '18' }}>
                    <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                      <circle cx="32" cy="32" r="30" stroke={activeAssessment.color} strokeWidth="2.5" fill={activeAssessment.color + '10'}/>
                      <path d="M20 34l8 8 16-18" stroke={activeAssessment.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h4 className="consent-title">Track Your Progress</h4>
                <p className="consent-body-text">
                  This assessment will be <strong>securely saved to your SoulSpace profile</strong> so you can track your mental wellness journey over time.
                </p>
                <ul className="consent-bullets">
                  <li>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill={activeAssessment.color}><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                    Results saved securely in your profile
                  </li>
                  <li>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill={activeAssessment.color}><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                    Track changes across multiple sessions
                  </li>
                  <li>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill={activeAssessment.color}><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                    Data is private and only visible to you
                  </li>
                </ul>
                <div className="consent-actions">
                  <button className="btn btn-outline" onClick={handleCloseModal}>Maybe Later</button>
                  <button
                    className="btn consent-accept-btn"
                    style={{ background: activeAssessment.color }}
                    onClick={handleConsentAccept}
                  >
                    Yes, Track My Progress →
                  </button>
                </div>
              </div>
            )}

            {/* Step: Questions */}
            {modalStep === 'questions' && (
              <div className="modal-body">
                <div className="progress-container">
                  <div className="progress-label-row">
                    <span>Question {currentQuestionIdx + 1} of {activeAssessment.questions.length}</span>
                    <span>{Math.round(((currentQuestionIdx) / activeAssessment.questions.length) * 100)}% done</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${((currentQuestionIdx) / activeAssessment.questions.length) * 100}%`,
                        background: activeAssessment.color,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="question-box">
                  <p className="question-instruction">Over the past 2 weeks / month, how often have you experienced:</p>
                  <h4 className="question-text">{activeAssessment.questions[currentQuestionIdx].text}</h4>

                  <div className="options-grid">
                    {activeAssessment.questions[currentQuestionIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        className="option-btn"
                        onClick={() => handleAnswerSelect(opt.score)}
                      >
                        <span className="option-bullet" style={{ borderColor: activeAssessment.color }}></span>
                        <span className="option-label">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Results */}
            {modalStep === 'results' && (() => {
              const score = calculateTotalScore();
              const result = activeAssessment.getResult(score);
              return (
                <div className="modal-results-body">
                  <div className="result-score-circle" style={{ borderColor: result.color, boxShadow: `0 0 0 8px ${result.color}15` }}>
                    <span className="score-emoji">{result.emoji}</span>
                    <span className="score-number">{score}</span>
                    <span className="score-label">Score</span>
                  </div>

                  <h4 className="result-severity" style={{ color: result.color }}>{result.level}</h4>
                  <p className="result-advice">{result.advice}</p>

                  <div className="result-meta">
                    <span className="result-meta-item">📋 {activeAssessment.code}</span>
                    <span className="result-meta-item">📅 {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="result-meta-item">👤 {user?.firstName}</span>
                  </div>

                  <div className="saved-banner">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#059669" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>✓ Result automatically tracked & saved to your profile!</span>
                  </div>

                  <div className="result-actions">
                    <button className="btn btn-outline" onClick={() => handleStartAssessment(activeAssessment)}>
                      Retake ↺
                    </button>
                    <button
                      className="btn save-btn"
                      style={{ background: activeAssessment.color }}
                      onClick={handleCloseModal}
                    >
                      Done & View History
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealth;
