import React, { useState } from 'react';
import './BookSummaryModal.css';

interface BookSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookSummaryModal: React.FC<BookSummaryModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  if (!isOpen) return null;

  const chapters = [
    {
      id: 'overview',
      number: 'Overview',
      title: 'Brain, Body, and Healing Trauma',
      content: (
        <div className="book-chapter-content">
          <p className="chapter-lead">
            <em>The Body Keeps the Score</em> explores how trauma can affect the brain, body, emotions, memory, relationships, and sense of self.
          </p>
          <p>
            Psychiatrist <strong>Bessel van der Kolk</strong> argues that traumatic experiences are not simply memories stored in the mind—they can also influence how the body responds to the world long after the original danger has passed.
          </p>
          <div className="book-callout-card">
            💡 <strong>The Central Message:</strong> Healing requires more than simply understanding what happened. People also need ways to feel safe in their bodies, reconnect with themselves, and develop healthier relationships.
          </div>
        </div>
      )
    },
    {
      id: 'chapter-1',
      number: 'Chapter 1',
      title: 'What Is Trauma?',
      content: (
        <div className="book-chapter-content">
          <p>Trauma occurs when an experience overwhelms a person's ability to cope.</p>
          <h4>Common Sources of Trauma Include:</h4>
          <ul className="book-bullet-list">
            <li>Abuse or neglect</li>
            <li>Violence & accidents or natural disasters</li>
            <li>War & combat exposure</li>
            <li>Significant loss & grief</li>
            <li>Repeated exposure to frightening situations</li>
            <li>Childhood experiences that undermine safety and trust</li>
          </ul>
          <div className="book-insight-quote">
            “Trauma affects people differently. Two people can experience identical events and respond with completely different physiological and emotional patterns.”
          </div>
        </div>
      )
    },
    {
      id: 'chapter-2',
      number: 'Chapter 2',
      title: 'How Trauma Changes the Brain',
      content: (
        <div className="book-chapter-content">
          <p>
            One of the book's major scientific insights is that traumatic experiences can physically change how the brain processes danger, memory, emotions, and relationships.
          </p>
          <p>
            After trauma, the autonomic nervous system may remain trapped in hypervigilance. A person might experience:
          </p>
          <div className="symptom-tag-cloud">
            <span className="symptom-pill">Hypervigilance</span>
            <span className="symptom-pill">Chronic Anxiety</span>
            <span className="symptom-pill">Emotional Numbness</span>
            <span className="symptom-pill">Brain Fog & Concentration</span>
            <span className="symptom-pill">Sleep Disturbances</span>
            <span className="symptom-pill">Triggers to Past Reminders</span>
            <span className="symptom-pill">Depersonalization / Disconnection</span>
          </div>
          <div className="book-callout-card alert">
            ⚠️ A person may intellectually understand that they are safe in the present moment, while their body continues to react as though immediate danger is occurring.
          </div>
        </div>
      )
    },
    {
      id: 'chapter-3',
      number: 'Chapter 3',
      title: 'Why the Body Matters',
      content: (
        <div className="book-chapter-content">
          <p>
            The title refers to the fundamental discovery that traumatic experiences leave physiological imprints directly in the somatic nervous system.
          </p>
          
          <div className="body-connection-diagram">
            <div className="diagram-step">
              <span className="step-icon">🧠</span>
              <strong>Mind & Brain</strong>
              <small>Thoughts, intrusive memories & threat detection</small>
            </div>
            <div className="diagram-arrow">➔</div>
            <div className="diagram-step">
              <span className="step-icon">⚡</span>
              <strong>Nervous System</strong>
              <small>Fight, flight, freeze, or shutdown states</small>
            </div>
            <div className="diagram-arrow">➔</div>
            <div className="diagram-step">
              <span className="step-icon">🫀</span>
              <strong>Somatic Body</strong>
              <small>Muscle tension, visceral pain & heart rate</small>
            </div>
            <div className="diagram-arrow">➔</div>
            <div className="diagram-step">
              <span className="step-icon">🤝</span>
              <strong>Relationships</strong>
              <small>Trust, safety, attachment & intimacy</small>
            </div>
          </div>

          <p>
            This is why healing often requires learning to recognize and regulate visceral bodily sensations, rather than relying exclusively on cognitive talk therapy.
          </p>
        </div>
      )
    },
    {
      id: 'chapter-4',
      number: 'Chapter 4',
      title: 'Trauma and Memory',
      content: (
        <div className="book-chapter-content">
          <p>
            Traumatic memories behave very differently from narrative autobiographical memories. Instead of feeling like something in the past, a sensory trigger produces an immediate, visceral survival reaction.
          </p>
          <p>
            A sound, smell, room setting, facial expression, or muscle sensation can instantly reactivate the alarm center (amygdala).
          </p>
          <div className="memory-shift-box">
            <div className="shift-label">The Central Recovery Shift:</div>
            <div className="shift-mantra">
              “That happened then. <strong>I am safe here now.</strong>”
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chapter-5',
      number: 'Chapter 5',
      title: 'The Importance of Safety',
      content: (
        <div className="book-chapter-content">
          <p>
            The primary foundation of recovery is developing a deep, internalized sense of physical and emotional safety.
          </p>
          <div className="safety-barriers-box">
            <h4>Without perceived safety, it becomes difficult to:</h4>
            <ul>
              <li>Trust others and accept care</li>
              <li>Regulate intense emotional surges</li>
              <li>Tolerate and interpret bodily sensations</li>
              <li>Process painful memories without retraumatization</li>
              <li>Form healthy, reciprocal relationships</li>
            </ul>
          </div>
          <p>
            Healing therefore often begins with establishing grounding and stability, rather than rushing to confront past trauma.
          </p>
        </div>
      )
    },
    {
      id: 'chapter-6',
      number: 'Chapter 6',
      title: 'Reconnecting With the Body',
      content: (
        <div className="book-chapter-content">
          <p>
            Van der Kolk emphasizes body-oriented (somatic) modalities that help people re-inhabit their bodies safely:
          </p>
          <div className="therapies-grid">
            <div className="therapy-card">
              <span className="therapy-icon">🧘</span>
              <strong>Mindfulness & Yoga</strong>
              <small>Gentle awareness of breath and posture</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">🏃</span>
              <strong>Movement & Rhythms</strong>
              <small>Discharging stored tension and freeze states</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">🎭</span>
              <strong>Creative Expression</strong>
              <small>Theater, art, and voice embodiment</small>
            </div>
            <div className="therapy-card">
              <span className="therapy-icon">🔬</span>
              <strong>Neurofeedback</strong>
              <small>Retraining brainwave stability and calm</small>
            </div>
          </div>
          <p className="footer-takeaway">
            <strong>Key Principle:</strong> Learn to notice bodily sensations without becoming immediately overwhelmed by them.
          </p>
        </div>
      )
    },
    {
      id: 'chapter-7',
      number: 'Chapter 7',
      title: 'Relationships and Connection',
      content: (
        <div className="book-chapter-content">
          <p>
            Trauma can severely damage attachment and the capacity to trust others. Supportive human relationships play an irreplaceable role in neurological healing.
          </p>
          <div className="connection-highlight-card">
            🤝 Feeling seen, respected, and safe with another person gradually restores the neural circuits of social engagement (Polyvagal ventral vagal pathway).
          </div>
        </div>
      )
    },
    {
      id: 'framework',
      number: 'Synthesis',
      title: 'The Core Insight & Healing Framework',
      content: (
        <div className="book-chapter-content">
          <div className="core-insight-box">
            <h3>🌟 The Core Insight</h3>
            <p>
              Trauma affects both the mind and the body—so true healing requires reconnecting with both. Understanding trauma intellectually is valuable, but recovery also requires regulating the nervous system, experiencing safety, and reconnecting with community.
            </p>
          </div>

          <h4>A Simple Healing Framework</h4>
          <div className="framework-flow-steps">
            <span className="flow-step">Recognize</span> ➔ 
            <span className="flow-step">Understand</span> ➔ 
            <span className="flow-step">Feel</span> ➔ 
            <span className="flow-step">Regulate</span> ➔ 
            <span className="flow-step">Reconnect</span> ➔ 
            <span className="flow-step highlight">Heal</span>
          </div>

          <p className="closure-statement">
            <em>“The goal isn't necessarily to erase the past. Healing means reaching a point where the past no longer controls the present.”</em>
          </p>

          <div className="clinical-notice-card">
            <h4>⚖️ Important Clinical Note</h4>
            <p>
              <em>The Body Keeps the Score</em> is an influential work that offers valuable perspectives on trauma, though specific therapeutic modalities continue to be studied and refined. For trauma symptoms, consulting with a licensed mental health professional provides personalized and safe care.
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
            <h2 className="book-main-title">The Body Keeps the Score</h2>
            <span className="book-author">by Bessel van der Kolk, M.D.</span>
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
                ← Previous Chapter
              </button>

              <span className="page-counter">
                {activeChapter + 1} of {chapters.length}
              </span>

              <button 
                className="btn-book-nav"
                disabled={activeChapter === chapters.length - 1}
                onClick={() => setActiveChapter(prev => Math.min(chapters.length - 1, prev + 1))}
              >
                Next Chapter →
              </button>
            </div>
          </main>

        </div>

      </div>
    </div>
  );
};
