import Chat from '../models/Chat.js';

const CRISIS_HELPLINES = `
🆘 **Immediate 24/7 Crisis & Online Support**
• **Tele-MANAS** (Govt 24/7 Toll-Free): 📞 14416 / 1800-891-4416
• **iCall Live WhatsApp Support**: 💬 wa.me/919152987821
• **Vandrevala Foundation** (Free 24/7): 📞 9999 666 555 / 1860-2662-345
• **KIRAN National Helpline**: 📞 1800-599-0019
• **Online Video Specialist Consultation**: 🩺 Available in SoulSpace Appointment Hub

Please reach out — confidential online & phone support is available right now. 💙
`.trim();

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'killing myself', 'end my life', 'ending my life',
  'want to die', 'wanna die', 'wanna di', 'going to die', 'gonna die', 'will die', 'feel like dying',
  'about to die', 'about to di', 'about to kill', 'about to end', 'im about to die', "i'm about to die",
  'i am about to die', 'i am about to di', 'ready to die', 'time to die', 'dying tonight',
  'wish i was dead', 'wish i were dead', 'rather be dead', 'better off dead', 'better if i was dead',
  'take my life', 'take my own life', 'overdose', 'overdosing', 'cut myself', 'hanging myself', 'hang myself',
  'slit my wrist', 'slit my throat', 'drink poison', 'jump off', 'jump from roof',
  'cant go on', "can't go on", 'cannot go on', 'cant take this anymore', "can't take this anymore", 'cannot take this anymore',
  'no reason to live', 'no point living', 'no point in living', 'nothing to live for',
  'self harm', 'self-harm', 'hurt myself', 'hurting myself', 'worthless', 'hopeless',
  'end it all', 'end everything', 'not worth living', 'goodbye world', 'final goodbye', 'my last words',
  'give up on life', 'tired of living', "don't want to live", 'dont want to live', 'do not want to live', 'hate being alive',
  'done with life', 'done living', 'done with this world',
  'marne ka man', 'mar jaunga', 'mar jaungi', 'jaan de dunga', 'jaan dedu', 'khudkushi',
  'aatmahatya', 'mar jana chahta', 'mar jana chahti', 'jeena nahi chahta', 'jeena nahi chahti', 'khud ko khatam'
];

const EMOTION_PATTERNS = {
  crisis: CRISIS_KEYWORDS,
  anxious: [
    'anxious', 'anxiety', 'panic', 'overthink', 'worry', 'nervous', 'scared', 'fear', 'dread', 'frightened',
    'heavy breathing', 'shortness of breath', 'hyperventilating', 'cannot breathe', "can't breathe", 'cant breathe',
    'trouble breathing', 'suffocating', 'heart racing', 'palpitations', 'shaking', 'terrified', 'ghabrahat'
  ],
  sad: ['sad', 'crying', 'cry', 'depressed', 'depression', 'lonely', 'alone', 'miss', 'grief', 'heartbroken', 'hopeless'],
  angry: ['angry', 'anger', 'frustrated', 'furious', 'rage', 'hate', 'annoyed', 'irritated'],
  stressed: ['stressed', 'stress', 'overwhelmed', 'burnout', 'exhausted', 'tired', 'pressure', 'deadline', 'burdened'],
  happy: ['happy', 'great', 'good', 'better', 'amazing', 'excited', 'joy', 'grateful', 'thankful', 'relieved'],
  hopeful: ['hopeful', 'hope', 'improving', 'progress', 'trying', 'effort'],
};

const isCrisis = (text) => {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();

  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) return true;

  const crisisPatterns = [
    /\b(suicid\w*|khudkushi|aatmahatya)\b/i,
    /\b(kill|killing|hurt|harm|cut|slit|hang|hanging|poison|drown|shoot|strangle|asphyxiate)\s*(my\s*own\s*self|myself|my\s*wrist|my\s*throat|my\s*life)\b/i,
    /\b(about\s*to|going\s*to|gonna|want\s*to|wanna|planning\s*to|ready\s*to|will|feel\s*like|time\s*to)\s*(di|die|dying|end\s*it|end\s*my\s*life|kill\s*myself|hang\s*myself|jump)\b/i,
    /\bi\s*(am|'m|m)?\s*(about\s*to\s*di(e)?|dying|gonna\s*die|going\s*to\s*die)\b/i,
    /\b(end\s*my\s*life|ending\s*my\s*life|end\s*it\s*all|end\s*everything|take\s*my\s*life|take\s*my\s*own\s*life)\b/i,
    /\bfeel(ing)?\s*like\s*(ending\s*it|dying|giving\s*up)\b/i,
    /\b(cant|can't|cannot)\s*(go\s*on|take\s*(it|this)\s*anymore|live\s*like\s*this|do\s*this\s*anymore)\b/i,
    /\b(no\s*reason\s*to\s*live|no\s*point\s*(in\s*)?living|nothing\s*to\s*live\s*for|tired\s*of\s*living|done\s*with\s*life|done\s*living)\b/i,
    /\b(wish\s*i\s*(was|were)\s*dead|better\s*off\s*dead|rather\s*be\s*dead)\b/i,
    /\b(jump\s*(off|from|in\s*front\s*of))\b/i,
    /\b(swallow\s*(all\s*)?pills|overdose|overdosing)\b/i,
    /\b(mar\s*jaunga|mar\s*jaungi|jaan\s*de\s*dunga|marne\s*ka\s*man|jeena\s*nahi\s*chahta|jeena\s*nahi\s*chahti|khud\s*ko\s*khatam)\b/i,
  ];

  return crisisPatterns.some((regex) => regex.test(lower));
};

const detectEmotion = (text) => {
  if (!text || typeof text !== 'string') return 'neutral';
  if (isCrisis(text)) return 'crisis';
  const lower = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_PATTERNS)) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
        return emotion;
      }
    }
  }
  return 'neutral';
};

const generateTitle = (firstMessage) => {
  const words = firstMessage.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 60 ? words.slice(0, 60) + '…' : words || 'New Conversation';
};

const buildSystemPrompt = (crisisDetected) => `
You are SoulSpace AI, an intelligent, empathetic mental health counselor powered by the fine-tuned Gemma-2B clinical mental health model developed by the 3BrainCell team.

CONVERSATIONAL & CLINICAL INSTRUCTIONS:
- Directly and specifically address what the user just asked or shared.
- Speak freshly, dynamically, and contextually on every turn without generic openings.
- Validate their specific emotion with warmth, then provide a practical calming perspective or non-medical grounding exercise.
- Keep every response concise, natural, and conversational: MAXIMUM 2 to 3 sentences total.

STRICT SAFETY & ETHICAL GUARDRAILS:
1. NO SEXUAL / EXPLICIT / INAPPROPRIATE CONTENT
2. NO ABUSIVE / TOXIC TALK
3. STRICTLY NO MEDICINE / DRUG PRESCRIPTIONS
4. CALMING GROUNDING SUGGESTIONS (Non-Medical Only)

LANGUAGE:
- Understand Hindi, Hinglish, and English completely.
- Always output your reply in CLEAR, NATURAL ENGLISH ONLY.

${crisisDetected ? `
CRITICAL CRISIS SAFETY PROTOCOL:
- User expressed thoughts of suicide or acute severe distress.
- You are in emergency support mode.
- Respond in 2 compassionate sentences acknowledging pain and encouraging immediate connection with crisis professionals.
` : ''}
`.trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callAIWithRetry = async (apiMessages, retries = 3) => {
  let lastErr;
  const modelToUse = process.env.AI_MODEL || 'gemini-3-flash-preview';

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
          model: modelToUse,
          messages: apiMessages,
          temperature: 0.7,
          top_p: 0.95,
        }),
      });

      if (response.status === 429 || response.status === 503) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10);
        const backoff = retryAfter * 1000 || attempt * 1500;
        await sleep(backoff);
        lastErr = new Error(`AI API overloaded (${response.status})`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Model returned empty response');
      return content;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(attempt * 2000);
      }
    }
  }
  throw lastErr;
};

const callAI = async (messages, crisisDetected) => {
  const systemPrompt = buildSystemPrompt(crisisDetected);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  if (process.env.USE_LOCAL_LLM === 'true') {
    const localUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434/api/chat';
    try {
      const response = await fetch(localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.LOCAL_LLM_MODEL || 'gemma-mentalhealth',
          messages: apiMessages,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message?.content?.trim();
        if (content) {
          return content;
        }
      }
    } catch (localErr) {
      // fallback to cloud
    }
  }

  if (process.env.AI_API_URL) {
    return callAIWithRetry(apiMessages);
  }

  throw new Error('No AI inference service available');
};

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
    console.error('createSession error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not create session.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const session = await Chat.findOne({ _id: sessionId, userId: req.userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }

    const userContent = content.trim();
    const crisisDetected = isCrisis(userContent);
    const userEmotion = detectEmotion(userContent);

    session.messages.push({
      role: 'user',
      content: userContent,
      emotion: crisisDetected ? 'crisis' : userEmotion,
      timestamp: new Date(),
    });

    if (session.messages.length === 1 || session.title === 'New Conversation') {
      session.title = generateTitle(userContent);
    }

    if (crisisDetected) session.isCrisisSession = true;

    let aiContent;
    try {
      aiContent = await callAI(session.messages, crisisDetected);
    } catch (aiErr) {
      console.error('AI call failed:', aiErr.message);
      aiContent = "I'm having a bit of trouble connecting right now — please try sending your message again in a moment. If you're in distress, you can reach iCall at 9152987821 anytime.";
    }

    if (crisisDetected) {
      session.isCrisisSession = true;
      const containsInappropriateAdvice = /breathing exercise|muscle relaxation|box breathing|focusing on your senses|grounding exercise|take a walk|drink cold water/i.test(aiContent);
      if (containsInappropriateAdvice || !aiContent || aiContent.length < 20) {
        aiContent = "I hear how much pain you are experiencing right now, and I want you to know that you are not alone and your life deeply matters. Please stay safe — immediate confidential support is available right now.";
      }
      if (!aiContent.includes('Tele-MANAS') && !aiContent.includes('iCall')) {
        aiContent = aiContent + '\n\n' + CRISIS_HELPLINES;
      }
    } else {
      const casualGamingSlang = /\b(i\s*died\s*(again)?\s*(bro|bruh|man|dude)?|died\s*in\s*(the\s*)?(game|match|round|boss|val|bgmi|cod)|(lol|lmao|haha|lmfao)\s*i\s*died|died\s*laughing)\b/i;
      if (casualGamingSlang.test(userContent)) {
        aiContent = "Haha wait, did you die in a video game or was today just that exhausting bro? 🎮 If you're gaming, which game was it? If life is just wearing you down, I'm right here with you!";
      } else {
        const isHallucinatedBoilerplate = /takes a lot of courage to reach out|acknowledge the strength it took for you to share/i.test(aiContent);
        if (isHallucinatedBoilerplate) {
          aiContent = aiContent
            .replace(/I'm here to (listen and )?support you through this difficult time\.\s*/i, '')
            .replace(/It takes a lot of courage to reach out,?\s*(and\s*)?I want to acknowledge the strength it took for you to share your thoughts and feelings with me\.\s*/i, '')
            .trim();

          if (!aiContent || aiContent.length < 25) {
            aiContent = "I hear you. What's on your mind today, or what happened that got you feeling like this?";
          }
        }
      }
    }

    const aiEmotion = crisisDetected ? 'crisis' : detectEmotion(aiContent);

    session.messages.push({
      role: 'assistant',
      content: aiContent,
      emotion: aiEmotion,
      timestamp: new Date(),
    });

    await session.save();

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
      userEmotion,
      sessionTitle: session.title,
    });
  } catch (err) {
    console.error('sendMessage error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error processing message.' });
  }
};

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
    console.error('getSessions error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch sessions.' });
  }
};

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
    console.error('getSession error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch session.' });
  }
};

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
    console.error('deleteSession error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not delete session.' });
  }
};
