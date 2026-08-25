import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AiSupport.css';

const API = 'http://localhost:5000/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion: string;
  timestamp: string;
}

interface ChatSession {
  _id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
  preview: string;
  isCrisisSession?: boolean;
}

// ── Emotion config ────────────────────────────────────────────────────────────
const EMOTION_META: Record<string, { emoji: string; label: string; color: string }> = {
  anxious:  { emoji: '😰', label: 'Anxious',  color: '#f59e0b' },
  sad:      { emoji: '😔', label: 'Sad',       color: '#6366f1' },
  angry:    { emoji: '😤', label: 'Frustrated',color: '#ef4444' },
  stressed: { emoji: '😓', label: 'Stressed',  color: '#f97316' },
  happy:    { emoji: '😊', label: 'Positive',  color: '#10b981' },
  hopeful:  { emoji: '🌱', label: 'Hopeful',   color: '#3f72af' },
  crisis:   { emoji: '🆘', label: 'Crisis',    color: '#dc2626' },
  neutral:  { emoji: '💬', label: 'Neutral',   color: '#64748b' },
};

// ── Markdown renderer ─────────────────────────────────────────────────────────
const renderContent = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="msg-spacer" />;
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const content = parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j}>{p.slice(2, -2)}</strong>
        : p
    );
    return <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'msg-bullet' : ''}>{content}</p>;
  });
};

// ── Date formatter ────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
const AiSupport: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isLoggedIn } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [crisisActive, setCrisisActive] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Breathing tool
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Auth headers ───────────────────────────────────────────────────────────
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Load sessions on login ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchSessions();
    }
  }, [isLoggedIn, token]);

  // ── Breathing timer ────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev > 1) return prev - 1;
          setBreathingPhase((p) => {
            if (p === 'Inhale') return 'Hold';
            if (p === 'Hold') return 'Exhale';
            if (p === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    } else {
      setBreathingPhase('Inhale');
      setBreathingCount(4);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isBreathingActive]);

  // ── API: fetch sessions ────────────────────────────────────────────────────
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch (e) {
      console.error('fetchSessions error', e);
    }
  };

  // ── API: load session messages ─────────────────────────────────────────────
  const loadSession = async (sessionId: string) => {
    setLoadingSession(true);
    setActiveSessionId(sessionId);
    setCrisisActive(false);
    try {
      const res = await fetch(`${API}/chat/session/${sessionId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessages(data.session.messages);
        if (data.session.isCrisisSession) setCrisisActive(true);
      }
    } catch (e) {
      console.error('loadSession error', e);
    } finally {
      setLoadingSession(false);
    }
  };

  // ── API: create new session ────────────────────────────────────────────────
  const createNewSession = async () => {
    try {
      const res = await fetch(`${API}/chat/session`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => [data.session, ...prev]);
        setActiveSessionId(data.session._id);
        setMessages([]);
        setCrisisActive(false);
        inputRef.current?.focus();
        return data.session._id;
      }
    } catch (e) {
      console.error('createNewSession error', e);
    }
    return null;
  };

  // ── API: delete session ────────────────────────────────────────────────────
  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(sessionId);
    try {
      const res = await fetch(`${API}/chat/session/${sessionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error('deleteSession error', e);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (textOverride?: string) => {
    if (!isLoggedIn) { navigate('/login'); return; }

    const text = (textOverride || inputText).trim();
    if (!text || isTyping) return;

    // Ensure we have an active session
    let sessionId = activeSessionId;
    if (!sessionId) {
      // Auto-create session
      try {
        const res = await fetch(`${API}/chat/session`, {
          method: 'POST',
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          sessionId = data.session._id;
          setActiveSessionId(sessionId);
          setSessions((prev) => [data.session, ...prev]);
        }
      } catch (e) {
        setErrorMsg('Could not start session. Please try again.');
        return;
      }
    }

    // Optimistic user message
    const userMsg: Message = {
      role: 'user',
      content: text,
      emotion: 'neutral',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API}/chat/session/${sessionId}/message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, {
          role: data.message.role,
          content: data.message.content,
          emotion: data.message.emotion,
          timestamp: data.message.timestamp,
        }]);
        if (data.crisisDetected) setCrisisActive(true);
        // Update session title in sidebar
        if (data.sessionTitle) {
          setSessions((prev) => prev.map((s) =>
            s._id === sessionId
              ? { ...s, title: data.sessionTitle, lastMessageAt: new Date().toISOString(), messageCount: s.messageCount + 2 }
              : s
          ));
        }
      } else {
        setErrorMsg(data.message || 'AI did not respond. Please try again.');
      }
    } catch (e) {
      setErrorMsg('Connection error. Please check backend is running.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ai-page-root">
      {/* ════════════════════════════════════════════════════════════════════
          HISTORY SIDEBAR
          ════════════════════════════════════════════════════════════════════ */}
      <aside className={`ai-history-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">💬</span>
            {isSidebarOpen && <span className="sidebar-logo-text">Chats</span>}
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle sidebar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              {isSidebarOpen
                ? <polyline points="15 18 9 12 15 6"></polyline>
                : <polyline points="9 18 15 12 9 6"></polyline>}
            </svg>
          </button>
        </div>

        {isSidebarOpen && (
          <>
            {/* New Chat Button */}
            <button className="new-chat-btn" onClick={isLoggedIn ? createNewSession : () => navigate('/login')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>

            {/* Session List */}
            <div className="sidebar-session-list">
              {!isLoggedIn ? (
                <div className="sidebar-login-prompt">
                  <span>🔒</span>
                  <p>Login to see your chat history</p>
                  <button className="btn-sidebar-login" onClick={() => navigate('/login')}>Login</button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="sidebar-empty">
                  <span>💬</span>
                  <p>No chats yet. Start a new conversation!</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`session-item ${activeSessionId === session._id ? 'active' : ''} ${session.isCrisisSession ? 'crisis' : ''}`}
                    onClick={() => loadSession(session._id)}
                  >
                    <div className="session-item-content">
                      <div className="session-title">{session.title}</div>
                      <div className="session-meta">
                        <span className="session-date">{fmtDate(session.lastMessageAt)}</span>
                        <span className="session-count">{session.messageCount} msgs</span>
                      </div>
                      <div className="session-preview">{session.preview}</div>
                    </div>
                    <button
                      className={`session-delete-btn ${deletingId === session._id ? 'deleting' : ''}`}
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete chat"
                    >
                      {deletingId === session._id ? (
                        <span className="mini-spinner"></span>
                      ) : (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* User info at bottom */}
            {isLoggedIn && user && (
              <div className="sidebar-user-footer">
                <div className="sidebar-user-avatar">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user.firstName} {user.lastName}</div>
                  {user.isDemo && <span className="sidebar-demo-tag">Demo</span>}
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CHAT AREA
          ════════════════════════════════════════════════════════════════════ */}
      <main className="ai-chat-main">
        {/* Top bar */}
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <div className="chat-agent-avatar">
              <img src="/logo_main.png" alt="SoulSpace Companion" className="chat-avatar-logo-img" />
            </div>
            <div>
              <div className="chat-topbar-title">SoulSpace Companion</div>
              <div className="chat-topbar-sub">
                <span className="online-dot"></span> Mental Health Support · Empathetic · Private
              </div>
            </div>
          </div>
          <div className="chat-topbar-right">
            {isLoggedIn ? (
              <div className="topbar-session-actions">
                <button className="topbar-btn" onClick={createNewSession} title="New Chat">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Chat
                </button>
              </div>
            ) : (
              <button className="topbar-login-btn" onClick={() => navigate('/login')}>
                🔒 Login to Chat
              </button>
            )}
          </div>
        </div>

        {/* Crisis Banner */}
        {crisisActive && (
          <div className="crisis-banner">
            <div className="crisis-banner-icon">🆘</div>
            <div className="crisis-banner-text">
              <strong>You are not alone.</strong> Please reach out to a helpline right now:
              <span className="crisis-numbers"> iCall: 9152987821 · Vandrevala: 1860-2662-345 · AASRA: 9820466627</span>
            </div>
            <button className="crisis-dismiss" onClick={() => setCrisisActive(false)}>✕</button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="chat-error-bar">
            ⚠️ {errorMsg}
            <button onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        )}

        {/* Messages Area */}
        <div className="chat-messages-area">
          {/* Welcome screen when no session */}
          {!activeSessionId && !loadingSession && (
            <div className="chat-welcome-screen">
              <img src="/support_welcome.jpg" alt="Mindfulness" className="welcome-avatar-img" />
              <h2 className="welcome-title">
                {isLoggedIn ? `Hello, ${user?.firstName}! 👋` : 'SoulSpace Companion'}
              </h2>
              <p className="welcome-sub">
                {isLoggedIn
                  ? 'A safe, private space for your mental wellness. Start a new conversation or pick one from history.'
                  : 'Login to start a private, AI-powered mental health conversation.'}
              </p>
              {isLoggedIn ? (
                <button className="welcome-start-btn" onClick={createNewSession}>
                  ✨ Start New Conversation
                </button>
              ) : (
                <button className="welcome-start-btn" onClick={() => navigate('/login')}>
                  🔒 Login to Get Started
                </button>
              )}
              {/* Quick prompts on welcome screen */}
              {isLoggedIn && (
                <div className="welcome-prompts">
                  <p className="welcome-prompts-label">Try asking:</p>
                  <div className="welcome-prompt-pills">
                    {[
                      { icon: '😰', text: "I'm feeling anxious and overwhelmed" },
                      { icon: '😔', text: "I've been feeling really low lately" },
                      { icon: '😓', text: 'Work stress is getting to me' },
                      { icon: '🧘', text: 'Guide me through a breathing exercise' },
                    ].map((p, i) => (
                      <button key={i} className="welcome-prompt-pill" onClick={async () => {
                        await createNewSession();
                        setTimeout(() => handleSend(p.text), 150);
                      }}>
                        {p.icon} {p.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loadingSession && (
            <div className="chat-loading-state">
              <div className="loading-spinner-large"></div>
              <p>Loading conversation…</p>
            </div>
          )}

          {/* Messages */}
          {!loadingSession && messages.map((msg, idx) => {
            const emotionMeta = EMOTION_META[msg.emotion] || EMOTION_META.neutral;
            return (
              <div key={idx} className={`msg-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-avatar ai-avatar">
                    <img src="/logo_main.png" alt="SoulSpace" className="msg-avatar-logo-img" />
                  </div>
                )}
                <div className="msg-bubble-wrap">
                  <div className={`msg-bubble ${msg.role}`}>
                    <div className="msg-text">{renderContent(msg.content)}</div>
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && msg.emotion !== 'neutral' && (
                      <span
                        className="msg-emotion-tag"
                        style={{ '--emotion-color': emotionMeta.color } as React.CSSProperties}
                      >
                        {emotionMeta.emoji} {emotionMeta.label}
                      </span>
                    )}
                  </div>

                  {/* Inline breathing widget */}
                  {msg.role === 'assistant' && (msg.emotion === 'anxious' || msg.content.toLowerCase().includes('breath')) && idx === messages.length - 1 && (
                    <div className="inline-breathing-card">
                      <div className="breathing-card-header">
                        <span>🧘 4-4-4 Box Breathing</span>
                        <button className="btn-start-breathing" onClick={() => setIsBreathingActive(!isBreathingActive)}>
                          {isBreathingActive ? '⏹ Stop' : '▶ Start'}
                        </button>
                      </div>
                      {isBreathingActive && (
                        <div className="breathing-display">
                          <div className={`breath-circle ${breathingPhase.toLowerCase()}`}>
                            <span className="breath-phase">{breathingPhase}</span>
                            <span className="breath-count">{breathingCount}s</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="msg-avatar user-avatar">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="msg-row assistant">
              <div className="msg-avatar ai-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
                </svg>
              </div>
              <div className="msg-bubble-wrap">
                <div className="msg-bubble assistant typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (when session active) */}
        {activeSessionId && !isTyping && (
          <div className="quick-prompts-row">
            {[
              { icon: '⚡', text: 'Anxious & overthinking', full: "I'm feeling very anxious and can't stop overthinking." },
              { icon: '💼', text: 'Work stress', full: "I'm burned out from work stress and feel exhausted." },
              { icon: '🌿', text: 'Grounding exercise', full: 'Can you guide me through a quick grounding exercise?' },
              { icon: '💙', text: 'Need to vent', full: "I'm feeling really low and need someone to listen." },
            ].map((p, i) => (
              <button key={i} className="quick-prompt-pill" onClick={() => handleSend(p.full)}>
                {p.icon} {p.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-section">
          {!isLoggedIn ? (
            <div className="input-locked-bar" onClick={() => navigate('/login')}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3f72af" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Login to start chatting with SoulSpace…</span>
              <button className="locked-login-btn" onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>
                Login →
              </button>
            </div>
          ) : (
            <div className="input-bar">
              <div className="input-bar-inner">
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-input-field"
                  placeholder={activeSessionId ? "Share what's on your mind…" : "Click 'New Chat' or type to start…"}
                  value={inputText}
                  maxLength={1000}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                />
                <div className="input-actions">
                  <span className="char-counter">{inputText.length}/1000</span>
                  <button
                    className={`send-btn ${inputText.trim() && !isTyping ? 'active' : ''}`}
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || isTyping}
                    title="Send message"
                  >
                    {isTyping ? (
                      <span className="send-spinner"></span>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="input-disclaimer">
                SoulSpace is a mental wellness companion and not a substitute for professional therapy.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AiSupport;
