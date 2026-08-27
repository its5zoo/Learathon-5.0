import Appointment from '../models/Appointment.js';
import { sendAppointmentRequestEmail, sendConfirmationToPatient } from '../services/emailService.js';

const callGemmaModel = async (systemPrompt, userPrompt) => {
  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
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
        { role: 'user', content: userPrompt },
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

const DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Neha Verma',
    title: 'Senior Clinical Psychologist',
    qualification: 'Ph.D. Psychology (NIMHANS), RCI Licensed',
    experience: '12+ Years',
    rating: 4.9,
    reviewsCount: 148,
    specialties: ['Anxiety & Stress', 'Depression', 'CBT Therapy'],
    clinicName: 'Serenity Mind Care Clinic',
    address: 'Plot 42, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    phone: '+91 80 4112 7893',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 04:30 PM',
    fee: '₹1,200 / session',
    email: '25cse195.rakhilesh@giet.edu',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Iyer',
    title: 'Consultant Psychiatrist',
    qualification: 'MD Psychiatry (AIIMS Delhi)',
    experience: '15+ Years',
    rating: 4.95,
    reviewsCount: 210,
    specialties: ['Depression', 'Sleep & Burnout', 'Trauma & PTSD'],
    clinicName: 'MindBridge Wellness Center',
    address: 'Level 3, Hill View Chambers, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    phone: '+91 22 6631 4450',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 11:00 AM',
    fee: '₹1,500 / session',
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Sen',
    title: 'Psychotherapist & Relationship Counselor',
    qualification: 'M.Phil Clinical Psychology',
    experience: '9+ Years',
    rating: 4.85,
    reviewsCount: 94,
    specialties: ['Relationships', 'Anxiety & Stress', 'Mindfulness'],
    clinicName: 'Aura Counseling Lounge',
    address: 'E-14, South Extension Part 2, New Delhi, Delhi 110049',
    city: 'Delhi NCR',
    phone: '+91 11 4055 2278',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 05:30 PM',
    fee: '₹1,000 / session',
    email: '25cse169.grigariaannsunil@giet.edu',
    image: 'https://images.unsplash.com/photo-1594824813686-7a1a8c9b9173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Siddharth Menon',
    title: 'Behavioral & Trauma Specialist',
    qualification: 'Ph.D. Behavioral Sciences',
    experience: '11+ Years',
    rating: 4.9,
    reviewsCount: 122,
    specialties: ['Trauma & PTSD', 'Sleep & Burnout', 'Anxiety & Stress'],
    clinicName: 'Harmony Mind Clinic',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    city: 'Hyderabad',
    phone: '+91 40 6631 9920',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 04:30 PM',
    fee: '₹1,300 / session',
    email: 'dummy.doc4@soulspace.demo',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Nair',
    title: 'Child & Adolescent Psychiatrist',
    qualification: 'MD Psychiatry, DPM (KMC Manipal)',
    experience: '8+ Years',
    rating: 4.8,
    reviewsCount: 76,
    specialties: ['Child & Adolescent', 'ADHD', 'Family Therapy'],
    clinicName: 'HealMind Child Wellness Clinic',
    address: '34/B, Pali Mala Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    phone: '+91 22 2651 3341',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 10:30 AM',
    fee: '₹900 / session',
    email: 'dummy.doc5@soulspace.demo',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-6',
    name: 'Dr. Arjun Kapoor',
    title: 'Neuropsychiatrist & Addiction Specialist',
    qualification: 'MD Psychiatry, DNB (NIMHANS)',
    experience: '14+ Years',
    rating: 4.88,
    reviewsCount: 167,
    specialties: ['Addiction Recovery', 'OCD', 'Bipolar Disorder'],
    clinicName: 'Neuromind Institute',
    address: '12, Richmond Road, Near Clarence Public School, Bengaluru, Karnataka 560025',
    city: 'Bengaluru',
    phone: '+91 80 2558 4401',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 11:30 AM',
    fee: '₹1,800 / session',
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

export const getAIRecommendations = async (req, res) => {
  try {
    const { concerns, preferredCity, preferredMode, assessmentHistory } = req.body;
    const user = req.user;

    let assessmentContext = 'No prior assessment data available.';
    if (assessmentHistory && assessmentHistory.length > 0) {
      const latest = assessmentHistory.slice(-4);
      assessmentContext = latest
        .map(a => `${a.assessmentName}: Score ${a.score}/${a.maxScore} - ${a.severity} (${a.interpretation})`)
        .join('\n');
    }

    const systemPrompt = `You are the SoulSpace AI Appointment Concierge. Your job is to analyze a patient's mental health profile and match them with the best available therapists.
    
You MUST respond with ONLY valid JSON - no markdown, no code blocks, just raw JSON.
The JSON must be an array of exactly 3 objects, each with these fields:
- doctorId (string): one of the doctor IDs provided
- matchScore (number): 0-100 match percentage
- matchReason (string): 2-3 sentences explaining WHY this doctor is a great match for this patient
- specialtyHighlight (string): the single most relevant specialty for this patient
- isTopPick (boolean): true for the best match only`;

    const userPrompt = `Patient Profile:
Name: ${user.firstName} ${user.lastName}
Stated Concerns: ${concerns || 'General mental wellness support'}
Preferred City: ${preferredCity || 'Any'}
Preferred Mode: ${preferredMode || 'Any'}

Assessment History:
${assessmentContext}

Available Specialists:
${JSON.stringify(
  DOCTORS.map(d => ({
    id: d.id,
    name: d.name,
    title: d.title,
    specialties: d.specialties,
    experience: d.experience,
    rating: d.rating,
    city: d.city,
    modes: d.modes,
  })),
  null,
  2
)}

Return exactly 3 doctor recommendations as a JSON array.`;

    let recommendations;
    try {
      const aiResponse = await callGemmaModel(systemPrompt, userPrompt);
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleaned);
    } catch (apiOrParseErr) {
      const matchedDocs = DOCTORS.filter(d => {
        const cityMatch = !preferredCity || preferredCity === 'Any' || d.city.toLowerCase() === preferredCity.toLowerCase();
        const modeMatch = !preferredMode || preferredMode === 'Any' || d.modes.includes(preferredMode);
        return cityMatch && modeMatch;
      });

      const sourceList = matchedDocs.length >= 3 ? matchedDocs : DOCTORS;

      recommendations = sourceList.slice(0, 3).map((d, i) => ({
        doctorId: d.id,
        matchScore: 95 - i * 5,
        matchReason: `Dr. ${d.name.split(' ')[1]} is a highly qualified ${d.title} who specializes in ${d.specialties.join(', ')}.`,
        specialtyHighlight: d.specialties[0],
        isTopPick: i === 0,
      }));
    }

    const enriched = recommendations.map(rec => {
      const doctor = DOCTORS.find(d => d.id === rec.doctorId) || DOCTORS[0];
      return { ...doctor, ...rec };
    });

    return res.json({ success: true, recommendations: enriched });
  } catch (err) {
    console.error('getAIRecommendations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get AI recommendations.' });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, date, time, mode,
      patientName, patientPhone,
      concerns, attachReport, assessmentHistory,
      aiMatchScore, aiMatchReason,
      paymentId, paymentStatus, amountPaid,
    } = req.body;
    const user = req.user;

    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    let assessmentSummary = null;
    if (attachReport && assessmentHistory && assessmentHistory.length > 0) {
      try {
        const summaryPrompt = `Summarize this patient's mental health assessment results in 2-3 concise sentences for a therapist.`;
        const summaryData = assessmentHistory
          .slice(-4)
          .map(a => `${a.assessmentName}: Score ${a.score}/${a.maxScore} - ${a.severity} (${a.interpretation})`)
          .join('; ');
        assessmentSummary = await callGemmaModel(summaryPrompt, `Assessment results: ${summaryData}`);
      } catch (e) {
        assessmentSummary = assessmentHistory
          .slice(-4)
          .map(a => `${a.assessmentName}: ${a.score}/${a.maxScore} (${a.severity})`)
          .join(' | ');
      }
    }

    const bookingRef = `SSAI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

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
      paymentId: paymentId || null,
      paymentStatus: paymentStatus || (paymentId ? 'paid' : 'pending'),
      amountPaid: amountPaid || null,
      status: 'pending_email',
    });

    let emailPreviewUrl = null;
    const isDummyEmail = doctor.email.endsWith('@soulspace.demo');

    if (isDummyEmail) {
      await Appointment.findByIdAndUpdate(appointment._id, {
        requestEmailSent: false,
        status: 'demo_no_email',
      });
    } else {
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

        await sendConfirmationToPatient({
          patientEmail: user.email,
          patientName: appointment.patientName,
          doctorName: doctor.name,
          clinicName: doctor.clinicName,
          clinicPhone: doctor.phone,
          date,
          time,
          mode,
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
      }
    }

    const updatedAppointment = await Appointment.findById(appointment._id);

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        ...updatedAppointment.toObject(),
        bookingRef,
      },
    });
  } catch (err) {
    console.error('bookAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
};

export const simulateClinicReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome } = req.body || {};
    const appointment = await Appointment.findOne({ _id: id, userId: req.user._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const templates = {
      confirmed: `Dear ${appointment.patientName},\n\nThank you for reaching out to ${appointment.clinicName}. We are pleased to confirm your appointment with ${appointment.doctorName}.\n\nYour appointment is confirmed for ${appointment.date} at ${appointment.time} (${appointment.mode}).\n\nPlease arrive 10 minutes early. For video consultations, a secure link will be provided.\n\nWarm regards,\n${appointment.clinicName} Reception Team`,
      rejected: `Dear ${appointment.patientName},\n\nThank you for contacting ${appointment.clinicName}. We regret to inform you that Dr. ${appointment.doctorName} is fully booked for ${appointment.date} at ${appointment.time}.\n\nSincerely,\n${appointment.clinicName} Scheduling Desk`,
      rescheduled: `Dear ${appointment.patientName},\n\nRegarding your appointment request for ${appointment.doctorName} at ${appointment.clinicName}: the requested slot is unavailable. We propose an alternative slot: tomorrow at 04:30 PM. Please reply to confirm.\n\nBest regards,\n${appointment.clinicName}`,
      expired: `24-Hour SLA Window Expired. No reply was received from ${appointment.clinicName}.`,
    };

    const chosenOutcome = outcome || (Math.random() < 0.6 ? 'confirmed' : Math.random() < 0.5 ? 'rescheduled' : 'rejected');
    const clinicReplyRaw = templates[chosenOutcome] || templates.confirmed;

    let clinicReplySummary = '';
    try {
      if (chosenOutcome === 'expired') {
        clinicReplySummary = `24-Hour SLA Expired without response from clinic.`;
      } else {
        const summaryPrompt = `You are the SoulSpace AI concierge. Summarize this clinic's email reply for the patient in 2-3 clear, friendly bullet points.`;
        clinicReplySummary = await callGemmaModel(summaryPrompt, `Clinic email:\n\n${clinicReplyRaw}`);
      }
    } catch (aiErr) {
      if (chosenOutcome === 'confirmed') {
        clinicReplySummary = `Appointment confirmed for ${appointment.date} at ${appointment.time}.`;
      } else if (chosenOutcome === 'rejected') {
        clinicReplySummary = `Requested slot unavailable. Please select another date.`;
      } else if (chosenOutcome === 'rescheduled') {
        clinicReplySummary = `Alternative time proposed by clinic.`;
      } else {
        clinicReplySummary = `Request window expired.`;
      }
    }

    await Appointment.findByIdAndUpdate(id, {
      clinicReplyRaw,
      clinicReplySummary,
      replyReceivedAt: new Date(),
      status: chosenOutcome,
      ...(chosenOutcome === 'confirmed' && { confirmedDateTime: `${appointment.date}, ${appointment.time}` }),
    });

    return res.json({
      success: true,
      clinicReplyRaw,
      clinicReplySummary,
      isConfirmed: chosenOutcome === 'confirmed',
      status: chosenOutcome,
    });
  } catch (err) {
    console.error('simulateClinicReply error:', err);
    return res.status(500).json({ success: false, message: 'Failed to simulate clinic reply.' });
  }
};

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

export const getAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, userId: req.user._id })
      .select('status clinicReplySummary clinicReplyRaw confirmedDateTime replyReceivedAt');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    return res.json({
      success: true,
      status: appointment.status,
      clinicReplySummary: appointment.clinicReplySummary || null,
      clinicReplyRaw: appointment.clinicReplyRaw || null,
      confirmedDateTime: appointment.confirmedDateTime || null,
      replyReceivedAt: appointment.replyReceivedAt || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch appointment status.' });
  }
};
