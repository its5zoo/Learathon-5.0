import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      default: 'On a journey toward mental clarity and mindful living with SoulSpace.',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    moodLogs: [
      {
        mood: { type: String },
        level: { type: Number },
        emoji: { type: String },
        type: { type: String },
        confidence: { type: String },
        note: { type: String },
        date: { type: String },
        time: { type: String },
        loggedAt: { type: Date, default: Date.now },
      },
    ],
    assessmentResults: [
      {
        assessmentId: { type: String },
        code: { type: String },
        title: { type: String },
        score: { type: Number },
        severity: { type: String },
        completedAt: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

export default User;
