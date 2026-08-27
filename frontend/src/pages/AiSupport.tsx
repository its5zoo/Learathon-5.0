import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL as API } from '../config';
import './AiSupport.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion: string;
  timestamp: string;
  model?: string;
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

const EMOTION_META: Record<string, { emoji: string; label: string; color: string }> = {
  anxious: { emoji: '😰', label: 'Anxious', color: '#f59e0b' },
  sad: { emoji: '😔', label: 'Sad', color: '#6366f1' },
  angry: { emoji: '😤', label: 'Frustrated', color: '#ef4444' },
  stressed: { emoji: '😓', label: 'Stressed', color: '#f97316' },
  happy: { emoji: '😊', label: 'Positive', color: '#10b981' },
  hopeful: { emoji: '🌱', label: 'Hopeful', color: '#3f72af' },
  crisis: { emoji: '🆘', label: 'Crisis', color: '#dc2626' },
  neutral: { emoji: '💬', label: 'Neutral', color: '#64748b' },
};

const renderContent = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="msg-spacer" />;

    if (line.includes('wa.me/')) {
      const parts = line.split(/(wa\.me\/\d+)/g);
      return (
        <p key={i} className="msg-bullet">
          {parts.map((part, idx) => {
            if (part.startsWith('wa.me/')) {
              return (
                <a
                  key={idx}
                  href={`https://${part}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chat-whatsapp-link"
                >
                  💬 Open Live WhatsApp Chat →
                </a>
              );
            }
            return part;
          })}
        </p>
      );
    }

    const parts = line.split(/(\*\*.*?\*\*)/g);
    const content = parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j}>{p.slice(2, -2)}</strong>
        : p
    );
    return <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'msg-bullet' : ''}>{content}</p>;
  });
};

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

const isCrisisText = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  const keywords = [
    'suicide', 'suicidal', 'kill myself', 'killing myself', 'end my life', 'ending my life',
    'want to die', 'wanna die', 'wanna di', 'going to die', 'gonna die', 'will die', 'feel like dying',
    'about to die', 'about to di', 'about to kill', 'about to end', 'im about to die', "i'm about to die",
    'i am about to die', 'i am about to di', 'ready to die', 'time to die', 'dying tonight',
    'wish i was dead', 'wish i were dead', 'rather be dead', 'better off dead',
    'take my life', 'take my own life', 'overdose', 'cut myself', 'hanging myself', 'hang myself',
    'cant go on', "can't go on", 'cannot go on', 'cant take this anymore', "can't take this anymore",
    'no reason to live', 'no point living', 'nothing to live for', 'self harm', 'self-harm',
    'end it all', 'goodbye world', 'give up on life', 'tired of living', "don't want to live",
    'marne ka man', 'mar jaunga', 'mar jaungi', 'jaan de dunga', 'khudkushi', 'aatmahatya'
  ];
  if (keywords.some((kw) => lower.includes(kw))) return true;
  const patterns = [
    /\b(suicid\w*|khudkushi|aatmahatya)\b/i,
    /\b(kill|killing|hurt|harm|cut|slit|hang|hanging|poison)\s*(my\s*own\s*self|myself|my\s*wrist|my\s*life)\b/i,
    /\b(about\s*to|going\s*to|gonna|want\s*to|wanna|planning\s*to|ready\s*to|will|feel\s*like)\s*(di|die|dying|end\s*it|end\s*my\s*life|kill\s*myself)\b/i,
    /\bi\s*(am|'m|m)?\s*(about\s*to\s*di(e)?|dying|gonna\s*die|going\s*to\s*die)\b/i,
    /\b(end\s*my\s*life|ending\s*my\s*life|end\s*it\s*all|take\s*my\s*life)\b/i,
    /\b(cant|can't|cannot)\s*(go\s*on|take\s*(it|this)\s*anymore)\b/i,
    /\b(no\s*reason\s*to\s*live|no\s*point\s*(in\s*)?living|nothing\s*to\s*live\s*for|tired\s*of\s*living|done\s*with\s*life)\b/i,
  ];
  return patterns.some((r) => r.test(lower));
};

const shouldShowBreathingWidget = (
  currentIdx: number,
  allMessages: Message[],
  isDismissed: boolean
): boolean => {
  if (isDismissed) return false;
  if (currentIdx !== allMessages.length - 1) return false;
  const currentMsg = allMessages[currentIdx];
  if (currentMsg.role !== 'assistant') return false;

  let userText = '';
  let userEmotion = '';
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (allMessages[i].role === 'user') {
      userText = allMessages[i].content.toLowerCase();
      userEmotion = (allMessages[i].emotion || '').toLowerCase();
      break;
    }
  }

  if (!userText && !userEmotion) return false;

  if (
    userEmotion === 'crisis' ||
    currentMsg.emotion === 'crisis' ||
    isCrisisText(userText) ||
    isCrisisText(currentMsg.content)
  ) {
    return false;
  }

  if (userEmotion === 'anxious' || userEmotion === 'fear') return true;

  const anxietyPatterns = [
    /\b(anxi(ety|ous)|panic|panicking|panicky|panic\s*attack|overwhelm(ed)?|freak(ing)?\s*out)\b/i,
    /\b(nervous\s*breakdown|heart\s*(racing|pounding)|chest\s*pounding|palpitations)\b/i,
    /\b(ghabrahat|ghabra|bechaini)\b/i,
  ];

  const fearPatterns = [
    /\b(fear|scared|terrifi(ed|ying)|terror|afraid|fright(ened)?|petrified)\b/i,
    /\b(shak(ing|y)|trembl(ing)?|darr?|dar\s*lag)\b/i,
  ];

  const breathingDistressPatterns = [
    /\b(heavy\s*breath(ing)?|breath(ing)?\s*heavily|breath(ing)?\s*hard)\b/i,
    /\b(can'?t\s*breath(e)?|cannot\s*breath(e)?|hard\s*to\s*breath(e)?|trouble\s*breath(ing)?)\b/i,
    /\b(difficult(y)?\s*(to|in)?\s*breath(ing|e)?|short(ness)?\s*of\s*breath|out\s*of\s*breath)\b/i,
    /\b(hyperventilat(ing|e|ion)|suffocat(ing|e|ion)|gasping(\s*for\s*air)?)\b/i,
    /\b(chest\s*tight(ness)?|tight\s*chest|choking\s*up)\b/i,
    /\b(saans?\s*nahi|dam\s*ghut)\b/i,
  ];

  const explicitBreathingPatterns = [
    /\b(box\s*breath(ing)?|4-4-4|help\s*me\s*breath(e)?|breath(e)?\s*with\s*me|breathing\s*exercise)\b/i,
  ];

  return (
    anxietyPatterns.some((r) => r.test(userText)) ||
    fearPatterns.some((r) => r.test(userText)) ||
    breathingDistressPatterns.some((r) => r.test(userText)) ||
    explicitBreathingPatterns.some((r) => r.test(userText))
  );
};

const AiSupport: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isLoggedIn } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [isBreathingDismissed, setIsBreathingDismissed] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchSessions();
    }
  }, [isLoggedIn, token]);

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

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch (e) {
      console.error('fetchSessions error', e);
    }
  };

  const loadSession = async (sessionId: string) => {
    setLoadingSession(true);
    setActiveSessionId(sessionId);
    try {
      const res = await fetch(`${API}/chat/session/${sessionId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessages(data.session.messages);
      }
    } catch (e) {
      console.error('loadSession error', e);
    } finally {
      setLoadingSession(false);
    }
  };

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
        inputRef.current?.focus();
        return data.session._id;
      }
    } catch (e) {
      console.error('createNewSession error', e);
    }
    return null;
  };

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

  const handleSend = async (textOverride?: string) => {
    if (!isLoggedIn) { navigate('/login'); return; }

    const text = (textOverride || inputText).trim();
    if (!text || isTyping) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
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

    const userIsCrisis = isCrisisText(text);
    const userMsg: Message = {
      role: 'user',
      content: text,
      emotion: userIsCrisis ? 'crisis' : 'neutral',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setIsBreathingDismissed(false);
    setIsBreathingActive(false);
    setErrorMsg(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`${API}/chat/session/${sessionId}/message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.success) {
        const isCrisisResponse = Boolean(data.crisisDetected || data.message?.emotion === 'crisis' || userIsCrisis);

        setMessages((prev) => {
          const updated = [...prev];
          if (isCrisisResponse && updated.length > 0) {
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === 'user') {
              updated[lastIdx] = { ...updated[lastIdx], emotion: 'crisis' };
            }
          }
          return [...updated, {
            role: data.message.role,
            content: data.message.content,
            emotion: isCrisisResponse ? 'crisis' : data.message.emotion,
            timestamp: data.message.timestamp,
          }];
        });

        setSessions((prev) => prev.map((s) =>
          s._id === sessionId
            ? {
                ...s,
                title: data.sessionTitle || s.title,
                isCrisisSession: isCrisisResponse || s.isCrisisSession,
                lastMessageAt: new Date().toISOString(),
                messageCount: s.messageCount + 2
              }
            : s
        ));
      } else {
        setErrorMsg(data.message || 'AI did not respond. Please try again.');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return;
      }
      setErrorMsg('Connection error. Please check backend is running.');
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isTyping) {
      handleStopGeneration();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-page-root">
      <aside className={`ai-history-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/cloud_box.png" alt="Chats" className="sidebar-logo-img" />
            {isSidebarOpen ? <span className="sidebar-logo-text">Chats</span> : null}
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle sidebar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              {isSidebarOpen
                ? <polyline points="15 18 9 12 15 6"></polyline>
                : <polyline points="9 18 15 12 9 6"></polyline>}
            </svg>
          </button>
        </div>

        {isSidebarOpen ? (
          <>
            <button className="new-chat-btn" onClick={isLoggedIn ? createNewSession : () => navigate('/login')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>

            <div className="sidebar-session-list">
              {!isLoggedIn ? (
                <div className="sidebar-login-prompt">
                  <span>🔒</span>
                  <p>Login to see your chat history</p>
                  <button className="btn-sidebar-login" onClick={() => navigate('/login')}>Login</button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="sidebar-empty">
                  <img src="/cloud_box.png" alt="No chats" className="sidebar-empty-cloud-img" />
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
          </>
        ) : null}
      </aside>

      <main className="ai-chat-main">
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <div className="chat-agent-avatar">
              <img src="/logo_main.png" alt="SoulSpace Companion" className="chat-avatar-logo-img" />
            </div>
            <div>
              <div className="chat-topbar-title">SoulSpace Companion</div>
              <div className="chat-topbar-sub">
                Mental Health Support · Empathetic · Private
              </div>
            </div>
          </div>
          <div className="chat-topbar-right">
            {!isLoggedIn ? (
              <button className="topbar-login-btn" onClick={() => navigate('/login')}>
                🔒 Login to Chat
              </button>
            ) : null}
          </div>
        </div>

        {errorMsg ? (
          <div className="chat-error-bar">
            ⚠️ {errorMsg}
            <button onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        ) : null}

        <div className="chat-messages-area">
          {!activeSessionId && !loadingSession ? (
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
              {isLoggedIn ? (
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
              ) : null}
            </div>
          ) : null}

          {loadingSession ? (
            <div className="chat-loading-state">
              <div className="loading-spinner-large"></div>
              <p>Loading conversation…</p>
            </div>
          ) : null}

          {!loadingSession ? messages.map((msg, idx) => {
            const isCrisisMsg = msg.emotion === 'crisis';
            const emotionMeta = EMOTION_META[msg.emotion] || EMOTION_META.neutral;
            return (
              <div key={idx} className={`msg-row ${msg.role} ${isCrisisMsg ? 'crisis-row' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className={`msg-avatar ai-avatar ${isCrisisMsg ? 'crisis-avatar' : ''}`}>
                    {isCrisisMsg ? '🆘' : <img src="/logo_main.png" alt="SoulSpace" className="msg-avatar-logo-img" />}
                  </div>
                ) : null}
                <div className="msg-bubble-wrap">
                  <div className={`msg-bubble ${msg.role} ${isCrisisMsg ? 'crisis-msg-bubble' : ''}`}>
                    {isCrisisMsg ? (
                      <div className="crisis-msg-header-pill">
                        <span className="pulse-dot-red"></span>
                        <span>🚨 EMERGENCY SAFETY INTERVENTION</span>
                      </div>
                    ) : null}
                    <div className="msg-text">{renderContent(msg.content)}</div>
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && msg.emotion !== 'neutral' ? (
                      <span
                        className={`msg-emotion-tag ${isCrisisMsg ? 'crisis-badge-dark' : ''}`}
                        style={{ '--emotion-color': emotionMeta.color } as React.CSSProperties}
                      >
                        {emotionMeta.emoji} {emotionMeta.label}
                      </span>
                    ) : null}
                  </div>

                  {shouldShowBreathingWidget(idx, messages, isBreathingDismissed) ? (
                    <div className="inline-breathing-card">
                      <div className="breathing-card-header">
                        <span>🧘 4-4-4 Box Breathing</span>
                        <div className="breathing-card-actions">
                          <button className="btn-start-breathing" onClick={() => setIsBreathingActive(!isBreathingActive)}>
                            {isBreathingActive ? '⏹ Stop' : '▶ Start'}
                          </button>
                          <button
                            className="btn-dismiss-breathing"
                            onClick={() => {
                              setIsBreathingActive(false);
                              setIsBreathingDismissed(true);
                            }}
                            title="Dismiss exercise"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {isBreathingActive ? (
                        <div className="breathing-display">
                          <div className={`breath-circle ${breathingPhase.toLowerCase()}`}>
                            <span className="breath-phase">{breathingPhase}</span>
                            <span className="breath-count">{breathingCount}s</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {msg.role === 'user' ? (
                  <div className="msg-avatar user-avatar">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                  </div>
                ) : null}
              </div>
            );
          }) : null}

          {isTyping ? (
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
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {activeSessionId && !isTyping ? (
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
        ) : null}

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
                  placeholder={activeSessionId ? "Share what's on your mind…" : "Type your message to start chatting…"}
                  value={inputText}
                  maxLength={1000}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                />
                <div className="input-actions">
                  <span className="char-counter">{inputText.length}/1000</span>
                  {isTyping ? (
                    <button
                      className="stop-gen-btn active-stop"
                      onClick={handleStopGeneration}
                      title="Stop generating reply (Esc)"
                    >
                      <span className="stop-sq-icon"></span>
                      <span className="stop-btn-text">Stop</span>
                    </button>
                  ) : (
                    <button
                      className={`send-btn ${inputText.trim() ? 'active' : ''}`}
                      onClick={() => handleSend()}
                      disabled={!inputText.trim()}
                      title="Send message (Enter)"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  )}
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
