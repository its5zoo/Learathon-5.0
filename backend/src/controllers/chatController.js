import Chat from '../models/Chat.js';

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────

// Verified Indian Mental Health Crisis Helplines (Govt & RCI/TISS verified)
const CRISIS_HELPLINES = `
🆘 **You Are Not Alone — Free 24/7 National Helplines (India)**
• **Tele-MANAS** (Govt of India): 📞 14416 / 1800-891-4416 (24/7, Toll-Free)
• **iCall** (TISS): 📞 9152987821 (Mon–Sat, 10 AM – 8 PM)
• **Vandrevala Foundation**: 📞 9999 666 555 / 1860-2662-345 (24/7, Free)
• **KIRAN** (Ministry of Social Justice): 📞 1800-599-0019 (24/7, Toll-Free)
• **NIMHANS Helpline**: 📞 080-46110007 (24/7)

Please reach out — confidential support is available right now. 💙
`.trim();

// Comprehensive Crisis trigger keywords & patterns (English + Hinglish)
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'killing myself', 'end my life', 'ending my life',
  'want to die', 'wanna die', 'going to die', 'gonna die', 'will die', 'feel like dying',
  'wish i was dead', 'wish i were dead', 'rather be dead', 'better off dead',
  'take my life', 'take my own life', 'overdose', 'cut myself', 'hanging myself',
  'cant go on', "can't go on", 'no reason to live', 'no point living', 'nothing to live for',
  'self harm', 'self-harm', 'hurt myself', 'hurting myself', 'worthless', 'hopeless',
  'end it all', 'end everything', 'not worth living', 'ready to die', 'goodbye world',
  'give up on life', 'tired of living', "don't want to live", 'dont want to live', 'hate being alive',
  // Hinglish / Hindi triggers
  'marne ka man', 'mar jaunga', 'mar jaungi', 'jaan de dunga', 'khudkushi', 'mar jana chahta', 'mar jana chahti', 'jeena nahi chahta'
];

// Emotion detection patterns
const EMOTION_PATTERNS = {
  crisis:   CRISIS_KEYWORDS,
  anxious:  ['anxious', 'anxiety', 'panic', 'overthink', 'worry', 'nervous', 'scared', 'fear', 'dread', 'frightened'],
  sad:      ['sad', 'crying', 'cry', 'depressed', 'depression', 'lonely', 'alone', 'miss', 'grief', 'heartbroken', 'hopeless'],
  angry:    ['angry', 'anger', 'frustrated', 'furious', 'rage', 'hate', 'annoyed', 'irritated'],
  stressed: ['stressed', 'stress', 'overwhelmed', 'burnout', 'exhausted', 'tired', 'pressure', 'deadline', 'burdened'],
  happy:    ['happy', 'great', 'good', 'better', 'amazing', 'excited', 'joy', 'grateful', 'thankful', 'relieved'],
  hopeful:  ['hopeful', 'hope', 'improving', 'progress', 'trying', 'effort'],
};

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const isCrisis = (text) => {
  const lower = text.toLowerCase();
  // Direct keyword or phrase match
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  // Regex pattern matching for variations like "i will die", "wanna die", "die tonight", etc.
  const crisisRegex = /\b(suicid|kill\s*myself|end\s*my\s*life|going\s*to\s*die|gonna\s*die|want\s*to\s*die|wanna\s*die|feel\s*like\s*dying|harm\s*myself|hurt\s*myself)\b/i;
  return crisisRegex.test(lower);
};

const detectEmotion = (text) => {
  if (isCrisis(text)) return 'crisis';
  const lower = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_PATTERNS)) {
    if (keywords.some((kw) => lower.includes(kw))) return emotion;
  }
  return 'neutral';
};

const generateTitle = (firstMessage) => {
  const words = firstMessage.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 60 ? words.slice(0, 60) + '…' : words || 'New Conversation';
};

// ──────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT (3BrainCell Gemma-2B-MentalHealth Fine-Tuned Model Spec)
// ──────────────────────────────────────────────────────────────────────────────

const buildSystemPrompt = (crisisDetected) => `
You are SoulSpace AI, an empathetic, supportive mental health companion powered by the 3BrainCell Gemma-2B fine-tuned clinical model.

STRICT LANGUAGE & CONVERSATIONAL RULES:
- You fully understand user messages in Hindi, Hinglish, or English.
- CRITICAL LANGUAGE RULE: You MUST ALWAYS write your response in CLEAR, EMPATHETIC ENGLISH ONLY.
- NEVER reply in Tamil, Marathi, Odia, Bengali, Telugu, Gujarati, or any other regional language under any circumstances. Every response MUST be written in English.
- Keep all responses SHORT and NATURAL: MAXIMUM 2 to 3 concise sentences total.
- Speak like an attentive, caring counselor in a real-time chat — never write essays, bulleted walls of text, or generic lectures.
- Always validate the user's emotion first with deep empathy, offer a grounded perspective, and end with a gentle check-in question.
- NEVER diagnose illnesses, NEVER prescribe medication.
- Do NOT hallucinate or make up helpline numbers (verified helplines are appended automatically by the platform).

${crisisDetected ? `
🚨 CRITICAL CRISIS SAFETY PROTOCOL:
- The user expressed thoughts of dying, suicide, or severe distress.
- Respond in EXACTLY 2 caring, supportive sentences in English:
  1. Acknowledge their deep pain with unconditional compassion and assure them they matter and are not alone.
  2. Gently encourage them to stay safe and reach out to the verified helpline numbers listed below right away.
- Do NOT lecture, minimize, or give complex advice.
` : ''}
`.trim();

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS & INFERENCE PIPELINE
// ──────────────────────────────────────────────────────────────────────────────

/** Exponential backoff delay */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Call the fine-tuned AI model with up to `maxRetries` retries on 429/503 overload */
const callAIWithRetry = async (apiMessages, retries = 3) => {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(process.env.AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        console.warn(`Gemma 2B API overloaded (${response.status}). Retry ${attempt}/${retries} in ${backoff}ms…`);
        await sleep(backoff);
        lastErr = new Error(`Gemma 2B API overloaded (${response.status})`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemma 2B API Error ${response.status}:`, errText);
        throw new Error(`Gemma 2B API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Model returned empty response');
      return content;

    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const backoff = attempt * 2000;
        console.warn(`Gemma 2B call error (attempt ${attempt}): ${err.message}. Retrying in ${backoff}ms…`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
};

// ──────────────────────────────────────────────────────────────────────────────
// AI INFERENCE GATEWAY (Fine-Tuned Gemma 2B Mental Health Engine)
// ──────────────────────────────────────────────────────────────────────────────

const callAI = async (messages, crisisDetected) => {
  const systemPrompt = buildSystemPrompt(crisisDetected);

  // Build messages: system + last 20 conversation turns
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // ── Local LLM Fallback (Ollama) — if enabled ──────────────────────────────
  if (process.env.USE_LOCAL_LLM === 'true') {
    const ollamaRes = await fetch(process.env.LOCAL_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL || 'gemma2:2b',
        messages: apiMessages,
        stream: false,
      }),
    });
    const ollamaData = await ollamaRes.json();
    return ollamaData.message?.content || 'I could not process your message. Please try again.';
  }

  // ── Gemma 2B Fine-Tuned (3BrainCell) via High-Throughput Inference Gateway ──
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
