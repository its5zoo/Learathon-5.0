import { ImapFlow } from 'imapflow';
import Appointment from '../models/Appointment.js';

let pollerInterval = null;
let isPolling = false;

const callGemmaModel = async (systemPrompt, userPrompt) => {
  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
  const AI_MODEL = process.env.AI_MODEL || 'gemini-3-flash-preview';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
};

const extractBookingRefs = (text) => {
  const matches = text.match(/SSAI-[A-Z0-9]+-[A-Z0-9]+/g);
  return matches ? [...new Set(matches)] : [];
};

const detectReplyType = (text) => {
  const lower = text.toLowerCase();
  const rejectWords = [
    'reject', 'rejected', 'declined', 'decline', 'no slot', 'no slots',
    'fully booked', 'cannot accept', 'not accepting', 'unavailable today',
    'slots full', 'capacity reached', 'cancel request', 'cancelled', 'sorry'
  ];
  const rescheduleWords = [
    'reschedule', 'alternative time', 'different time', 'suggest another',
    'next week', 'postpone', 'moved to', 'different date', 'slots available at', 'alternative slot'
  ];
  const confirmWords = [
    'confirm', 'confirmed', 'pleased to confirm', 'appointment is set',
    'see you', 'scheduled', 'slot booked', 'accepted', 'approved'
  ];

  if (rejectWords.some(w => lower.includes(w))) return 'rejected';
  if (rescheduleWords.some(w => lower.includes(w))) return 'rescheduled';
  if (confirmWords.some(w => lower.includes(w))) return 'confirmed';
  return 'confirmed';
};

const pollInbox = async () => {
  if (isPolling) return;
  isPolling = true;

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Appointment.updateMany(
      {
        status: { $in: ['request_sent', 'pending_email'] },
        createdAt: { $lt: twentyFourHoursAgo },
      },
      {
        $set: {
          status: 'expired',
          clinicReplySummary: '24-Hour SLA Expired without response from clinic. Please book another available specialist.',
          replyReceivedAt: new Date(),
        }
      }
    );
  } catch (sweepErr) {
    console.warn('IMAP 24h sweep error:', sweepErr.message);
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    isPolling = false;
    return;
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    logger: false,
  });

  client.on('error', (err) => {
    console.warn('IMAP client error:', err.message);
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const messages = [];
      for await (const msg of client.fetch({ unseen: true }, {
        uid: true,
        flags: true,
        envelope: true,
        bodyParts: ['TEXT'],
        source: true,
      })) {
        messages.push(msg);
      }

      if (messages.length === 0) {
        return;
      }

      for (const msg of messages) {
        try {
          const subject = msg.envelope?.subject || '';
          const rawBody = msg.source?.toString('utf8') || '';
          const searchText = `${subject} ${rawBody}`;
          const refs = extractBookingRefs(searchText);

          if (refs.length === 0) {
            await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);
            continue;
          }

          for (const ref of refs) {
            const pendingAppointments = await Appointment.find({
              status: { $in: ['request_sent', 'pending_email'] },
            }).sort({ createdAt: -1 }).limit(50);

            const matched = pendingAppointments.find(appt => {
              const bodyLower = rawBody.toLowerCase();
              return (
                bodyLower.includes(appt.patientName?.toLowerCase() || '') ||
                bodyLower.includes(appt.doctorName?.toLowerCase() || '') ||
                rawBody.includes(ref)
              );
            });

            if (!matched) continue;

            const replyType = detectReplyType(rawBody);
            const summaryPrompt = `You are the SoulSpace AI concierge. Summarize this clinic reply for the patient in 3 clear bullet points with emojis.`;
            const summary = await callGemmaModel(summaryPrompt, `Clinic reply email:\n\n${rawBody.slice(0, 2000)}`);

            const finalSummary = summary || (
              replyType === 'confirmed'
                ? `Your appointment has been confirmed.\nPlease check your email for further details.\nContact the clinic if you need any changes.`
                : replyType === 'rejected'
                ? `Requested slot unavailable.\nThe doctor is currently fully booked.\nPlease select another date or specialist.`
                : `The clinic has suggested an alternative slot.\nPlease reply to their email to confirm.`
            );

            await Appointment.findByIdAndUpdate(matched._id, {
              clinicReplyRaw: rawBody.slice(0, 5000),
              clinicReplySummary: finalSummary,
              replyReceivedAt: new Date(),
              status: replyType,
              ...(replyType === 'confirmed' && {
                confirmedDateTime: `${matched.date}, ${matched.time}`,
              }),
            });
          }

          await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);
        } catch (msgErr) {
          console.error('Error processing IMAP message:', msgErr.message);
        }
      }
    } finally {
      try { lock?.release(); } catch {}
    }

    try { await client.logout(); } catch {}
  } catch (err) {
    console.error('IMAP error:', err.message);
    try { await client.logout(); } catch {}
  } finally {
    isPolling = false;
  }
};

export const startInboxPoller = (intervalMs = 60000) => {
  if (pollerInterval) return;

  const GMAIL_USER = process.env.GMAIL_USER;
  if (!GMAIL_USER) return;

  pollInbox();
  pollerInterval = setInterval(pollInbox, intervalMs);
};

export const stopInboxPoller = () => {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
};
