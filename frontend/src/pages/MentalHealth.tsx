import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MentalHealth.css';

interface Assessment {
  id: string;
  code: string;
  title: string;
  category: string;
  questionsCount: number;
  timeEstimate: string;
  badge: string;
  description: string;
  questions: {
    text: string;
    options: { text: string; score: number }[];
  }[];
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
    description: 'Assesses the presence and severity of depressive symptoms and emotional well-being over the past two weeks.',
    questions: [
      {
        text: 'Little interest or pleasure in doing things?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      {
        text: 'Feeling down, depressed, or hopeless?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      {
        text: 'Trouble falling or staying asleep, or sleeping too much?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      {
        text: 'Feeling tired or having little energy?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      }
    ]
  },
  {
    id: 'gad7',
    code: 'GAD-7',
    title: 'Anxiety & Panic Screener',
    category: 'Anxiety Index',
    questionsCount: 7,
    timeEstimate: '4 mins',
    badge: 'High Precision',
    description: 'Measures the severity of generalized anxiety, restlessness, and excessive worrying in daily situations.',
    questions: [
      {
        text: 'Feeling nervous, anxious, or on edge?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      {
        text: 'Not being able to stop or control worrying?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      {
        text: 'Worrying too much about different things?',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      }
    ]
  },
  {
    id: 'pss10',
    code: 'PSS-10',
    title: 'Perceived Stress & Burnout',
    category: 'Stress Level',
    questionsCount: 10,
    timeEstimate: '6 mins',
    badge: 'Lifestyle & Work',
    description: 'Evaluates the degree to which life events and daily pressures feel unpredictable, uncontrollable, and overwhelming.',
    questions: [
      {
        text: 'How often have you felt upset because of something that happened unexpectedly?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 }
        ]
      },
      {
        text: 'How often have you felt that you were unable to control the important things in your life?',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Almost Never', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Fairly Often', score: 3 },
          { text: 'Very Often', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'isi',
    code: 'ISI-7',
    title: 'Sleep Quality & Well-being',
    category: 'Sleep & Recovery',
    questionsCount: 7,
    timeEstimate: '5 mins',
    badge: 'Rest & Recovery',
    description: 'Assesses the nature, severity, and daytime impact of insomnia and inconsistent sleep patterns.',
    questions: [
      {
        text: 'Difficulty falling asleep at night?',
        options: [
          { text: 'None', score: 0 },
          { text: 'Mild', score: 1 },
          { text: 'Moderate', score: 2 },
          { text: 'Severe', score: 3 },
          { text: 'Very Severe', score: 4 }
        ]
      },
      {
        text: 'How satisfied or dissatisfied are you with your current sleep pattern?',
        options: [
          { text: 'Very Satisfied', score: 0 },
          { text: 'Satisfied', score: 1 },
          { text: 'Neutral', score: 2 },
          { text: 'Dissatisfied', score: 3 },
          { text: 'Very Dissatisfied', score: 4 }
        ]
      }
    ]
  }
];

const MentalHealth: React.FC = () => {
  const navigate = useNavigate();
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prerequisite checks state
  const [prereqs, setPrereqs] = useState({
    quietSpace: false,
    honestAnswers: false,
    crisisAwareness: false
  });

  const allPrereqsMet = isLoggedIn && prereqs.quietSpace && prereqs.honestAnswers && prereqs.crisisAwareness;

  // Active Assessment Modal State
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartAssessment = (assessment: Assessment) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setActiveAssessment(assessment);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPrereqs({ quietSpace: false, honestAnswers: false, crisisAwareness: false });
  };

  const handleAnswerSelect = (score: number) => {
    if (!activeAssessment) return;
    const newAnswers = { ...answers, [currentQuestionIdx]: score };
    setAnswers(newAnswers);

    if (currentQuestionIdx < activeAssessment.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateTotalScore = () => {
    return Object.values(answers).reduce((acc, curr) => acc + curr, 0);
  };

  const getScoreSummary = (score: number) => {
    if (score <= 2) {
      return {
        level: 'Minimal / Normal Range',
        color: '#10b981',
        advice: 'Your responses indicate positive emotional equilibrium. Continue practicing mindful wellness and healthy lifestyle habits.'
      };
    } else if (score <= 5) {
      return {
        level: 'Mild Symptoms Detected',
        color: '#f59e0b',
        advice: 'You may be experiencing mild stress or tension. Engaging with calming audio or self-help guided exercises can provide immediate clarity.'
      };
    } else {
      return {
        level: 'Moderate to Elevated Symptoms',
        color: '#ef4444',
        advice: 'Your results suggest meaningful emotional strain. We strongly recommend speaking with one of our licensed counselors for personalized care.'
      };
    }
  };

  return (
    <div className="mental-health-page">
      {/* Hero Banner with Pink/Purple Gradient & Glowing Neural Asset */}
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

        {/* Compact Frosted Glass Stats Pill */}
        <div className="container mh-horizontal-stats-container">
          <div className="mh-stats-pill">
            <div className="mh-pill-stat">
              <span className="mh-pill-val">50K+</span>
              <span className="mh-pill-lbl">Individuals Helped</span>
            </div>
            <div className="mh-pill-divider"></div>
            <div className="mh-pill-stat">
              <span className="mh-pill-val">95%</span>
              <span className="mh-pill-lbl">Accuracy Rate</span>
            </div>
            <div className="mh-pill-divider"></div>
            <div className="mh-pill-stat">
              <span className="mh-pill-val">24/7</span>
              <span className="mh-pill-lbl">Support Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="mh-content-section" id="prereq-section">
        <div className="container">
          
          {/* Assessment Prerequisites Card */}
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
                  <h2 className="prereq-title">Assessment Prerequisites</h2>
                  <p className="prereq-desc">
                    To start a new mental health assessment, please review the requirements below to ensure accurate and personalized results.
                  </p>
                </div>
              </div>

              {/* Login State Toggle / Status */}
              <div className="auth-status-container">
                {isLoggedIn ? (
                  <div className="auth-logged-in-pill">
                    <span className="auth-user-dot"></span>
                    <span>Logged In (User)</span>
                    <button className="auth-logout-btn" onClick={handleLogout}>Log Out</button>
                  </div>
                ) : (
                  <button className="btn btn-primary auth-login-pill-btn" onClick={() => navigate('/login')}>
                    🔒 Login to Unlock
                  </button>
                )}
              </div>
            </div>

            {/* Warning / Advisory Notice */}
            {!isLoggedIn ? (
              <div className="prereq-alert-banner locked-banner">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b45309" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <div className="locked-banner-text">
                  <strong>Login Required:</strong> Please log in to complete your prerequisites and unlock clinical assessments.
                </div>
                <button className="btn btn-outline banner-login-btn" onClick={() => navigate('/login')}>
                  Login Now →
                </button>
              </div>
            ) : (
              <div className="prereq-alert-banner">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e11d48" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>
                  Please complete all prerequisite checkboxes below before initiating an assessment.
                </span>
              </div>
            )}

            {/* Interactive Checklist */}
            <div className={`prereq-checklist ${!isLoggedIn ? 'checklist-disabled' : ''}`}>
              <label className={`prereq-item ${prereqs.quietSpace ? 'checked' : ''} ${!isLoggedIn ? 'item-disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={prereqs.quietSpace} 
                  disabled={!isLoggedIn}
                  onChange={(e) => setPrereqs({...prereqs, quietSpace: e.target.checked})}
                />
                <div className="prereq-text">
                  <strong>Quiet & Private Environment</strong>
                  <span>Ensure you are in a quiet, comfortable space where you won't be interrupted for 5–10 minutes.</span>
                </div>
              </label>

              <label className={`prereq-item ${prereqs.honestAnswers ? 'checked' : ''} ${!isLoggedIn ? 'item-disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={prereqs.honestAnswers} 
                  disabled={!isLoggedIn}
                  onChange={(e) => setPrereqs({...prereqs, honestAnswers: e.target.checked})}
                />
                <div className="prereq-text">
                  <strong>Authentic & Honest Reflection</strong>
                  <span>Answer based on your actual feelings over the last 2 weeks rather than what you feel you "should" answer.</span>
                </div>
              </label>

              <label className={`prereq-item ${prereqs.crisisAwareness ? 'checked' : ''} ${!isLoggedIn ? 'item-disabled' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={prereqs.crisisAwareness} 
                  disabled={!isLoggedIn}
                  onChange={(e) => setPrereqs({...prereqs, crisisAwareness: e.target.checked})}
                />
                <div className="prereq-text">
                  <strong>Emergency Support Awareness</strong>
                  <span>I acknowledge that if I am in immediate crisis, I can reach out to national helpline Tele-MANAS (14416) anytime.</span>
                </div>
              </label>
            </div>
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
                <span className="status-ready">✓ Prerequisites Ready</span>
              ) : (
                <span className="status-pending">⚠️ Complete Prerequisites First</span>
              )}
            </div>
          </div>

          <div className="assessments-grid">
            {assessmentsData.map((item) => (
              <div className={`assessment-card ${!isLoggedIn ? 'card-locked' : ''}`} key={item.id}>
                <div className="card-top-tags">
                  <span className="tag-code">{item.code}</span>
                  <span className="tag-badge">{item.badge}</span>
                </div>

                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>

                <div className="card-meta-row">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{item.timeEstimate}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>{item.questionsCount} Questions</span>
                  </div>
                </div>

                <button 
                  className={`btn card-start-btn ${!isLoggedIn ? 'btn-login-unlock' : allPrereqsMet ? 'btn-primary' : 'btn-disabled'}`}
                  disabled={isLoggedIn && !allPrereqsMet}
                  onClick={() => handleStartAssessment(item)}
                >
                  {!isLoggedIn ? '🔒 Login to Unlock Assessment' : allPrereqsMet ? 'Start Assessment →' : 'Complete Prerequisites'}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive Assessment Modal */}
      {activeAssessment && (
        <div className="modal-backdrop">
          <div className="assessment-modal">
            <div className="modal-header">
              <div>
                <span className="modal-code-tag">{activeAssessment.code}</span>
                <h3 className="modal-title">{activeAssessment.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveAssessment(null)}>✕</button>
            </div>

            {!isCompleted ? (
              <div className="modal-body">
                {/* Progress indicator */}
                <div className="progress-container">
                  <div className="progress-label-row">
                    <span>Question {currentQuestionIdx + 1} of {activeAssessment.questions.length}</span>
                    <span>{Math.round(((currentQuestionIdx + 1) / activeAssessment.questions.length) * 100)}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${((currentQuestionIdx + 1) / activeAssessment.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="question-box">
                  <p className="question-instruction">Over the last 2 weeks, how often have you been bothered by:</p>
                  <h4 className="question-text">{activeAssessment.questions[currentQuestionIdx].text}</h4>

                  <div className="options-grid">
                    {activeAssessment.questions[currentQuestionIdx].options.map((opt, idx) => (
                      <button 
                        key={idx}
                        className="option-btn"
                        onClick={() => handleAnswerSelect(opt.score)}
                      >
                        <span className="option-bullet"></span>
                        <span className="option-label">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="modal-results-body">
                <div className="result-score-circle" style={{ borderColor: getScoreSummary(calculateTotalScore()).color }}>
                  <span className="score-number">{calculateTotalScore()}</span>
                  <span className="score-label">Total Score</span>
                </div>

                <h4 className="result-severity" style={{ color: getScoreSummary(calculateTotalScore()).color }}>
                  {getScoreSummary(calculateTotalScore()).level}
                </h4>

                <p className="result-advice">
                  {getScoreSummary(calculateTotalScore()).advice}
                </p>

                <div className="result-actions">
                  <button className="btn btn-outline" onClick={() => handleStartAssessment(activeAssessment)}>
                    Retake Assessment
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveAssessment(null)}>
                    Done & Save Result
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealth;
