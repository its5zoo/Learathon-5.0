import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Doctor info
    doctorId:   { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorTitle:{ type: String },
    clinicName: { type: String, required: true },
    clinicEmail:{ type: String, default: 'clinic@soulspace.demo' }, // demo

    // Patient info
    patientName:  { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String },

    // Booking details
    date:             { type: String, required: true },
    time:             { type: String, required: true },
    mode:             { type: String, enum: ['In-Clinic', 'Video Consultation'], required: true },
    attachedAssessment: { type: Boolean, default: false },
    assessmentSummary:  { type: String }, // AI-generated assessment digest attached to email

    // AI concierge fields
    aiMatchScore:  { type: Number }, // 0–100
    aiMatchReason: { type: String },

    // Email workflow
    requestEmailSent:   { type: Boolean, default: false },
    requestEmailSentAt: { type: Date },
    emailPreviewUrl:    { type: String }, // Ethereal preview link (demo)

    // Clinic reply workflow
    clinicReplyRaw:     { type: String }, // simulated raw clinic reply
    clinicReplySummary: { type: String }, // Gemini-summarized clinic reply
    replyReceivedAt:    { type: Date },

    // Booking status
    status: {
      type: String,
      enum: ['pending_email', 'request_sent', 'confirmed', 'rescheduled', 'cancelled'],
      default: 'pending_email',
    },
    confirmedDateTime: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
