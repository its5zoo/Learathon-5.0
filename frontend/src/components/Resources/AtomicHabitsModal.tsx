import React, { useState } from 'react';
import './BookSummaryModal.css';

interface AtomicHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtomicHabitsModal: React.FC<AtomicHabitsModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  if (!isOpen) return null;

  const chapters = [
    {
      id: 'intro',
      number: 'Introduction',
      title: 'Small Changes, Meaningful Results',
      content: (
        <div className="book-chapter-content">
          <p className="chapter-lead">
            Your life is shaped by what you repeatedly do.
          </p>
          <p>
            A single healthy choice may seem insignificant—a glass of water, a short walk, five minutes of journaling, going to bed a little earlier, or putting your phone away for a few minutes. But when small actions are repeated consistently, they gradually become powerful habits.
          </p>
          <div className="book-callout-card">
            💡 <strong>The Atomic Principle:</strong> Small changes, repeated consistently, can create remarkable results over time. You do not need to completely transform your life overnight.
          </div>
        </div>
      )
    },
    {
      id: 'ch1',
      number: 'Chapter 1',
      title: 'The Power of Small Changes',
      content: (
        <div className="book-chapter-content">
          <p>
            Many people approach self-improvement with an all-or-nothing mindset. Dramatic overhauls require enormous willpower, which drains quickly when stress rises.
          </p>
          <h4>Start Extremely Small:</h4>
          <ul className="book-bullet-list">
            <li>Instead of exercising 1 hour ➔ <strong>Start with 5–10 minutes</strong></li>
            <li>Instead of meditating 30 minutes ➔ <strong>Start with 2 minutes</strong></li>
            <li>Instead of reading a whole chapter ➔ <strong>Read one page</strong></li>
            <li>Instead of fixing your whole sleep schedule ➔ <strong>Move bedtime 15 minutes earlier</strong></li>
          </ul>
          <div className="book-insight-quote">
            “The important question is not ‘How much can I accomplish today?’ but <strong>‘What small action can I repeat tomorrow?’</strong>”
          </div>
        </div>
      )
    },
    {
      id: 'ch2',
      number: 'Chapter 2',
      title: 'Your Habits Shape Your Identity',
      content: (
        <div className="book-chapter-content">
          <p>Habits are not only about outcomes—they shape how you see yourself.</p>
          <div className="thought-comparison-grid">
            <div className="thought-item">
              <span className="negative-thought">Outcome Focus: “I am trying to read more.”</span>
              <span className="positive-thought">Identity Focus: “I am a person who reads.”</span>
            </div>
            <div className="thought-item">
              <span className="negative-thought">Goal: Become calmer</span>
              <span className="positive-thought">Identity: “I am someone who pauses before reacting.”</span>
            </div>
            <div className="thought-item">
              <span className="negative-thought">Goal: Improve mental wellness</span>
              <span className="positive-thought">Identity: “I am someone who regularly cares for my mental and emotional needs.”</span>
            </div>
          </div>
          <p>Every tiny positive action is a vote for the type of person you wish to become.</p>
        </div>
      )
    },
    {
      id: 'ch3',
      number: 'Chapter 3',
      title: 'The Four Laws of Better Habits',
      content: (
        <div className="book-chapter-content">
          <div className="therapies-grid">
            <div className="therapy-card">
              <span className="therapy-icon">👁️</span>
              <strong>1. Make It Obvious</strong>
              <small>Keep water bottles, journals, and reminders in plain sight.</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">✨</span>
              <strong>2. Make It Attractive</strong>
              <small>Pair walking with favorite podcasts or stretching with calming music.</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">⚡</span>
              <strong>3. Make It Easy</strong>
              <small>Reduce friction: prep clothes beforehand, start with 2 minutes.</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">🎉</span>
              <strong>4. Make It Satisfying</strong>
              <small>Celebrate small wins, use checkboxes and habit trackers.</small>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ch4',
      number: 'Chapter 4',
      title: 'Mental Wellness Begins With Daily Basics',
      content: (
        <div className="book-chapter-content">
          <p>Mental wellness requires a physiological foundation of daily care:</p>
          <div className="symptom-tag-cloud">
            <span className="symptom-pill">😴 Sleep: Consistent bedtime & wind-down</span>
            <span className="symptom-pill">🚶 Movement: 5–20 min daily walking</span>
            <span className="symptom-pill">💧 Hydration & Nutrition: Fueling the brain</span>
            <span className="symptom-pill">🛋️ Guilt-Free Rest: Scheduled recharge</span>
          </div>
          <div className="book-callout-card">
            🌿 <em>“Rest is not a failure of discipline—rest is an essential part of a sustainable routine.”</em>
          </div>
        </div>
      )
    },
    {
      id: 'ch5-6',
      number: 'Chapters 5 & 6',
      title: 'The Two-Minute Rule & Habit Stacking',
      content: (
        <div className="book-chapter-content">
          <h4>The 2-Minute Rule</h4>
          <p>Scale down any habit until it takes under two minutes to start:</p>
          <ul className="book-bullet-list">
            <li>“Meditate 30 mins” ➔ <strong>Sit quietly for 2 minutes</strong></li>
            <li>“Clean room” ➔ <strong>Put away one item</strong></li>
            <li>“Journal nightly” ➔ <strong>Write one sentence</strong></li>
          </ul>

          <h4>Habit Stacking Formula</h4>
          <div className="memory-shift-box">
            <div className="shift-label">The Stacking Formula</div>
            <div className="shift-mantra">
              “After I [Existing Habit], I will [New Small Habit].”
            </div>
          </div>
          <p className="footer-takeaway">
            <em>Example: “After I finish lunch, I will take a 5-minute walk outside.”</em>
          </p>
        </div>
      )
    },
    {
      id: 'ch7-8',
      number: 'Chapters 7 & 8',
      title: 'Environment Design & 5-Minute Reset',
      content: (
        <div className="book-chapter-content">
          <h4>Environment Reset</h4>
          <p>Make good habits effortless and unwanted distractions inconvenient.</p>
          
          <h4>The 5-Minute Stress Reset</h4>
          <div className="framework-flow-steps">
            <span className="flow-step">1. Pause</span> ➔ 
            <span className="flow-step">2. Breathe</span> ➔ 
            <span className="flow-step">3. Notice</span> ➔ 
            <span className="flow-step">4. Simplify</span> ➔ 
            <span className="flow-step highlight">5. Act</span>
          </div>
          <p>
            When overwhelmed, ask: <strong>“What is the single next manageable action I can take right now?”</strong>
          </p>
        </div>
      )
    },
    {
      id: 'ch9-10',
      number: 'Chapters 9 & 10',
      title: 'Self-Compassion & "Never Miss Twice"',
      content: (
        <div className="book-chapter-content">
          <p>
            One missed day does not ruin your progress. Harsh self-criticism leads to quitting; self-compassion fuels persistence.
          </p>
          <div className="connection-highlight-card">
            🛡️ <strong>Rule: Never Miss Twice.</strong> Missing one workout or meditation session happens. Restart immediately the next day to prevent an accidental pattern.
          </div>
          <div className="framework-flow-steps">
            <span className="flow-step">Miss once ➔ Restart</span>
            <span className="flow-step">Struggle ➔ Adjust</span>
            <span className="flow-step highlight">Fall behind ➔ Begin again</span>
          </div>
        </div>
      )
    },
    {
      id: 'ch11-13',
      number: 'Chapters 11–13',
      title: 'Daily Routine & 7-Day Challenge',
      content: (
        <div className="book-chapter-content">
          <h4>Sample Mental Wellness Foundation:</h4>
          <ul className="book-bullet-list">
            <li><strong>Morning:</strong> 2 min slow breathing + 5 min movement + 1 top priority</li>
            <li><strong>Afternoon:</strong> 5–10 min walk + step away from screens</li>
            <li><strong>Evening:</strong> 5 min reflection + phone away before bed + 1 gratitude point</li>
          </ul>

          <h4>Weekly Habit Tracker Template</h4>
          <div className="ratings-table-wrapper">
            <table className="guide-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Habit (e.g. 5m Walk)</th>
                  <th>Done?</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <tr key={d}>
                    <td><strong>{d}</strong></td>
                    <td><input type="text" placeholder="Habit goal..." /></td>
                    <td><input type="checkbox" /></td>
                    <td><input type="text" placeholder="Reflections..." /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'conclusion',
      number: 'Summary',
      title: 'Small Steps, Better Days & Formula',
      content: (
        <div className="book-chapter-content">
          <div className="core-insight-box">
            <h3>🌟 The Atomic Wellness Formula</h3>
            <p>
              <strong>Make it Obvious ➔ Make it Attractive ➔ Make it Easy ➔ Make it Satisfying ➔ Repeat Consistently ➔ Reflect & Adjust ➔ Grow Gradually</strong>
            </p>
          </div>

          <p className="closure-statement">
            <em>“You don't need to change your entire life overnight. You only need to make the next small choice a little better.”</em>
          </p>

          <div className="clinical-notice-card">
            <h4>⚖️ Educational Disclaimer</h4>
            <p>
              This guide is for educational and self-care enrichment. Daily routines provide immense mental health support, but they do not replace professional psychological or medical care when needed.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="book-modal-backdrop" onClick={onClose}>
      <div className="book-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Book Header / Toolbar */}
        <div className="book-reader-header">
          <div className="book-header-left">
            <span className="book-badge">E-BOOK SUMMARY</span>
            <h2 className="book-main-title">Atomic Habits & Mental Wellness</h2>
            <span className="book-author">A Practical Guide to Building Better Habits</span>
          </div>

          <div className="book-header-controls">
            <button 
              className={`btn-font-toggle ${fontSize === 'large' ? 'active' : ''}`} 
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              title="Toggle font size"
            >
              Aa
            </button>
            <button className="btn-book-print" onClick={() => window.print()}>
              <span>🖨️</span> Print Summary
            </button>
            <button className="btn-book-close" onClick={onClose} aria-label="Close book">
              ✕
            </button>
          </div>
        </div>

        {/* Reader Body: Sidebar Chapters + Chapter View */}
        <div className="book-reader-body">
          
          {/* Chapter Table of Contents */}
          <aside className="book-toc-sidebar">
            <div className="toc-title">Table of Contents</div>
            <ul className="toc-list">
              {chapters.map((ch, idx) => (
                <li 
                  key={ch.id}
                  className={`toc-item ${activeChapter === idx ? 'active' : ''}`}
                  onClick={() => setActiveChapter(idx)}
                >
                  <span className="toc-chapter-number">{ch.number}</span>
                  <span className="toc-chapter-title">{ch.title}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Active Chapter Book Page */}
          <main className={`book-page-viewer font-${fontSize}`}>
            <div className="book-page-header">
              <span className="page-chapter-label">{chapters[activeChapter].number}</span>
              <h1 className="page-chapter-title">{chapters[activeChapter].title}</h1>
            </div>

            <div className="page-body-container">
              {chapters[activeChapter].content}
            </div>

            {/* Book Pagination Navigation */}
            <div className="book-pagination-footer">
              <button 
                className="btn-book-nav" 
                disabled={activeChapter === 0}
                onClick={() => setActiveChapter(prev => Math.max(0, prev - 1))}
              >
                ← Previous Section
              </button>

              <span className="page-counter">
                {activeChapter + 1} of {chapters.length}
              </span>

              <button 
                className="btn-book-nav"
                disabled={activeChapter === chapters.length - 1}
                onClick={() => setActiveChapter(prev => Math.min(chapters.length - 1, prev + 1))}
              >
                Next Section →
              </button>
            </div>
          </main>

        </div>

      </div>
    </div>
  );
};
