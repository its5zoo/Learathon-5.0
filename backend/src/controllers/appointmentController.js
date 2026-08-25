import Appointment from '../models/Appointment.js';
import { sendAppointmentRequestEmail, sendConfirmationToPatient } from '../services/emailService.js';

// ──────────────────────────────────────────────────────────────────────────────
// HELPER — call Gemini AI
// NOTE: env vars are read lazily inside the function (not at module level)
// because ESM imports are hoisted before dotenv.config() can run.
// ──────────────────────────────────────────────────────────────────────────────
const callGemini = async (systemPrompt, userPrompt) => {
  const API_URL  = process.env.AI_API_URL;
  const API_KEY  = process.env.AI_API_KEY;
  const AI_MODEL = process.env.AI_MODEL || 'gemini-3-flash-preview';

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
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API error ${res.status}: ${errText}`);

  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
};

// ──────────────────────────────────────────────────────────────────────────────
// DOCTORS REGISTRY (mirrors frontend data — single source of truth in prod
//  would be DB, but for demo this is fine)
// ──────────────────────────────────────────────────────────────────────────────
// ── DEMO NOTICE ─────────────────────────────────────────────────────────────
// These are fictional dummy doctors for Learnathon 5.0 demo purposes.
// Two real Gmail addresses are set below for live email demonstration.
// TODO (post-demo): Replace with real MongoDB Doctor collection + Practo/
//   Google Places API lookup for production.
// ─────────────────────────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Neha Verma',
    title: 'Senior Clinical Psychologist',
    qualification: 'Ph.D. Psychology (NIMHANS), RCI Licensed',
    experience: '12+ Years',
    rating: 4.9, reviewsCount: 148,
    specialties: ['Anxiety & Stress', 'Depression', 'CBT Therapy'],
    clinicName: 'Serenity Mind Care Clinic',
    address: 'Plot 42, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    phone: '+91 80 4112 7893',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 4:30 PM',
    fee: '₹1,200 / session',
    // 🔴 LIVE DEMO EMAIL — doctor receiver
    email: '25cse022.mdfaizaanrazakhan@giet.edu',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Iyer',
    title: 'Consultant Psychiatrist',
    qualification: 'MD Psychiatry (AIIMS Delhi)',
    experience: '15+ Years',
    rating: 4.95, reviewsCount: 210,
    specialties: ['Depression', 'Sleep & Burnout', 'Trauma & PTSD'],
    clinicName: 'MindBridge Wellness Center',
    address: 'Level 3, Hill View Chambers, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    phone: '+91 22 6631 4450',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 11:00 AM',
    fee: '₹1,500 / session',
    // 🔴 LIVE DEMO EMAIL — doctor receiver
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Sen',
    title: 'Psychotherapist & Relationship Counselor',
    qualification: 'M.Phil Clinical Psychology',
    experience: '9+ Years',
    rating: 4.85, reviewsCount: 94,
    specialties: ['Relationships', 'Anxiety & Stress', 'Mindfulness'],
    clinicName: 'Aura Counseling Lounge',
    address: 'E-14, South Extension Part 2, New Delhi, Delhi 110049',
    city: 'Delhi NCR',
    phone: '+91 11 4055 2278',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 6:00 PM',
    fee: '₹1,000 / session',
    // doctor receiver
    email: '25cse022.mdfaizaanrazakhan@giet.edu',
    image: 'https://images.unsplash.com/photo-1594824813686-7a1a8c9b9173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Siddharth Menon',
    title: 'Behavioral & Trauma Specialist',
    qualification: 'Ph.D. Behavioral Sciences',
    experience: '11+ Years',
    rating: 4.9, reviewsCount: 122,
    specialties: ['Trauma & PTSD', 'Sleep & Burnout', 'Anxiety & Stress'],
    clinicName: 'Harmony Mind Clinic',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    city: 'Hyderabad',
    phone: '+91 40 6631 9920',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 3:30 PM',
    fee: '₹1,300 / session',
    // doctor receiver
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Nair',
    title: 'Child & Adolescent Psychiatrist',
    qualification: 'MD Psychiatry, DPM (KMC Manipal)',
    experience: '8+ Years',
    rating: 4.8, reviewsCount: 76,
    specialties: ['Child & Adolescent', 'ADHD', 'Family Therapy'],
    clinicName: 'HealMind Child Wellness Clinic',
    address: '34/B, Pali Mala Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    phone: '+91 22 2651 3341',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 2:00 PM',
    fee: '₹900 / session',
    // doctor receiver
    email: '25cse022.mdfaizaanrazakhan@giet.edu',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-6',
    name: 'Dr. Arjun Kapoor',
    title: 'Neuropsychiatrist & Addiction Specialist',
    qualification: 'MD Psychiatry, DNB (NIMHANS)',
    experience: '14+ Years',
    rating: 4.88, reviewsCount: 167,
    specialties: ['Addiction Recovery', 'OCD', 'Bipolar Disorder'],
    clinicName: 'Neuromind Institute',
    address: '12, Richmond Road, Near Clarence Public School, Bengaluru, Karnataka 560025',
    city: 'Bengaluru',
    phone: '+91 80 2558 4401',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 9:00 AM',
    fee: '₹1,800 / session',
    // doctor receiver
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 1. GET AI RECOMMENDATIONS
//    POST /api/appointments/recommend
// ──────────────────────────────────────────────────────────────────────────────
export const getAIRecommendations = async (req, res) => {
  try {
    const { concerns, preferredCity, preferredMode, assessmentHistory } = req.body;
    const user = req.user;

    // Build assessment context string
    let assessmentContext = 'No prior assessment data available.';
    if (assessmentHistory && assessmentHistory.length > 0) {
      const latest = assessmentHistory.slice(-4); // last 4
      assessmentContext = latest.map(a =>
        `${a.assessmentName}: Score ${a.score}/${a.maxScore} — ${a.severity} (${a.interpretation})`
      ).join('\n');
    }

    const systemPrompt = `You are the SoulSpace AI Appointment Concierge. Your job is to analyze a patient's mental health profile and match them with the best available therapists.
    
You MUST respond with ONLY valid JSON — no markdown, no code blocks, just raw JSON.
The JSON must be an array of exactly 3 objects, each with these fields:
- doctorId (string): one of the doctor IDs provided
- matchScore (number): 0–100 match percentage
- matchReason (string): 2–3 sentences explaining WHY this doctor is a great match for this patient
- specialtyHighlight (string): the single most relevant specialty for this patient
- isTopPick (boolean): true for the best match only`;

    const userPrompt = `Patient Profile:
Name: ${user.firstName} ${user.lastName}
Stated Concerns: ${concerns || 'General mental wellness support'}
Preferred City: ${preferredCity || 'Any'}
Preferred Mode: ${preferredMode || 'Any'}

Assessment History:
${assessmentContext}

Available Specialists (rank the best 3 from this list):
${JSON.stringify(DOCTORS.map(d => ({
  id: d.id,
  name: d.name,
  title: d.title,
  specialties: d.specialties,
  experience: d.experience,
  rating: d.rating,
  city: d.city,
  modes: d.modes,
})), null, 2)}

Return exactly 3 doctor recommendations as a JSON array. Prioritize based on: specialty match to patient concerns > assessment scores > rating > preference match.`;

    let recommendations;
    try {
      const aiResponse = await callGemini(systemPrompt, userPrompt);
      // Strip any accidental markdown code fences
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleaned);
    } catch (apiOrParseErr) {
      console.warn('AI Recommendation API failed or parsed incorrectly, using static matching fallback:', apiOrParseErr.message);
      // Fallback: match by city/specialty/rating statically
      const matchedDocs = DOCTORS.filter(d => {
        const cityMatch = !preferredCity || preferredCity === 'Any' || d.city.toLowerCase() === preferredCity.toLowerCase();
        const modeMatch = !preferredMode || preferredMode === 'Any' || d.modes.includes(preferredMode);
        return cityMatch && modeMatch;
      });

      // If no filters matched, just use all doctors
      const sourceList = matchedDocs.length >= 3 ? matchedDocs : DOCTORS;

      recommendations = sourceList.slice(0, 3).map((d, i) => ({
        doctorId: d.id,
        matchScore: 95 - i * 5,
        matchReason: `Dr. ${d.name.split(' ')[1]} is a highly qualified ${d.title} who specializes in ${d.specialties.join(', ')}. Perfect option for consultation in ${d.city}.`,
        specialtyHighlight: d.specialties[0],
        isTopPick: i === 0,
      }));
    }

    // Attach full doctor info to each recommendation
    const enriched = recommendations.map(rec => {
      const doctor = DOCTORS.find(d => d.id === rec.doctorId) || DOCTORS[0];
      return { ...doctor, ...rec };
    });

    return res.json({ success: true, recommendations: enriched });
  } catch (err) {
    console.error('getAIRecommendations critical error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get AI recommendations.' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 2. BOOK APPOINTMENT + SEND EMAIL
//    POST /api/appointments/book
// ──────────────────────────────────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, date, time, mode,
      patientName, patientPhone,
      concerns, attachReport, assessmentHistory,
      aiMatchScore, aiMatchReason,
    } = req.body;
    const user = req.user;

    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    // Generate AI assessment summary if user wants to attach report
    let assessmentSummary = null;
    if (attachReport && assessmentHistory && assessmentHistory.length > 0) {
      try {
        const summaryPrompt = `Summarize this patient's mental health assessment results in 2–3 concise sentences for a therapist to review before a consultation. Be clinical but empathetic. Focus on the key scores and what they indicate.`;
        const summaryData = assessmentHistory.slice(-4).map(a =>
          `${a.assessmentName}: Score ${a.score}/${a.maxScore} — ${a.severity} (${a.interpretation})`
        ).join('; ');
        assessmentSummary = await callGemini(summaryPrompt, `Assessment results: ${summaryData}`);
      } catch (e) {
        console.warn('Assessment summary AI failed:', e.message);
        assessmentSummary = assessmentHistory.slice(-4).map(a =>
          `${a.assessmentName}: ${a.score}/${a.maxScore} (${a.severity})`
        ).join(' | ');
      }
    }

    // Generate a unique booking reference
    const bookingRef = `SSAI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Save appointment to DB
    const appointment = await Appointment.create({
      userId: user._id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorTitle: doctor.title,
      clinicName: doctor.clinicName,
      clinicEmail: doctor.email,
      patientName: patientName || `${user.firstName} ${user.lastName}`,
      patientEmail: user.email,
      patientPhone: patientPhone || user.phone,
      date,
      time,
      mode,
      attachedAssessment: !!attachReport,
      assessmentSummary,
      aiMatchScore,
      aiMatchReason,
      status: 'pending_email',
    });

    // Send email to clinic
    let emailPreviewUrl = null;
    try {
      const emailResult = await sendAppointmentRequestEmail({
        toClinicEmail: doctor.email,
        clinicName: doctor.clinicName,
        doctorName: doctor.name,
        doctorPhone: doctor.phone,
        patientName: appointment.patientName,
        patientEmail: user.email,
        patientPhone: patientPhone || user.phone,
        date,
        time,
        mode,
        concerns,
        matchScore: aiMatchScore,
        assessmentSummary,
        bookingRef,
      });
      emailPreviewUrl = emailResult.previewUrl;

      // Also send confirmation to patient
      await sendConfirmationToPatient({
        patientEmail: user.email,
        patientName: appointment.patientName,
        doctorName: doctor.name,
        clinicName: doctor.clinicName,
        clinicPhone: doctor.phone,
        date, time, mode,
        concerns,
        bookingRef,
      });

      await Appointment.findByIdAndUpdate(appointment._id, {
        requestEmailSent: true,
        requestEmailSentAt: new Date(),
        emailPreviewUrl,
        status: 'request_sent',
      });

    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Non-fatal — appointment is still saved
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment request booked and email sent to clinic.',
      appointment: {
        ...appointment.toObject(),
        bookingRef,
        emailPreviewUrl,
      },
    });

  } catch (err) {
    console.error('bookAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 3. SIMULATE CLINIC REPLY + AI SUMMARIZE
//    POST /api/appointments/:id/simulate-reply
// ──────────────────────────────────────────────────────────────────────────────
export const simulateClinicReply = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, userId: req.user._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Generate a realistic clinic reply
    const replyTemplates = [
      `Dear ${appointment.patientName},\n\nThank you for reaching out to ${appointment.clinicName} through the SoulSpace platform. We are pleased to confirm your appointment with ${appointment.doctorName}.\n\nYour appointment is confirmed for ${appointment.date} at ${appointment.time} (${appointment.mode}).\n\nPlease arrive 10 minutes early for registration. Bring a valid photo ID. For video consultations, you will receive a secure link 15 minutes before your session.\n\nWarm regards,\n${appointment.clinicName} Reception Team\nTel: +91-80-4567-8901`,
      
      `Dear ${appointment.patientName},\n\nWe have received your appointment request for ${appointment.doctorName} at ${appointment.clinicName}. We regret to inform you that the requested slot (${appointment.date}, ${appointment.time}) is currently occupied.\n\nWe would like to offer you an alternative slot: ${appointment.date === 'Today (Earliest)' ? 'Tomorrow' : 'Day After Tomorrow'} at 11:00 AM. Please confirm if this works for you.\n\nWe look forward to supporting your wellness journey.\n\nBest regards,\n${appointment.clinicName} Scheduling Team`,
    ];

    // 70% chance confirmed, 30% rescheduled (for demo variety)
    const clinicReplyRaw = replyTemplates[Math.random() < 0.7 ? 0 : 1];
    const isConfirmed = clinicReplyRaw.includes('pleased to confirm');

    // Ask Gemini to summarize the clinic reply
    let clinicReplySummary = '';
    try {
      const summaryPrompt = `You are the SoulSpace AI concierge. Summarize this clinic's email reply for the patient in 2–3 clear, friendly bullet points. Start each bullet with an emoji. Focus on: (1) whether appointment is confirmed or rescheduled, (2) key action items for the patient, (3) any important details (time, instructions).`;
      clinicReplySummary = await callGemini(summaryPrompt, `Clinic email:\n\n${clinicReplyRaw}`);
    } catch (aiErr) {
      console.warn('Reply summarization AI failed:', aiErr.message);
      clinicReplySummary = isConfirmed
        ? `✅ Appointment confirmed for ${appointment.date} at ${appointment.time}\n📍 Arrive 10 min early with photo ID\n📧 Video link will be shared before session`
        : `🔄 Requested slot unavailable — clinic suggests an alternative time\n📞 Please reply to the clinic email to confirm the new slot`;
    }

    // Update appointment in DB
    await Appointment.findByIdAndUpdate(id, {
      clinicReplyRaw,
      clinicReplySummary,
      replyReceivedAt: new Date(),
      status: isConfirmed ? 'confirmed' : 'rescheduled',
      ...(isConfirmed && { confirmedDateTime: `${appointment.date}, ${appointment.time}` }),
    });

    return res.json({
      success: true,
      clinicReplyRaw,
      clinicReplySummary,
      isConfirmed,
      status: isConfirmed ? 'confirmed' : 'rescheduled',
    });

  } catch (err) {
    console.error('simulateClinicReply error:', err);
    return res.status(500).json({ success: false, message: 'Failed to simulate clinic reply.' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 4. GET USER'S APPOINTMENTS
//    GET /api/appointments/my
// ──────────────────────────────────────────────────────────────────────────────
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
};
