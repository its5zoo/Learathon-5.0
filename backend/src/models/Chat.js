import mongoose from 'mongoose';

// ── Message Sub-Schema ─────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 8000,
    },
    emotion: {
      type: String,
      enum: ['neutral', 'anxious', 'sad', 'angry', 'stressed', 'happy', 'hopeful', 'crisis'],
      default: 'neutral',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ── Chat Session Schema ────────────────────────────────────────────────────────
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      maxlength: 80,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    isCrisisSession: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update lastMessageAt on save (Mongoose 8+ compatible — no next())
chatSchema.pre('save', function () {
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
