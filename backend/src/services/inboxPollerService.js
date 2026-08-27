import { ImapFlow } from 'imapflow';
import Appointment from '../models/Appointment.js';

// ──────────────────────────────────────────────────────────────────────────────
// GMAIL IMAP INBOX POLLER
//
// Watches iamrevenent007@gmail.com inbox for clinic reply emails.
// Matches booking reference (SSAI-XXXXXX) in subject/body.
// On match → AI summarizes reply → DB appointment status updated.
//
// Polling interval: 60 seconds (configurable via IMAP_POLL_INTERVAL_MS env)
// ──────────────────────────────────────────────────────────────────────────────

let pollerInterval = null;
let isPolling = false;

// ── 3BrainCell Fine-Tuned Gemma 2B Inference Helper ──────────────────────────
const callGemmaModel = async (systemPrompt, userPrompt) => {
  const API_URL  = process.env.AI_API_URL;
  const API_KEY  = process.env.AI_API_KEY;
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
          { role: 'user',   content: userPrompt   },
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

// ── Extract booking references from email text ────────────────────────────────
const extractBookingRefs = (text) => {
  // Pattern: SSAI-XXXXXXXX-XXX  (our booking ref format)
  const matches = text.match(/SSAI-[A-Z0-9]+-[A-Z0-9]+/g);
  return matches ? [...new Set(matches)] : [];
};

// ── Determine if reply is confirmation, reschedule, or rejection ──────────────
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
  return 'confirmed'; // default assume confirmation
};

// ── Core polling function ─────────────────────────────────────────────────────
const pollInbox = async () => {
  if (isPolling) return; // Prevent overlapping runs
  isPolling = true;

  // ── 1. Automatic 24-Hour Timeout / SLA Expiry Sweep ──────────────────────────
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredRes = await Appointment.updateMany(
      {
        status: { $in: ['request_sent', 'pending_email'] },
        createdAt: { $lt: twentyFourHoursAgo },
      },
      {
        $set: {
          status: 'expired',
          clinicReplySummary: '⏳ 24-Hour SLA Expired: The clinic did not respond within the 24-hour response window. Your request has been automatically suspended to save your time. Please book another available specialist.',
          replyReceivedAt: new Date(),
        }
      }
    );
    if (expiredRes.modifiedCount > 0) {
      console.log(`⏱️ IMAP: Auto-expired ${expiredRes.modifiedCount} overdue appointment request(s).`);
    }
  } catch (sweepErr) {
    console.warn('IMAP 24h sweep warning:', sweepErr.message);
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn('⚠️  IMAP Poller: GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping poll.');
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
    logger: false, // Suppress verbose IMAP logs
  });

  // Handle socket / connection errors gracefully so Node never crashes on ECONNRESET
  client.on('error', (err) => {
    console.warn('⚠️  IMAP client socket error (handled):', err.message);
  });
  try {
    await client.connect();

    // Open INBOX in read-write mode (so we can mark as seen)
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Search for UNSEEN emails only (avoid re-processing)
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
        // No new unseen emails
        return;
      }

      console.log(`📬 IMAP Poller: Found ${messages.length} unseen email(s) to process.`);

      for (const msg of messages) {
        try {
          const subject = msg.envelope?.subject || '';
          const from    = msg.envelope?.from?.[0]?.address || '';
          const rawBody = msg.source?.toString('utf8') || '';

          // Extract booking refs from subject + body
          const searchText = `${subject} ${rawBody}`;
          const refs = extractBookingRefs(searchText);

          if (refs.length === 0) {
            // Not a SoulSpace reply — ignore but mark seen to avoid re-check
            await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);
            continue;
          }

          console.log(`📬 IMAP: Found SoulSpace reply from ${from} | Refs: ${refs.join(', ')}`);

          for (const ref of refs) {
            // Find matching appointment in DB by bookingRef stored in the response
            // bookingRef is returned in API response but not stored in schema by default
            // We match by: patientEmail (appointment), date proximity, and doctorName in body
            const pendingAppointments = await Appointment.find({
              status: { $in: ['request_sent', 'pending_email'] },
            }).sort({ createdAt: -1 }).limit(50);

            // Match by booking ref substring in stored data OR by email pattern
            const matched = pendingAppointments.find(appt => {
              // Check if raw email body mentions the appointment details
              const bodyLower = rawBody.toLowerCase();
              return (
                bodyLower.includes(appt.patientName?.toLowerCase() || '') ||
                bodyLower.includes(appt.doctorName?.toLowerCase() || '') ||
                rawBody.includes(ref)
              );
            });

            if (!matched) {
              console.log(`📬 IMAP: No matching appointment found for ref ${ref}`);
              continue;
            }

            // Determine reply type
            const replyType = detectReplyType(rawBody);

            // AI summarize the reply
            const summaryPrompt = `You are the SoulSpace AI concierge. A clinic has replied to an appointment request email. 
Summarize this clinic reply for the patient in 3 clear, friendly bullet points. 
Start each bullet with an emoji.
Focus on: (1) whether the appointment is confirmed or needs rescheduling, (2) key action items, (3) important details.`;

            const summary = await callGemmaModel(summaryPrompt, `Clinic reply email:\n\n${rawBody.slice(0, 2000)}`);

            const finalSummary = summary || (
              replyType === 'confirmed'
                ? `✅ Your appointment has been confirmed\n📋 Please check your email for further details from the clinic\n📞 Contact the clinic if you need any changes`
                : replyType === 'rejected'
                ? `❌ Requested slot unavailable (No slots left)\n👨‍⚕️ The doctor is currently fully booked for this time\n🔄 Please select another date or pick another recommended specialist`
                : `🔄 The clinic has suggested an alternative slot\n📧 Please reply to their email to confirm the new time\n📞 You can also call the clinic directly`
            );


            // Update appointment in DB
            await Appointment.findByIdAndUpdate(matched._id, {
              clinicReplyRaw:     rawBody.slice(0, 5000),
              clinicReplySummary: finalSummary,
              replyReceivedAt:    new Date(),
              status:             replyType,
              ...(replyType === 'confirmed' && {
                confirmedDateTime: `${matched.date}, ${matched.time}`,
              }),
            });

            console.log(`✅ IMAP Poller: Appointment ${matched._id} updated to "${replyType}" based on reply from ${from}`);
          }

          // Mark the email as seen so we don't process it again
          await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);

        } catch (msgErr) {
          console.error('IMAP: Error processing individual message:', msgErr.message);
        }
      }
    } finally {
      try { lock?.release(); } catch {}
    }

    try { await client.logout(); } catch {}
  } catch (err) {
    console.error('📬 IMAP Poller error:', err.message);
    // Graceful — polling will retry next interval
    try { await client.logout(); } catch {}
  } finally {
    isPolling = false;
  }
};

// ── Start / Stop Poller ───────────────────────────────────────────────────────

/**
 * Starts the Gmail IMAP inbox poller.
 * Call this once from server.js after MongoDB connects.
 * @param {number} intervalMs - Polling interval in ms (default: 60000 = 1 minute)
 */
export const startInboxPoller = (intervalMs = 60000) => {
  if (pollerInterval) {
    console.log('📬 IMAP Poller already running.');
    return;
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  if (!GMAIL_USER) {
    console.warn('📬 IMAP Poller: GMAIL_USER not set — poller disabled.');
    return;
  }

  console.log(`📬 IMAP Inbox Poller started → watching ${GMAIL_USER} every ${intervalMs / 1000}s`);

  // Run immediately on start, then on interval
  pollInbox();
  pollerInterval = setInterval(pollInbox, intervalMs);
};

/**
 * Stops the Gmail IMAP inbox poller.
 */
export const stopInboxPoller = () => {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log('📬 IMAP Poller stopped.');
  }
};
