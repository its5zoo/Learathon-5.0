import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiSupport.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  category?: string;
  actionWidget?: 'breathing' | 'grounding' | 'cbt';
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: `Hello, I'm your **SoulSpace AI Companion** 🌿\n\nI'm here in a safe, judgment-free space to listen and help you navigate your emotional wellbeing today.\n\n• **Share your feelings** openly and vent anytime\n• **Practice grounding & 4-4-4 breathing** in real time\n• **Explore CBT frameworks** to gently reframe stressful thoughts\n\nHow are you feeling right now?`,
    time: 'Just now'
  }
];

const renderFormattedMessage = (text: string) => {
  return text.split('\n').map((paragraph, pIdx) => {
    if (!paragraph.trim()) return <div key={pIdx} className="msg-spacer" />;
    
    // Parse bold **text**
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={pIdx} className={paragraph.startsWith('•') ? 'msg-bullet-point' : ''}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

const AiSupport: React.FC = () => {
  const navigate = useNavigate();
  // Chat state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Interactive Breathing Tool State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCountdown, setBreathingCountdown] = useState(4);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Breathing tool timer effect
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCountdown((prev) => {
          if (prev > 1) return prev - 1;
          
          // Switch Phase
          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            if (currentPhase === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    } else {
      setBreathingPhase('Inhale');
      setBreathingCountdown(4);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const handleSendMessage = (textToSend?: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate smart AI response based on mood/prompt
    setTimeout(() => {
      let replyText = '';
      let actionWidget: 'breathing' | 'grounding' | 'cbt' | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('panic') || lower.includes('overthink')) {
        replyText = `I hear how overwhelming this feels, and I want to remind you that you are safe in this moment. 💙\n\nWhen anxiety peaks, our body triggers a fight-or-flight response. Let's signal your nervous system to down-regulate with the **4-4-4 Box Breathing** exercise right here:\n\n1. Inhale deeply through your nose for 4s\n2. Gently hold for 4s\n3. Release slowly through your mouth for 4s\n\nWould you like me to guide your rhythm, or would you like to explore what triggered this feeling?`;
        actionWidget = 'breathing';
      } else if (lower.includes('stress') || lower.includes('work') || lower.includes('burnout') || lower.includes('tired')) {
        replyText = `It sounds like you've been carrying a heavy cognitive and emotional load lately. Stress is your mind's way of asking for boundary protection and recovery.\n\nLet's do a quick **CBT Check-in**:\n• What is the single biggest pressure demanding your energy right now?\n• Can we break it into what is strictly within your control vs what is outside it?`;
        actionWidget = 'cbt';
      } else if (lower.includes('sad') || lower.includes('lonely') || lower.includes('depress') || lower.includes('down')) {
        replyText = `Thank you for sharing that with me. It takes courage to acknowledge sadness instead of bottling it up.\n\nYou don't have to carry this alone. Please take a gentle breath. What does your heart or mind need the most right now—quiet comfort, a gentle listening ear, or small steps to ease the weight?`;
      } else if (lower.includes('sleep') || lower.includes('night') || lower.includes('insomnia')) {
        replyText = `Trouble sleeping often happens when our subconscious tries to process the day's unresolved tension in bed. 🌙\n\nTry relaxing your jaw, dropping your shoulders away from your ears, and playing our **Evening Mind Release Audio** from the right panel. Let thoughts drift past like leaves on a river.`;
      } else {
        replyText = `Thank you for expressing that. I'm here to support you in whatever way you need.\n\nWhatever you are experiencing is valid. Would you like to delve deeper into these thoughts, or explore a quick soothing exercise together?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionWidget
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1100);
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="ai-support-page">
      {/* Main Split Layout */}
      <div className="container ai-main-container">
        <div className="ai-grid-workspace">
          
          {/* ================================================================
              LEFT COLUMN: INTERACTIVE CHAT COMPANION
              ================================================================ */}
          <main className="ai-chat-card">
            {/* Chat Top Header */}
            <div className="chat-card-header">
              <div className="chat-agent-info">
                <div className="chat-avatar-ring">
                  <div className="chat-avatar-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
                      <path d="M9 21h6"></path>
                    </svg>
                  </div>
                </div>
                <div className="chat-title-group">
                  <h3 className="chat-agent-title">SoulSpace AI Companion</h3>
                  <span className="chat-subtitle">Private & Empathetic Mental Health Support</span>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="chat-header-right">
                <div className="chat-header-auth">
                  {isLoggedIn ? (
                    <div className="chat-logged-pill">
                      <span className="dot-green"></span>
                      <span>User</span>
                      <button className="btn-chat-logout" onClick={handleLogout}>Log Out</button>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-header-login" onClick={() => navigate('/login')}>
                      🔒 Login to Chat
                    </button>
                  )}
                </div>

                <div className="header-divider-v"></div>

                <div className="chat-header-actions">
                  <button 
                    className={`voice-toggle-btn ${isVoiceEnabled ? 'active' : ''}`}
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    title={isVoiceEnabled ? 'Voice Active' : 'Voice Muted'}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </button>
                  <button className="clear-chat-btn" onClick={handleClearChat} title="Clear Chat History">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="chat-messages-body">
              {messages.map((msg) => (
                <div className={`chat-bubble-row ${msg.sender}`} key={msg.id}>
                  {msg.sender === 'ai' && (
                    <div className="msg-bot-avatar">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
                      </svg>
                    </div>
                  )}

                  <div className="chat-bubble-content">
                    <div className="msg-text-formatted">
                      {renderFormattedMessage(msg.text)}
                    </div>

                    {/* Interactive inline widget if triggered */}
                    {msg.actionWidget === 'breathing' && (
                      <div className="inline-action-card">
                        <div className="inline-action-header">
                          <span>🧘 Guided 4-4-4 Box Breathing</span>
                          <button 
                            className="btn-tiny-action"
                            onClick={() => setIsBreathingActive(!isBreathingActive)}
                          >
                            {isBreathingActive ? 'Stop Exercise' : 'Start Live Breathing'}
                          </button>
                        </div>
                        {isBreathingActive && (
                          <div className="inline-breathing-display">
                            <div className={`breathing-circle-anim ${breathingPhase.toLowerCase()}`}>
                              <span className="breathe-phase-text">{breathingPhase}</span>
                              <span className="breathe-count-num">{breathingCountdown}s</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="msg-timestamp">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-row ai">
                  <div className="msg-bot-avatar">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                    </svg>
                  </div>
                  <div className="typing-indicator-box">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Row */}
            <div className="quick-prompts-bar">
              <button 
                className="prompt-pill" 
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  handleSendMessage('I am feeling anxious and overthinking right now.');
                }}
              >
                ⚡ Anxious & Overthinking
              </button>
              <button 
                className="prompt-pill" 
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  handleSendMessage('I feel exhausted and burned out with work.');
                }}
              >
                💼 Work & Life Stress
              </button>
              <button 
                className="prompt-pill" 
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  handleSendMessage('Can you guide me through a 2-minute grounding exercise?');
                }}
              >
                🌿 Quick Grounding
              </button>
              <button 
                className="prompt-pill" 
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  handleSendMessage('I am feeling low and need a safe place to vent.');
                }}
              >
                💙 Need to Vent
              </button>
            </div>

            {/* Input Bar */}
            <div className="chat-input-wrapper">
              {!isLoggedIn ? (
                <div className="chat-locked-input-bar" onClick={() => navigate('/login')}>
                  <div className="locked-input-content">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3f72af" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Please login to start a conversation with SoulSpace AI...</span>
                  </div>
                  <button className="btn btn-primary btn-locked-chat-login" onClick={(e) => {
                    e.stopPropagation();
                    navigate('/login');
                  }}>
                    🔒 Login to Chat
                  </button>
                </div>
              ) : (
                <div className="chat-input-bar">
                  <input 
                    type="text" 
                    className="chat-text-field"
                    placeholder="Type what's on your mind... (e.g. 'I feel stressed about tomorrow')"
                    value={inputText}
                    maxLength={500}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />

                  <div className="chat-bar-actions">
                    <span className="char-count">{inputText.length}/500</span>

                    {/* Mic / Voice Dictation Button */}
                    <button 
                      className="mic-input-btn" 
                      title="Voice Input (Speech-to-Text)"
                      onClick={() => setInputText('I am feeling anxious today.')}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    </button>

                    {/* Send Button */}
                    <button 
                      className="send-msg-btn"
                      disabled={!inputText.trim()}
                      onClick={() => handleSendMessage()}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ================================================================
              RIGHT COLUMN: WELLNESS TOOLKIT & CRISIS CARE
              ================================================================ */}
          <aside className="ai-toolkit-sidebar">
            
            {/* Profile & Auth Status Card */}
            <div className="toolkit-card auth-profile-card">
              <div className="card-header-flex">
                <div className="profile-badge-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3f72af" strokeWidth="2.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="toolkit-card-title">Therapy Intelligence</h4>
                  <p className="toolkit-card-sub">CBT & Mindfulness Neural Core</p>
                </div>
              </div>

              <div className="auth-action-box">
                {isLoggedIn ? (
                  <div className="auth-logged-banner">
                    <div className="logged-info">
                      <span className="dot-green"></span>
                      <span>Session Saved (User)</span>
                    </div>
                    <button className="btn-logout-small" onClick={handleLogout}>Log Out</button>
                  </div>
                ) : (
                  <div className="auth-prompt-banner">
                    <p className="auth-prompt-text">
                      🔒 Log in to preserve encrypted session history & sync CBT reports with doctors.
                    </p>
                    <button className="btn btn-primary btn-auth-unlock" onClick={() => navigate('/login')}>
                      Login to Save History
                    </button>
                  </div>
                )}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default AiSupport;
