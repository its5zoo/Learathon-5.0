import React, { useState } from 'react';
import './SocialAnxietyGuideModal.css';

interface SocialAnxietyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialAnxietyGuideModal: React.FC<SocialAnxietyGuideModalProps> = ({ isOpen, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="guide-modal-backdrop" onClick={onClose}>
      <div className="guide-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="guide-modal-header">
          <div className="guide-badge">7-DAY CLINICAL ACTION PLAN</div>
          <h1 className="guide-title">Overcoming Social Anxiety</h1>
          <p className="guide-subtitle">A step-by-step action plan to build confidence in social situations.</p>
          
          <div className="guide-header-actions">
            <button className="btn-guide-print" onClick={handlePrint}>
              <span>🖨️</span> Print / Save PDF
            </button>
            <button className="btn-guide-close" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="guide-modal-body">
          
          {/* Introduction Card */}
          <div className="guide-intro-banner">
            <h3>📖 Introduction</h3>
            <p>
              Social anxiety can make everyday interactions feel difficult, whether it is speaking to someone new, answering a question in class, making a phone call, or expressing an opinion. The goal of this 7-day plan is <strong>not to eliminate anxiety completely</strong>, but to gradually become more comfortable with it and build confidence through small, manageable actions.
            </p>
            <div className="guide-quote-box">
              💡 <strong>Remember:</strong> Progress matters more than perfection. If a day feels difficult, reduce the challenge rather than giving up.
            </div>
          </div>

          {/* Days 1-7 Grid / Cards */}
          <div className="guide-days-container">
            
            {/* Day 1 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 1</div>
              <h2 className="day-title">Understand Your Anxiety</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Recognize what makes you anxious.</div>
              
              <div className="day-section">
                <h4>Activities</h4>
                <ul className="guide-checklist">
                  {[
                    'd1_1: Write down 3–5 social situations that make you uncomfortable.',
                    'd1_2: For each situation, note what you fear might happen.',
                    'd1_3: Rate your anxiety from 1–10 for each situation.',
                    'd1_4: Take 5 minutes for slow, steady breathing.',
                    'd1_5: Remind yourself: "Feeling anxious does not mean I am incapable."'
                  ].map((item, idx) => {
                    const id = `d1_${idx}`;
                    const text = item.split(': ')[1];
                    return (
                      <li key={id} onClick={() => toggleCheck(id)} className={checkedItems[id] ? 'checked' : ''}>
                        <input type="checkbox" checked={!!checkedItems[id]} onChange={() => {}} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="day-reflection-box">
                <h4>💭 Reflection — Ask yourself:</h4>
                <ul>
                  <li>What situations trigger my anxiety most?</li>
                  <li>What thoughts appear when I feel anxious?</li>
                  <li>Are these thoughts facts, or are they fears and assumptions?</li>
                </ul>
              </div>
            </div>

            {/* Day 2 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 2</div>
              <h2 className="day-title">Start With Small Interactions</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Become comfortable with simple social contact.</div>
              
              <div className="day-section">
                <h4>Activities</h4>
                <ul className="guide-checklist">
                  {[
                    'd2_1: Make eye contact and smile at someone.',
                    'd2_2: Say "Hello" or "Good morning" to 2–3 people.',
                    'd2_3: Ask someone a simple question, such as "How was your day?"',
                    'd2_4: Spend a few minutes in a social environment instead of avoiding it.',
                    'd2_5: Record your anxiety level before and after each interaction.'
                  ].map((item, idx) => {
                    const id = `d2_${idx}`;
                    const text = item.split(': ')[1];
                    return (
                      <li key={id} onClick={() => toggleCheck(id)} className={checkedItems[id] ? 'checked' : ''}>
                        <input type="checkbox" checked={!!checkedItems[id]} onChange={() => {}} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="day-challenge-box">
                <h4>🔥 Day 2 Challenge</h4>
                <p>Have <strong>one short conversation</strong> lasting at least 1–2 minutes.</p>
                <small><strong>Reminder:</strong> You do not need to be interesting or impressive. Simply participating is progress.</small>
              </div>
            </div>

            {/* Day 3 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 3</div>
              <h2 className="day-title">Practice Speaking</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Become more comfortable hearing your own voice in social situations.</div>
              
              <div className="day-section">
                <h4>Activities</h4>
                <ul className="guide-checklist">
                  {[
                    'd3_1: Speak for 2 minutes about a topic you enjoy.',
                    'd3_2: Practice introducing yourself.',
                    'd3_3: Ask someone an open-ended question.',
                    'd3_4: Give your opinion once during a conversation.',
                    'd3_5: Avoid rehearsing every sentence in your head before speaking.'
                  ].map((item, idx) => {
                    const id = `d3_${idx}`;
                    const text = item.split(': ')[1];
                    return (
                      <li key={id} onClick={() => toggleCheck(id)} className={checkedItems[id] ? 'checked' : ''}>
                        <input type="checkbox" checked={!!checkedItems[id]} onChange={() => {}} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="day-template-box">
                <h4>🗣️ Practice Introduction</h4>
                <blockquote>
                  “Hi, I’m ____. I’m currently studying ____. I’m interested in ____, and I enjoy learning about ____.”
                </blockquote>
                <p className="hint-text">Repeat your introduction until it feels natural and relaxed.</p>
              </div>
            </div>

            {/* Day 4 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 4</div>
              <h2 className="day-title">Challenge Negative Thoughts</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Replace unhelpful assumptions with realistic thinking.</div>
              
              <div className="day-section">
                <h4>Common Thought ➔ Balanced Response</h4>
                <div className="thought-comparison-grid">
                  <div className="thought-item">
                    <span className="negative-thought">❌ “Everyone will judge me.”</span>
                    <span className="positive-thought">✅ “Most people are focused on themselves, not analyzing everything I do.”</span>
                  </div>
                  <div className="thought-item">
                    <span className="negative-thought">❌ “I will say something embarrassing.”</span>
                    <span className="positive-thought">✅ “Making a small mistake is normal. I can continue the conversation.”</span>
                  </div>
                  <div className="thought-item">
                    <span className="negative-thought">❌ “I have to appear confident.”</span>
                    <span className="positive-thought">✅ “I can feel nervous and still communicate effectively.”</span>
                  </div>
                </div>
              </div>

              <div className="day-section">
                <h4>Activities</h4>
                <ul className="guide-checklist">
                  {[
                    'd4_1: Identify 3 negative thoughts you commonly experience.',
                    'd4_2: Write a realistic response to each one.',
                    'd4_3: Have one conversation without trying to make it perfect.',
                    'd4_4: Notice what actually happens instead of predicting what will happen.'
                  ].map((item, idx) => {
                    const id = `d4_${idx}`;
                    const text = item.split(': ')[1];
                    return (
                      <li key={id} onClick={() => toggleCheck(id)} className={checkedItems[id] ? 'checked' : ''}>
                        <input type="checkbox" checked={!!checkedItems[id]} onChange={() => {}} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Day 5 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 5</div>
              <h2 className="day-title">Step Outside Your Comfort Zone</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Practice facing a moderately challenging social situation.</div>
              
              <div className="day-section">
                <h4>Choose One Action:</h4>
                <ul className="guide-checklist">
                  {[
                    'd5_1: Start a conversation with someone you do not usually talk to.',
                    'd5_2: Ask a question during class or a group discussion.',
                    'd5_3: Make a phone call instead of sending a message.',
                    'd5_4: Join a group conversation.',
                    'd5_5: Ask someone for their opinion or recommendation.'
                  ].map((item, idx) => {
                    const id = `d5_${idx}`;
                    const text = item.split(': ')[1];
                    return (
                      <li key={id} onClick={() => toggleCheck(id)} className={checkedItems[id] ? 'checked' : ''}>
                        <input type="checkbox" checked={!!checkedItems[id]} onChange={() => {}} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="day-reflection-form">
                <h4>📝 Afterward, Reflect:</h4>
                <div className="reflection-input-group">
                  <label>What I expected:</label>
                  <input type="text" placeholder="e.g., I thought I would freeze up..." />
                </div>
                <div className="reflection-input-group">
                  <label>What actually happened:</label>
                  <input type="text" placeholder="e.g., The person was polite and responded warmly..." />
                </div>
                <div className="reflection-input-group">
                  <label>What I learned:</label>
                  <input type="text" placeholder="e.g., Anticipation is almost always worse than reality..." />
                </div>
              </div>
            </div>

            {/* Day 6 */}
            <div className="guide-day-card">
              <div className="day-pill">DAY 6</div>
              <h2 className="day-title">Build Social Confidence</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Practice confident communication.</div>
              
              <div className="day-section">
                <h4>Focus on:</h4>
                <ul className="focus-list">
                  <li>👁️ Maintaining comfortable eye contact</li>
                  <li>🗣️ Speaking clearly and at a steady pace</li>
                  <li>🧍 Keeping an open posture</li>
                  <li>👂 Listening instead of worrying about your next sentence</li>
                  <li>❓ Asking follow-up questions</li>
                  <li>⏸️ Allowing short pauses without feeling embarrassed</li>
                </ul>
              </div>

              <div className="day-challenge-box">
                <h4>🔥 Day 6 Challenge: 5–10 Minute Conversation</h4>
                <p>Try using the loop: <strong>Ask ➔ Listen ➔ Respond ➔ Ask again</strong></p>
                <div className="example-dialogue">
                  <p><strong>You:</strong> “What kind of music do you like?”</p>
                  <p><strong>Friend:</strong> “I’ve been listening to jazz lately.”</p>
                  <p><strong>You:</strong> “Oh, that's interesting! How did you get into it?”</p>
                </div>
                <small>The goal is connection, not performance.</small>
              </div>
            </div>

            {/* Day 7 */}
            <div className="guide-day-card full-width">
              <div className="day-pill">DAY 7</div>
              <h2 className="day-title">Review and Create Your Next Step</h2>
              <div className="day-goal">🎯 <strong>Goal:</strong> Recognize your progress and continue practicing.</div>
              
              <div className="day-section">
                <h4>Review Your Week (Rate 1–10):</h4>
                <div className="ratings-table-wrapper">
                  <table className="guide-table">
                    <thead>
                      <tr>
                        <th>Area</th>
                        <th>Before</th>
                        <th>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Starting conversations</td>
                        <td><input type="text" placeholder="1-10" /></td>
                        <td><input type="text" placeholder="1-10" /></td>
                      </tr>
                      <tr>
                        <td>Speaking to unfamiliar people</td>
                        <td><input type="text" placeholder="1-10" /></td>
                        <td><input type="text" placeholder="1-10" /></td>
                      </tr>
                      <tr>
                        <td>Expressing my opinions</td>
                        <td><input type="text" placeholder="1-10" /></td>
                        <td><input type="text" placeholder="1-10" /></td>
                      </tr>
                      <tr>
                        <td>Handling nervousness</td>
                        <td><input type="text" placeholder="1-10" /></td>
                        <td><input type="text" placeholder="1-10" /></td>
                      </tr>
                      <tr>
                        <td>Confidence in social situations</td>
                        <td><input type="text" placeholder="1-10" /></td>
                        <td><input type="text" placeholder="1-10" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="personal-goal-box">
                <h4>🎯 Create Your Personal Goal for Next Week:</h4>
                <div className="reflection-input-group">
                  <label>For the next 7 days, I will:</label>
                  <input type="text" placeholder="e.g., Say hello to one new classmate or coworker each day" />
                </div>
                <div className="reflection-input-group">
                  <label>I will practice it:</label>
                  <input type="text" placeholder="e.g., During morning breaks and coffee runs" />
                </div>
                <div className="mantra-text">“My goal is progress, not perfection.”</div>
              </div>
            </div>

          </div>

          {/* Quick Confidence Toolkit */}
          <div className="guide-toolkit-section">
            <h2 className="section-heading">⚡ Quick Confidence Toolkit</h2>
            <div className="toolkit-grid">
              <div className="toolkit-card">
                <h4>1. Before a Social Situation</h4>
                <ol>
                  <li>Take a slow breath.</li>
                  <li>Relax your shoulders.</li>
                  <li>Remind yourself that nervousness is normal.</li>
                  <li>Focus on the conversation rather than how you appear.</li>
                  <li>Give yourself permission to make small mistakes.</li>
                </ol>
              </div>

              <div className="toolkit-card">
                <h4>2. During the Conversation</h4>
                <div className="flow-badge">Listen ➔ Respond ➔ Ask ➔ Continue</div>
                <p>You do not need to fill every silence or have the perfect response.</p>
              </div>

              <div className="toolkit-card">
                <h4>3. After the Conversation</h4>
                <p className="avoid-text">❌ Instead of: <em>“Did I look nervous?”</em></p>
                <div className="ask-box">
                  <p>✅ <strong>Ask:</strong> “What did I do well?”</p>
                  <p>✅ <strong>Ask:</strong> “What did I learn?”</p>
                  <p>✅ <strong>Ask:</strong> “What can I try next time?”</p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Progress Tracker */}
          <div className="guide-tracker-section">
            <h2 className="section-heading">📊 7-Day Progress Tracker</h2>
            <div className="table-responsive">
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Main Goal</th>
                    <th>Done?</th>
                    <th>Anxiety (1–10)</th>
                    <th>What I Learned</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Day 1', goal: 'Understand anxiety' },
                    { day: 'Day 2', goal: 'Small interactions' },
                    { day: 'Day 3', goal: 'Practice speaking' },
                    { day: 'Day 4', goal: 'Challenge thoughts' },
                    { day: 'Day 5', goal: 'Comfort-zone challenge' },
                    { day: 'Day 6', goal: 'Build confidence' },
                    { day: 'Day 7', goal: 'Review & continue' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.day}</strong></td>
                      <td>{row.goal}</td>
                      <td><input type="checkbox" /></td>
                      <td><input type="text" className="table-input sm" placeholder="1-10" /></td>
                      <td><input type="text" className="table-input" placeholder="Notes & key insights..." /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Reminder & Medical Notice */}
          <div className="guide-final-notice">
            <h4>🌟 Final Reminder</h4>
            <p>
              Confidence is built through <strong>repeated experience</strong>, not by waiting until you feel completely fearless. Start small, practice consistently, and treat uncomfortable moments as opportunities to learn.
            </p>
            <hr />
            <small>
              <strong>Medical Disclaimer:</strong> If social anxiety is severe, persistent, or significantly interfering with school, work, relationships, or daily life, consider speaking with a qualified mental-health professional. A 7-day guide can support personal growth, but it is not a substitute for professional care.
            </small>
          </div>

        </div>

      </div>
    </div>
  );
};
