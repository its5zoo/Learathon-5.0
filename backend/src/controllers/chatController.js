import Chat from '../models/Chat.js';

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────

// Indian Government Mental Health Helplines
const CRISIS_HELPLINES = `
🆘 **You Are Not Alone — Free 24/7 Helplines (India)**
• **iCall** (TISS): 📞 9152987821
• **Vandrevala Foundation**: 📞 1860-2662-345 (24/7, free)
• **NIMHANS**: 📞 080-46110007
• **AASRA**: 📞 9820466627
• **iCall WhatsApp**: wa.me/919152987821

Please reach out — you deserve support. 💙
`.trim();

// Crisis trigger keywords
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'cant go on', "can't go on", 'no reason to live', 'self harm', 'self-harm',
  'hurt myself', 'worthless', 'hopeless', 'end it all', 'not worth living',
  'wish i was dead', 'rather be dead', 'take my life', 'overdose'
];

// Emotion detection patterns
const EMOTION_PATTERNS = {
  anxious:  ['anxious', 'anxiety', 'panic', 'overthink', 'worry', 'nervous', 'scared', 'fear', 'dread'],
  sad:      ['sad', 'crying', 'cry', 'depressed', 'depression', 'lonely', 'alone', 'miss', 'grief', 'heartbroken'],
  angry:    ['angry', 'anger', 'frustrated', 'furious', 'rage', 'hate', 'annoyed', 'irritated'],
  stressed: ['stressed', 'stress', 'overwhelmed', 'burnout', 'exhausted', 'tired', 'pressure', 'deadline'],
  happy:    ['happy', 'great', 'good', 'better', 'amazing', 'excited', 'joy', 'grateful', 'thankful'],
  hopeful:  ['hopeful', 'hope', 'improving', 'progress', 'trying', 'effort'],
  crisis:   CRISIS_KEYWORDS,
};

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const detectEmotion = (text) => {
  const lower = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_PATTERNS)) {
    if (keywords.some((kw) => lower.includes(kw))) return emotion;
  }
  return 'neutral';
};

const isCrisis = (text) => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
};

const generateTitle = (firstMessage) => {
  const words = firstMessage.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 60 ? words.slice(0, 60) + '…' : words || 'New Conversation';
};

// ──────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ──────────────────────────────────────────────────────────────────────────────

const buildSystemPrompt = (crisisDetected) => `
You are SoulSpace AI, a warm and professional mental health companion embedded in a healthcare platform used across India.

Your role:
- Provide empathetic, evidence-based emotional support (CBT, mindfulness, grounding)
- Speak like a caring, experienced doctor talking to a patient — calm, clear, professional but human
- You are NOT a replacement for therapy — always encourage professional help when needed

Strict rules:
- NEVER diagnose, NEVER prescribe medication
- NEVER make up facts or statistics — if unsure, say so honestly
- Keep responses SHORT by default (2–4 sentences). Only elaborate if the topic genuinely requires it
- Always acknowledge the person's emotion BEFORE offering any advice
- Use plain language — avoid jargon
- Respond in the same language as the user (Hinglish is fine)
- Context: You remember the full conversation history — use it to give coherent, continuous responses

${crisisDetected ? `
CRITICAL — CRISIS DETECTED:
The user may be in emotional danger. Your FIRST priority is their safety.
- Acknowledge their pain with deep empathy (1–2 sentences)
- Gently provide Indian helpline numbers
- Assure them they are not alone
- Do NOT minimize their feelings or immediately pivot to solutions
- Keep your tone extremely gentle and caring
` : ''}
`.trim();

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

/** Exponential backoff delay */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Call the AI API with up to `maxRetries` retries on 429/503 overload */
const callAIWithRetry = async (apiMessages, retries = 3) => {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(process.env.AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Gemini OpenAI-compat endpoint requires Bearer format
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'x-goog-api-key': process.env.AI_API_KEY,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gemini-3-flash-preview',
          messages: apiMessages,
          temperature: 0.65,
          top_p: 0.9,
        }),
      });

      // Rate-limit / overload — wait and retry
      if (response.status === 429 || response.status === 503) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10);
        const backoff = retryAfter * 1000 || attempt * 1500;
        console.warn(`AI API overloaded (${response.status}). Retry ${attempt}/${retries} in ${backoff}ms…`);
        await sleep(backoff);
        lastErr = new Error(`AI API overloaded (${response.status})`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`AI API Error ${response.status}:`, errText);
        throw new Error(`AI API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('AI returned empty response');
      return content;

    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const backoff = attempt * 2000;
        console.warn(`AI call error (attempt ${attempt}): ${err.message}. Retrying in ${backoff}ms…`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
};

// ──────────────────────────────────────────────────────────────────────────────
// AI API CALL  (Gemini 2.5 Pro via OpenAI-compatible endpoint)
// ──────────────────────────────────────────────────────────────────────────────

const callAI = async (messages, crisisDetected) => {
  const systemPrompt = buildSystemPrompt(crisisDetected);

  // Build messages: system + last 20 conversation turns
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-20).map((m) => ({
      role: m.role,          // 'user' | 'assistant' — OpenAI-compat accepts both
      content: m.content,
    })),
  ];

  // ── Local LLM (Ollama) — if enabled ──────────────────────────────────────
  if (process.env.USE_LOCAL_LLM === 'true') {
    const ollamaRes = await fetch(process.env.LOCAL_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL || 'llama3',
        messages: apiMessages,
        stream: false,
      }),
    });
    const ollamaData = await ollamaRes.json();
    return ollamaData.message?.content || 'I could not process your message. Please try again.';
  }

  // ── Gemini 2.5 Pro (primary) with automatic retry ─────────────────────────
  return callAIWithRetry(apiMessages);
};

// ──────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ──────────────────────────────────────────────────────────────────────────────

// @route  POST /api/chat/session
// @desc   Create a new chat session for the logged-in user
// @access Private
export const createSession = async (req, res) => {
  try {
    const session = await Chat.create({
      userId: req.userId,
      title: 'New Conversation',
      messages: [],
    });

    return res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt,
        messageCount: 0,
      },
    });
  } catch (err) {
    console.error('createSession Error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not create session.' });
  }
};

// @route  POST /api/chat/session/:sessionId/message
// @desc   Send a message — get AI reply back
// @access Private
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // Verify session belongs to this user
    const session = await Chat.findOne({ _id: sessionId, userId: req.userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }

    const userContent = content.trim();
    const crisisDetected = isCrisis(userContent);
    const userEmotion = detectEmotion(userContent);

    // Append user message
    session.messages.push({
      role: 'user',
      content: userContent,
      emotion: crisisDetected ? 'crisis' : userEmotion,
      timestamp: new Date(),
    });

    // Auto-set title from first user message
    if (session.messages.length === 1 || session.title === 'New Conversation') {
      session.title = generateTitle(userContent);
    }

    if (crisisDetected) session.isCrisisSession = true;

    // Call AI with retry
    let aiContent;
    try {
      aiContent = await callAI(session.messages, crisisDetected);
    } catch (aiErr) {
      console.error('AI call failed after retries:', aiErr.message);
      aiContent = "I'm having a bit of trouble connecting right now — please try sending your message again in a moment. If you're in distress, you can call **iCall at 9152987821** anytime (free, 24/7). 💙";
    }

    // Append crisis helplines if detected
    if (crisisDetected) {
      aiContent = aiContent + '\n\n' + CRISIS_HELPLINES;
    }

    const aiEmotion = crisisDetected ? 'crisis' : detectEmotion(aiContent);

    // Append AI message
    session.messages.push({
      role: 'assistant',
      content: aiContent,
      emotion: aiEmotion,
      timestamp: new Date(),
    });

    await session.save();

    // Return just the AI message + crisis flag
    const lastAiMsg = session.messages[session.messages.length - 1];
    return res.status(200).json({
      success: true,
      message: {
        role: lastAiMsg.role,
        content: lastAiMsg.content,
        emotion: lastAiMsg.emotion,
        timestamp: lastAiMsg.timestamp,
      },
      crisisDetected,
      sessionTitle: session.title,
    });
  } catch (err) {
    console.error('sendMessage Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error processing your message.' });
  }
};

// @route  GET /api/chat/sessions
// @desc   Get all chat sessions for the logged-in user (list view)
// @access Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await Chat.find({ userId: req.userId })
      .select('_id title lastMessageAt isCrisisSession messages createdAt')
      .sort({ lastMessageAt: -1 })
      .lean();

    const sessionList = sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      lastMessageAt: s.lastMessageAt,
      createdAt: s.createdAt,
      isCrisisSession: s.isCrisisSession,
      messageCount: s.messages.length,
      preview: s.messages.length > 0
        ? s.messages[s.messages.length - 1].content.slice(0, 80) + (s.messages[s.messages.length - 1].content.length > 80 ? '…' : '')
        : 'No messages yet',
    }));

    return res.status(200).json({ success: true, sessions: sessionList });
  } catch (err) {
    console.error('getSessions Error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch sessions.' });
  }
};

// @route  GET /api/chat/session/:sessionId
// @desc   Get full message history for a session
// @access Private
export const getSession = async (req, res) => {
  try {
    const session = await Chat.findOne({
      _id: req.params.sessionId,
      userId: req.userId,
    }).lean();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('getSession Error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch session.' });
  }
};

// @route  DELETE /api/chat/session/:sessionId
// @desc   Delete a chat session
// @access Private
export const deleteSession = async (req, res) => {
  try {
    const result = await Chat.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.userId,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({ success: true, message: 'Chat session deleted.' });
  } catch (err) {
    console.error('deleteSession Error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not delete session.' });
  }
};
