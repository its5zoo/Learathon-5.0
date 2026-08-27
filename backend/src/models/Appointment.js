import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorTitle: {
      type: String,
    },
    clinicName: {
      type: String,
      required: true,
    },
    clinicEmail: {
      type: String,
      default: 'clinic@soulspace.demo',
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['In-Clinic', 'Video Consultation'],
      required: true,
    },
    attachedAssessment: {
      type: Boolean,
      default: false,
    },
    assessmentSummary: {
      type: String,
    },
    aiMatchScore: {
      type: Number,
    },
    aiMatchReason: {
      type: String,
    },
    requestEmailSent: {
      type: Boolean,
      default: false,
    },
    requestEmailSentAt: {
      type: Date,
    },
    emailPreviewUrl: {
      type: String,
    },
    clinicReplyRaw: {
      type: String,
    },
    clinicReplySummary: {
      type: String,
    },
    replyReceivedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending_email', 'request_sent', 'confirmed', 'rescheduled', 'rejected', 'expired', 'cancelled'],
      default: 'pending_email',
    },
    confirmedDateTime: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    amountPaid: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Appointment', appointmentSchema);
