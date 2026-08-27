import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import InvoiceModal from '../components/InvoiceModal/InvoiceModal';
import './Appointment.css';


// ─── Types ────────────────────────────────────────────────────────────────────
interface Doctor {
  id: string;
  name: string;
  title: string;
  qualification: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  clinicName: string;
  address: string;
  city: string;
  modes: ('In-Clinic' | 'Video Consultation')[];
  nextAvailable: string;
  fee: string;
  image: string;
  matchScore?: number;
  matchReason?: string;
  specialtyHighlight?: string;
  isTopPick?: boolean;
  email?: string;
}

// ─── Static Doctor Data (mirrors backend DOCTORS list) ────────────────────────
const doctorsData: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Neha Verma',
    title: 'Senior Clinical Psychologist',
    qualification: 'Ph.D. Psychology (NIMHANS), RCI Licensed',
    experience: '12+ Years Experience',
    rating: 4.9,
    reviewsCount: 148,
    specialties: ['Anxiety & Stress', 'Depression', 'CBT Therapy'],
    clinicName: 'Serenity Mind Care Clinic',
    address: 'Plot 42, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 4:30 PM',
    fee: '₹1,200 / session',
    email: '25cse195.rakhilesh@giet.edu',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Iyer',
    title: 'Consultant Psychiatrist',
    qualification: 'MD Psychiatry (AIIMS Delhi)',
    experience: '15+ Years Experience',
    rating: 4.95,
    reviewsCount: 210,
    specialties: ['Depression', 'Sleep & Burnout', 'Trauma & PTSD'],
    clinicName: 'MindBridge Wellness Center',
    address: 'Level 3, Hill View Chambers, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
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
    experience: '9+ Years Experience',
    rating: 4.85,
    reviewsCount: 94,
    specialties: ['Relationships', 'Anxiety & Stress', 'Mindfulness'],
    clinicName: 'Aura Counseling Lounge',
    address: 'E-14, South Extension Part 2, New Delhi, Delhi 110049',
    city: 'Delhi NCR',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 6:00 PM',
    fee: '₹1,000 / session',
    email: '25cse169.grigariaannsunil@giet.edu',
    image: 'https://images.unsplash.com/photo-1594824813686-7a1a8c9b9173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Siddharth Menon',
    title: 'Behavioral & Trauma Specialist',
    qualification: 'Ph.D. Behavioral Sciences',
    experience: '11+ Years Experience',
    rating: 4.9,
    reviewsCount: 122,
    specialties: ['Trauma & PTSD', 'Sleep & Burnout', 'Anxiety & Stress'],
    clinicName: 'Harmony Mind Clinic',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    city: 'Hyderabad',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 3:30 PM',
    fee: '₹1,300 / session',
    email: 'dummy.doc4@soulspace.demo',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Nair',
    title: 'Child & Adolescent Psychiatrist',
    qualification: 'MD Psychiatry, DPM (KMC Manipal)',
    experience: '8+ Years Experience',
    rating: 4.8,
    reviewsCount: 76,
    specialties: ['Child & Adolescent', 'ADHD', 'Family Therapy'],
    clinicName: 'HealMind Child Wellness Clinic',
    address: '34/B, Pali Mala Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Today, 2:00 PM',
    fee: '₹900 / session',
    email: 'dummy.doc5@soulspace.demo',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'doc-6',
    name: 'Dr. Arjun Kapoor',
    title: 'Neuropsychiatrist & Addiction Specialist',
    qualification: 'MD Psychiatry, DNB (NIMHANS)',
    experience: '14+ Years Experience',
    rating: 4.88,
    reviewsCount: 167,
    specialties: ['Addiction Recovery', 'OCD', 'Bipolar Disorder'],
    clinicName: 'Neuromind Institute',
    address: '12, Richmond Road, Near Clarence Public School, Bengaluru, Karnataka 560025',
    city: 'Bengaluru',
    modes: ['In-Clinic', 'Video Consultation'],
    nextAvailable: 'Tomorrow, 9:00 AM',
    fee: '₹1,800 / session',
    email: 'ashiafhalak786@gmail.com',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];


const timeSlots = [
  '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM', '07:30 PM',
];

const AI_LOADING_STEPS = [
  'Analyzing your assessment history…',
  'Matching specialists to your profile…',
  'Scoring specialty alignment…',
  'Ranking by availability & ratings…',
  'Preparing your Top 3 recommendations…',
];

const RAZORPAY_KEY_ID = 'rzp_test_TUhp2MpaI3MdOT';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const Appointment: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();

  // Stepper: 1=Select, 2=Schedule, 3=Review & Send  | 'confirmed'=success state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 'confirmed'>(1);

  // Payment & Invoice states
  const [paymentOption, setPaymentOption] = useState<'razorpay' | 'clinic'>('razorpay');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);


  // Filters
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Anxiety & Stress']);

  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [userConcerns, setUserConcerns] = useState('');

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('Today (Earliest)');
  const [selectedTime, setSelectedTime] = useState('04:30 PM');
  const [consultationMode, setConsultationMode] = useState<'In-Clinic' | 'Video Consultation'>('In-Clinic');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [attachReport, setAttachReport] = useState(true);

  // Booking result
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [bookingRef, setBookingRef] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isDummyDoctor, setIsDummyDoctor] = useState(false);

  // AI Concierge modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [aiRecommendations, setAiRecommendations] = useState<Doctor[]>([]);
  const [aiError, setAiError] = useState('');

  // Clinic reply
  const [isSimulatingReply, setIsSimulatingReply] = useState(false);
  const [clinicReplySummary, setClinicReplySummary] = useState('');
  const [clinicReplyRaw, setClinicReplyRaw] = useState('');
  const [showRawReply, setShowRawReply] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState('request_sent');

  // Pre-fill from auth
  useEffect(() => {
    if (user) {
      setPatientName(`${user.firstName} ${user.lastName}`);
      setPatientPhone(user.phone || '');
    }
  }, [user]);

  // ─── Auto-poll for real clinic reply (IMAP detection) ─────────────────────
  // When on confirmed screen and no reply yet, poll DB every 30s.
  // If IMAP poller found a real clinic reply, this will auto-update the UI.
  useEffect(() => {
    if (currentStep !== 'confirmed' || !bookedAppointment?._id || clinicReplySummary) return;

    let pollCount = 0;
    const MAX_POLLS = 20; // Stop after ~10 minutes (20 × 30s)

    const pollStatus = async () => {
      pollCount++;
      if (pollCount > MAX_POLLS) {
        clearInterval(pollerId);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/appointments/${bookedAppointment._id}/status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.clinicReplySummary) {
          // Real reply detected by IMAP poller!
          setClinicReplySummary(data.clinicReplySummary);
          setClinicReplyRaw(data.clinicReplyRaw || '');
          setAppointmentStatus(data.status);

          // Update profile notification
          try {
            const existing = JSON.parse(localStorage.getItem('ss_latest_appointment') || '{}');
            localStorage.setItem('ss_latest_appointment', JSON.stringify({
              ...existing,
              status: data.status,
              confirmedAt: new Date().toISOString(),
            }));
          } catch {}

          clearInterval(pollerId);
        }
      } catch { /* silent fail — will retry */ }
    };

    const pollerId = setInterval(pollStatus, 30000); // every 30 seconds
    return () => clearInterval(pollerId);
  }, [currentStep, bookedAppointment, clinicReplySummary, token]);

  const getAssessmentHistory = () => {
    try {
      const stored = localStorage.getItem('ss_assessment_history');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  // ─── Filters ───────────────────────────────────────────────────────────────
  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const filteredDoctors = doctorsData.filter(doc => {
    const matchesSpec = selectedSpecialties.length === 0 ||
      selectedSpecialties.some(s => doc.specialties.includes(s));
    const matchesMode = selectedMode === 'All' || doc.modes.includes(selectedMode as any);
    const matchesCity = selectedCity === 'All' || doc.city === selectedCity;
    return matchesSpec && matchesMode && matchesCity;
  });

  // ─── Select Doctor ─────────────────────────────────────────────────────────
  const handleSelectDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setSelectedDoctor(doctor);
    setCurrentStep(2);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // ─── AI Concierge ──────────────────────────────────────────────────────────
  const handleAIConcierge = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowAiModal(true);
    setAiLoading(true);
    setAiError('');
    setAiRecommendations([]);
    setAiLoadingStep(0);

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < AI_LOADING_STEPS.length) setAiLoadingStep(step);
    }, 900);

    try {
      const res = await fetch(`${API_URL}/appointments/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          concerns: userConcerns || selectedSpecialties.join(', '),
          preferredCity: selectedCity !== 'All' ? selectedCity : undefined,
          preferredMode: selectedMode !== 'All' ? selectedMode : undefined,
          assessmentHistory: getAssessmentHistory(),
        }),
      });
      const data = await res.json();
      clearInterval(stepInterval);
      setAiLoading(false);
      if (data.success) {
        setAiRecommendations(data.recommendations);
      } else {
        setAiError(data.message || 'Could not fetch recommendations.');
      }
    } catch {
      clearInterval(stepInterval);
      setAiLoading(false);
      setAiError('Failed to connect to AI Concierge. Please try again.');
    }
  };

  const handleSelectAiRecommendation = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowAiModal(false);
    setCurrentStep(2);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // ─── Book Appointment & Razorpay Checkout ──────────────────────────────────
  const submitAppointmentBooking = async (
    razorpayPaymentId: string | null = null,
    payStatus: string = 'pending',
    amount: number | null = null
  ) => {
    if (!selectedDoctor || !user) return;
    setIsBooking(true);
    setBookingError('');

    try {
      const res = await fetch(`${API_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: selectedTime,
          mode: consultationMode,
          patientName,
          patientPhone,
          concerns: userConcerns,
          attachReport,
          assessmentHistory: getAssessmentHistory(),
          aiMatchScore: selectedDoctor.matchScore,
          aiMatchReason: selectedDoctor.matchReason,
          paymentId: razorpayPaymentId,
          paymentStatus: payStatus,
          amountPaid: amount,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const ref = data.appointment.bookingRef || `SSAI-${Date.now().toString(36).toUpperCase()}`;
        setBookingRef(ref);
        setBookedAppointment(data.appointment);
        setAppointmentStatus(data.appointment.status || 'request_sent');
        setIsDummyDoctor(data.appointment.status === 'demo_no_email');
        setPaymentId(razorpayPaymentId);
        setPaymentStatus(payStatus);
        setAmountPaid(amount);
        setCurrentStep('confirmed');

        // Store notification for Profile page
        const notif = {
          doctorName: selectedDoctor.name,
          clinicName: selectedDoctor.clinicName,
          date: selectedDate,
          time: selectedTime,
          mode: consultationMode,
          bookingRef: ref,
          status: data.appointment.status,
          paymentStatus: payStatus,
          paymentId: razorpayPaymentId,
          bookedAt: new Date().toISOString(),
        };
        localStorage.setItem('ss_latest_appointment', JSON.stringify(notif));

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setBookingError(data.message || 'Booking failed. Please try again.');
      }
    } catch {
      setBookingError('Could not connect to server. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !user) return;

    if (paymentOption === 'razorpay') {
      setIsBooking(true);
      setBookingError('');
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setBookingError('Razorpay SDK failed to load. Please check your network connection or select Pay at Clinic.');
        setIsBooking(false);
        return;
      }

      const match = selectedDoctor.fee.replace(/,/g, '').match(/\d+/);
      const amountRupees = match ? parseInt(match[0], 10) : 1200;
      const amountPaise = amountRupees * 100;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: 'INR',
        name: 'SoulSpace Mental Health',
        description: `Consultation Fee with ${selectedDoctor.name}`,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=128&q=80',
        handler: async (response: any) => {
          await submitAppointmentBooking(response.razorpay_payment_id, 'paid', amountRupees);
        },
        prefill: {
          name: patientName || `${user.firstName || ''} ${user.lastName || ''}`,
          email: user.email,
          contact: patientPhone || user.phone || '9876543210',
        },
        theme: {
          color: '#3f72af',
        },
        modal: {
          ondismiss: () => {
            setIsBooking(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setBookingError(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
        setIsBooking(false);
      });
      rzp.open();
    } else {
      // Pay at Clinic option
      await submitAppointmentBooking(null, 'pending', null);
    }
  };


  // ─── Simulate Clinic Reply ─────────────────────────────────────────────────
  const handleSimulateReply = async (outcome: string = 'confirmed') => {
    if (!bookedAppointment?._id) return;
    setIsSimulatingReply(true);
    try {
      const res = await fetch(`${API_URL}/appointments/${bookedAppointment._id}/simulate-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ outcome }),
      });
      const data = await res.json();
      if (data.success) {
        setClinicReplySummary(data.clinicReplySummary);
        setClinicReplyRaw(data.clinicReplyRaw);
        setAppointmentStatus(data.status);

        // Update profile notification with status
        try {
          const existing = JSON.parse(localStorage.getItem('ss_latest_appointment') || '{}');
          localStorage.setItem('ss_latest_appointment', JSON.stringify({
            ...existing,
            status: data.status,
            confirmedAt: new Date().toISOString(),
          }));
        } catch {}
      }
    } catch {
      setClinicReplySummary('Failed to fetch clinic reply. Please try again.');
    } finally {
      setIsSimulatingReply(false);
    }
  };


  const resetAll = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setBookedAppointment(null);
    setClinicReplySummary('');
    setClinicReplyRaw('');
    setAppointmentStatus('request_sent');
    setIsDummyDoctor(false);
    setBookingRef('');
    setBookingError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="appointment-page">

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <section className="app-hero">
        <div className="container app-hero-container">
          <div className="app-hero-left">
            <h1 className="app-hero-title">Book Your Serenity</h1>
            <p className="app-hero-subtitle">
              Find the right therapist for your journey. A safe space for your mind to bloom,
              curated with empathy and professional expertise.
            </p>

            {isLoggedIn && (
              <div className="concerns-input-wrapper">
                <input
                  className="concerns-input"
                  type="text"
                  placeholder="Briefly describe what you're experiencing (optional)…"
                  value={userConcerns}
                  onChange={e => setUserConcerns(e.target.value)}
                />
              </div>
            )}

            <div className="ai-agent-banner">
              <div className="ai-agent-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
              </div>
              <div className="ai-agent-text">
                <strong>AI Concierge — Personalized Top 3 Matches:</strong>
                <span> Our AI reads your assessment scores &amp; finds the best-fit specialists for your mental health profile.</span>
              </div>
              <button className="btn btn-primary ai-book-btn" onClick={handleAIConcierge}>
                Find My Match →
              </button>
            </div>
          </div>

          <div className="app-hero-right-card">
            <img src="/appointment_therapy_bg.jpg" alt="Therapy Consultation Lounge" className="app-hero-img" />
            <div className="app-hero-card-overlay"></div>
            <div className="online-specialists-badge">
              <span className="live-dot"></span>
              <span>12 Specialists Online Now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Stepper ───────────────────────────────────────────────────── */}
      {currentStep !== 'confirmed' && (
        <div className="container">
          <div className="booking-stepper">
            {[
              { n: 1, label: 'Select Specialist' },
              { n: 2, label: 'Schedule' },
              { n: 3, label: 'Review & Send' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div
                  className={`step-item ${currentStep >= s.n ? 'active' : ''} ${currentStep > s.n ? 'completed' : ''}`}
                  onClick={() => s.n < (currentStep as number) && setCurrentStep(s.n as 1 | 2 | 3)}
                  style={{ cursor: s.n < (currentStep as number) ? 'pointer' : 'default' }}
                >
                  <div className="step-circle">
                    {(currentStep as number) > s.n ? '✓' : s.n}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="step-line"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <section className="appointment-main-section">
        <div className="container">

          {/* STEP 1: SELECT SPECIALIST */}
          {currentStep === 1 && (
            <div className="appointment-layout">
              {/* Left Sidebar Filters */}
              <aside className="filters-sidebar">
                <div className="sidebar-header">
                  <h3 className="sidebar-title">Refine Search</h3>
                  <button
                    className="clear-filters-btn"
                    onClick={() => { setSelectedSpecialties([]); setSelectedMode('All'); setSelectedCity('All'); }}
                  >
                    Reset
                  </button>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Specialty</h4>
                  {['Anxiety & Stress', 'Depression', 'Relationships', 'Trauma & PTSD', 'Sleep & Burnout'].map(spec => (
                    <label className="checkbox-label" key={spec}>
                      <input type="checkbox" checked={selectedSpecialties.includes(spec)} onChange={() => toggleSpecialty(spec)} />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Consultation Mode</h4>
                  <div className="radio-group">
                    {['All', 'In-Clinic', 'Video Consultation'].map(mode => (
                      <label className="radio-label" key={mode}>
                        <input type="radio" name="modeFilter" checked={selectedMode === mode} onChange={() => setSelectedMode(mode)} />
                        <span>{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Location / City</h4>
                  <select className="city-select" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                    <option value="All">All Cities across India</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </aside>

              {/* Right Directory */}
              <main className="directory-content">
                <div className="directory-header-row">
                  <div className="results-count">
                    <strong>{filteredDoctors.length} Verified Specialists</strong> available
                  </div>
                  <div className="auth-status-pill-wrapper">
                    {isLoggedIn ? (
                      <div className="logged-in-badge">
                        <span className="user-dot"></span>
                        <span>Welcome, {user?.firstName}</span>
                      </div>
                    ) : (
                      <button className="btn btn-primary auth-btn-compact" onClick={() => navigate('/login')}>
                        🔒 Login to Book
                      </button>
                    )}
                  </div>
                </div>

                {!isLoggedIn ? (
                  <div className="locked-directory-card">
                    <div className="lock-icon-circle">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#3f72af" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <h3 className="locked-title">Login to View &amp; Book Specialists</h3>
                    <p className="locked-desc">
                      Please login to your SoulSpace account to view doctor profiles, check live clinic slots,
                      and let our AI match you with the perfect specialist.
                    </p>
                    <button className="btn btn-primary locked-login-btn" onClick={() => navigate('/login')}>
                      🔒 Login to Unlock Specialists
                    </button>
                  </div>
                ) : (
                  <div className="doctors-list">
                    {filteredDoctors.map(doctor => (
                      <div className="doctor-card" key={doctor.id}>
                        <div className="doc-avatar-container">
                          <img src={doctor.image} alt={doctor.name} className="doc-avatar" />
                          <span className="verified-check" title="RCI & Medical Verified">✓</span>
                        </div>
                        <div className="doc-info-col">
                          <div className="doc-title-row">
                            <div>
                              <h3 className="doc-name">{doctor.name}</h3>
                              <p className="doc-qualifications">{doctor.qualification}</p>
                            </div>
                            <div className="doc-rating-badge">★ {doctor.rating} <span className="reviews-num">({doctor.reviewsCount})</span></div>
                          </div>
                          <div className="doc-specialties-tags">
                            {doctor.specialties.map(tag => <span className="spec-pill" key={tag}>{tag}</span>)}
                            <span className="exp-pill">{doctor.experience}</span>
                          </div>
                          <div className="doc-clinic-address">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3f72af" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <div>
                              <strong>{doctor.clinicName}</strong>
                              <p className="address-text">{doctor.address}</p>
                            </div>
                          </div>
                          {doctor.email && (
                            <div className="doc-email-row-badge">
                              <span className="doc-email-badge-icon">✉️</span>
                              <span className="doc-email-addr-text">Official: <strong>{doctor.email}</strong></span>
                              {doctor.email.endsWith('@soulspace.demo') ? (
                                <span className="doc-badge-pill demo-pill">Demo Mode</span>
                              ) : (
                                <span className="doc-badge-pill live-pill">Live Dispatch</span>
                              )}
                            </div>
                          )}
                          <div className="doc-footer-row">
                            <div className="slot-and-fee">
                              <div className="next-slot"><span className="slot-dot"></span> Next Slot: <strong>{doctor.nextAvailable}</strong></div>
                              <div className="consult-fee">{doctor.fee}</div>
                            </div>
                            <button className="btn btn-primary book-slot-btn" onClick={() => handleSelectDoctor(doctor)}>
                              Book Appointment →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </div>
          )}

          {/* STEP 2: SCHEDULE (Mode + Date + Time + Patient Info merged) */}
          {currentStep === 2 && selectedDoctor && (
            <div className="schedule-step-container">
              {selectedDoctor.isTopPick && (
                <div className="ai-top-pick-banner">
                  <span>🤖 AI Top Pick</span>
                  <span className="ai-match-pill">{selectedDoctor.matchScore}% Match</span>
                  {selectedDoctor.matchReason && <span className="ai-match-reason-small">{selectedDoctor.matchReason}</span>}
                </div>
              )}

              {/* Selected doctor summary */}
              <div className="selected-doc-summary-card">
                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="summary-doc-img" />
                <div>
                  <h3 className="summary-doc-name">{selectedDoctor.name}</h3>
                  <p className="summary-doc-title">{selectedDoctor.title}</p>
                  <p className="summary-doc-address">📍 {selectedDoctor.clinicName}, {selectedDoctor.address}</p>
                  <p className="summary-doc-email-line">✉️ Destination Email: <strong>{selectedDoctor.email}</strong></p>
                </div>
                <div className="summary-doc-fee">
                  <span>Fee</span>
                  <strong>{selectedDoctor.fee}</strong>
                </div>
              </div>

              <div className="schedule-card">
                {/* Mode */}
                <h3 className="schedule-card-title">Select Consultation Mode</h3>
                <div className="mode-toggle-group">
                  <button className={`mode-btn ${consultationMode === 'In-Clinic' ? 'active' : ''}`} onClick={() => setConsultationMode('In-Clinic')}>
                    🏥 In-Person at Clinic
                    <span className="mode-sub">{selectedDoctor.clinicName}</span>
                  </button>
                  <button className={`mode-btn ${consultationMode === 'Video Consultation' ? 'active' : ''}`} onClick={() => setConsultationMode('Video Consultation')}>
                    📹 Online Video Session
                    <span className="mode-sub">Encrypted Telehealth Room</span>
                  </button>
                </div>

                {/* Date Selection */}
                <h3 className="schedule-card-title" style={{ marginTop: '24px' }}>Preferred Date</h3>
                <div className="date-options-row">
                  {['Today (Earliest)', 'Tomorrow', 'This Weekend', 'Next Monday'].map(d => (
                    <button key={d} className={`date-chip ${selectedDate === d ? 'active' : ''}`} onClick={() => setSelectedDate(d)}>
                      {d}
                    </button>
                  ))}
                </div>

                {/* Time Selection */}
                <h3 className="schedule-card-title" style={{ marginTop: '24px' }}>Preferred Time Slot</h3>
                <div className="time-slot-grid">
                  {timeSlots.map(t => (
                    <button key={t} className={`time-chip ${selectedTime === t ? 'active' : ''}`} onClick={() => setSelectedTime(t)}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Patient Info */}
                <h3 className="schedule-card-title" style={{ marginTop: '28px' }}>Patient Details</h3>
                <div className="patient-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your full name"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>What would you like to discuss with the doctor? (Optional)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Having severe panic attacks since 2 weeks, trouble sleeping…"
                      value={userConcerns}
                      onChange={e => setUserConcerns(e.target.value)}
                    />
                  </div>
                </div>

                {/* Attach Assessment Report toggle */}
                <div className="attach-report-toggle" onClick={() => setAttachReport(!attachReport)}>
                  <div className={`checkbox-custom ${attachReport ? 'checked' : ''}`}>
                    {attachReport && '✓'}
                  </div>
                  <div>
                    <strong>Attach My Clinical Assessment Summary to Doctor's Email</strong>
                    <p>Includes your PHQ-9, GAD-7, or other screener scores so the doctor can prepare before your session.</p>
                  </div>
                </div>

                <div className="step-action-row">
                  <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                    ← Back to Specialists
                  </button>
                  <button
                    className="btn btn-primary step-next-btn"
                    onClick={() => setCurrentStep(3)}
                    disabled={!patientName.trim() || !patientPhone.trim()}
                  >
                    Review Before Sending →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SEND */}
          {currentStep === 3 && selectedDoctor && (
            <div className="details-step-container">
              <div className="booking-summary-header">
                <h2>Review Your Appointment Request</h2>
                <p>Here's exactly what our AI will send to <strong>{selectedDoctor.clinicName}</strong>. Confirm when ready.</p>
              </div>

              <div className="review-send-layout">

                {/* Email Preview Panel */}
                <div className="email-preview-panel">
                  <div className="email-preview-header">
                    <span className="email-preview-icon">📧</span>
                    <div>
                      <strong>Email Preview — Sent from SoulSpace AI</strong>
                      <p className="email-preview-meta">
                        <span>To: <em>{selectedDoctor.name}</em> at {selectedDoctor.clinicName}</span><br />
                        <span>From: <em>iamrevenent007@gmail.com</em> (SoulSpace AI Concierge)</span>
                      </p>
                    </div>
                  </div>

                  <div className="email-preview-body">
                    <div className="email-preview-subject">
                      📋 Subject: Appointment Request — {patientName} via SoulSpace AI
                    </div>
                    <div className="email-preview-content">
                      <p>Dear <strong>{selectedDoctor.name}</strong>,</p>
                      <p>
                        A patient has requested an appointment through the <strong>SoulSpace Mental Health Platform</strong>.
                        Here are their details:
                      </p>
                      <div className="email-detail-table">
                        <div className="email-detail-row"><span>Patient Name</span><strong>{patientName}</strong></div>
                        <div className="email-detail-row"><span>Phone</span><strong>{patientPhone}</strong></div>
                        <div className="email-detail-row"><span>Email</span><strong>{user?.email}</strong></div>
                        <div className="email-detail-row"><span>Preferred Date</span><strong>{selectedDate}</strong></div>
                        <div className="email-detail-row"><span>Preferred Time</span><strong>{selectedTime}</strong></div>
                        <div className="email-detail-row"><span>Mode</span><strong>{consultationMode}</strong></div>
                        {userConcerns && <div className="email-detail-row"><span>Concerns</span><strong>{userConcerns}</strong></div>}
                        {attachReport && <div className="email-detail-row"><span>Assessment Summary</span><strong>✓ Attached (PHQ-9 / GAD-7 scores)</strong></div>}
                        {selectedDoctor.matchScore && <div className="email-detail-row"><span>AI Match Score</span><strong>{selectedDoctor.matchScore}% match</strong></div>}
                      </div>
                      <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                        Please reply to this email to confirm or suggest an alternative slot. Your reply will be
                        AI-summarized and shown to the patient in their SoulSpace dashboard.
                      </p>
                    </div>
                  </div>

                  <button className="btn btn-outline edit-back-btn" onClick={() => setCurrentStep(2)}>
                    ← Edit Details
                  </button>
                </div>

                {/* Confirm Panel */}
                <div className="confirm-panel">
                  <h3 className="summary-title">Appointment Summary</h3>
                  <div className="summary-item"><span>Specialist</span><strong>{selectedDoctor.name}</strong></div>
                  <div className="summary-item"><span>Mode</span><strong>{consultationMode}</strong></div>
                  <div className="summary-item"><span>Date & Time</span><strong>{selectedDate}, {selectedTime}</strong></div>
                  <div className="summary-item"><span>Clinic</span><strong>{selectedDoctor.clinicName}</strong></div>
                  <div className="summary-divider"></div>
                  <div className="summary-total-row">
                    <span>Consultation Fee</span>
                    <span className="total-fee">{selectedDoctor.fee}</span>
                  </div>
                  {selectedDoctor.matchScore && (
                    <div className="summary-ai-match-badge">
                      <span>🤖 AI Match Score</span>
                      <span className="match-score-pill">{selectedDoctor.matchScore}%</span>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="payment-method-selector">
                    <label className="payment-selector-title">💳 Select Payment Method</label>
                    <div className="payment-options-grid">
                      <div
                        className={`payment-option-card ${paymentOption === 'razorpay' ? 'active' : ''}`}
                        onClick={() => setPaymentOption('razorpay')}
                      >
                        <div className="payment-radio">
                          <input type="radio" checked={paymentOption === 'razorpay'} onChange={() => setPaymentOption('razorpay')} />
                        </div>
                        <div className="payment-option-info">
                          <strong>Razorpay Instant Checkout</strong>
                          <p>UPI (GPay/PhonePe), Cards, NetBanking, Wallets</p>
                          <span className="secure-badge">🔒 256-Bit SSL Secured</span>
                        </div>
                      </div>

                      <div
                        className={`payment-option-card ${paymentOption === 'clinic' ? 'active' : ''}`}
                        onClick={() => setPaymentOption('clinic')}
                      >
                        <div className="payment-radio">
                          <input type="radio" checked={paymentOption === 'clinic'} onChange={() => setPaymentOption('clinic')} />
                        </div>
                        <div className="payment-option-info">
                          <strong>Pay at Clinic</strong>
                          <p>Settle consultation fee at clinic reception</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {bookingError && <div className="booking-error-msg">⚠️ {bookingError}</div>}

                  <button
                    className={`btn btn-primary confirm-submit-btn ${paymentOption === 'razorpay' ? 'btn-razorpay' : ''}`}
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    style={{ marginTop: '16px', width: '100%' }}
                  >
                    {isBooking ? (
                      <><span className="btn-spinner"></span> Processing…</>
                    ) : paymentOption === 'razorpay' ? (
                      `💳 Pay ${selectedDoctor.fee.split('/')[0].trim()} via Razorpay →`
                    ) : (
                      '🤖 Confirm Request (Pay at Clinic) →'
                    )}
                  </button>
                  <p className="confirm-disclaimer">
                    By confirming, our AI will email {selectedDoctor.clinicName} on your behalf.
                    You'll be notified when they reply.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* CONFIRMED STATE */}
          {currentStep === 'confirmed' && bookedAppointment && selectedDoctor && (
            <div className={`confirmed-receipt-card status-${appointmentStatus}`}>
              <div className={`success-icon-badge ${
                appointmentStatus === 'confirmed' ? 'status-confirmed-badge' :
                appointmentStatus === 'rejected' ? 'status-rejected-badge' :
                appointmentStatus === 'expired' ? 'status-expired-badge' :
                appointmentStatus === 'rescheduled' ? 'status-rescheduled-badge' :
                'status-pending-badge'
              }`}>
                {appointmentStatus === 'confirmed' ? '✓' :
                 appointmentStatus === 'rejected' ? '✕' :
                 appointmentStatus === 'rescheduled' ? '🔄' :
                 appointmentStatus === 'expired' ? '⌛' : '⏳'}
              </div>
              <h2 className="confirmed-title">
                {appointmentStatus === 'confirmed'
                  ? '🎉 Appointment Confirmed!'
                  : appointmentStatus === 'rejected'
                  ? '❌ Requested Slot Unavailable (No Slots Left)'
                  : appointmentStatus === 'rescheduled'
                  ? '🔄 Alternative Slot Proposed by Clinic'
                  : appointmentStatus === 'expired'
                  ? '⏳ Request Expired (24-Hour SLA Window)'
                  : '⏳ Appointment Request Sent — Pending Confirmation'}
              </h2>
              <p className="confirmed-desc">
                {appointmentStatus === 'confirmed'
                  ? <>Dr. <strong>{selectedDoctor.name}</strong> ({selectedDoctor.clinicName}) has confirmed your appointment for <strong>{selectedDate} at {selectedTime}</strong>.</>
                  : appointmentStatus === 'rejected'
                  ? <>Dr. <strong>{selectedDoctor.name}</strong> is currently fully booked for this time window. We recommend choosing an alternative date or picking another top-matched specialist below.</>
                  : appointmentStatus === 'rescheduled'
                  ? <>The clinic has suggested an alternative consultation time. Please review the AI summary below.</>
                  : appointmentStatus === 'expired'
                  ? <>No response was received from <strong>{selectedDoctor.clinicName}</strong> within the 24-hour SLA window. Your request has been automatically suspended to save your time.</>
                  : isDummyDoctor
                  ? <>This doctor is in <strong>demo mode</strong> — request is stored in pending status for demonstration.</>
                  : <>Your appointment is currently <strong>Pending Confirmation</strong>. Our AI Agent has emailed <strong>{selectedDoctor.clinicName}</strong> on your behalf (24-Hour Response SLA). Once the doctor confirms, this screen and your profile will automatically update to <strong>Confirmed</strong>.</>
                }
              </p>

              {/* Payment Receipt Banner */}
              <div className={`receipt-payment-banner ${paymentStatus === 'paid' ? 'paid-banner' : 'clinic-banner'}`}>
                {paymentStatus === 'paid' ? (
                  <>
                    <div className="pay-badge-icon">💳</div>
                    <div className="pay-badge-info">
                      <strong>Razorpay Payment Verified: Paid Successfully</strong>
                      <p>Payment ID: <code className="pay-id-code">{paymentId || 'pay_test_verified'}</code> · Amount: ₹{amountPaid || selectedDoctor.fee.replace(/\D/g, '')} INR (Authorized via Razorpay Gateway)</p>
                    </div>
                    <span className="pay-verified-pill">✓ VERIFIED</span>
                  </>
                ) : (
                  <>
                    <div className="pay-badge-icon">🏥</div>
                    <div className="pay-badge-info">
                      <strong>Payment Mode: Pay at Clinic</strong>
                      <p>Consultation fee of <strong>{selectedDoctor.fee}</strong> can be settled at the clinic counter upon arrival.</p>
                    </div>
                    <span className="pay-pending-pill">PAY ON ARRIVAL</span>
                  </>
                )}
              </div>

              {/* Email Status Timeline */}
              <div className="email-timeline">

                <div className="email-timeline-title">📬 Email Status Tracker</div>
                <div className="timeline-steps">
                  <div className="t-step done">
                    <div className="t-dot done"></div>
                    <div className="t-content">
                      <strong>Appointment Request</strong>
                      <span>{isDummyDoctor ? '⚪ Demo mode — no real email' : `AI Agent emailed ${selectedDoctor.clinicName}`}</span>
                    </div>
                  </div>
                  <div className="t-line"></div>
                  <div className={`t-step ${isDummyDoctor ? '' : 'done'}`}>
                    <div className={`t-dot ${isDummyDoctor ? '' : 'done'}`}></div>
                    <div className="t-content">
                      <strong>Confirmation to You</strong>
                      <span>{isDummyDoctor ? '⚪ Skipped (demo mode)' : `Check your inbox: ${user?.email}`}</span>
                    </div>
                  </div>
                  <div className="t-line"></div>
                  <div className={`t-step ${clinicReplySummary ? 'done' : 'pending'}`}>
                    <div className={`t-dot ${clinicReplySummary ? 'done' : 'pending'}`}></div>
                    <div className="t-content">
                      <strong>Clinic Reply / SLA</strong>
                      <span>{clinicReplySummary
                        ? (appointmentStatus === 'confirmed' ? '✅ Confirmed!' :
                           appointmentStatus === 'rejected' ? '❌ No Slots Left' :
                           appointmentStatus === 'expired' ? '⏳ 24h SLA Expired' : '🔄 Rescheduled')
                        : 'Awaiting clinic response (24h SLA)…'
                      }</span>
                    </div>
                  </div>
                </div>

                {/* Ethereal preview link (demo) */}
                {bookedAppointment.emailPreviewUrl && (
                  <div className="email-preview-link">
                    <span>🔗 Demo: </span>
                    <a href={bookedAppointment.emailPreviewUrl} target="_blank" rel="noopener noreferrer">
                      View sent email in Ethereal →
                    </a>
                  </div>
                )}
              </div>

              {/* Live auto-check indicator + Simulation Bar for Testing/Judges */}
              {!clinicReplySummary && (
                <div className="live-poll-section">
                  <div className="live-poll-indicator">
                    <span className="live-poll-dot"></span>
                    <span>
                      <strong>Auto-checking for clinic reply… (24h SLA Window)</strong>
                      <br />
                      <small>When {selectedDoctor.clinicName} replies via email, it will appear here automatically.</small>
                    </span>
                  </div>

                  {/* Demo simulation toolbar */}
                  <div className="demo-simulation-toolbar">
                    <p className="demo-sim-label">⚡ Demo Simulation Shortcuts (Test All Clinic Outcomes):</p>
                    <div className="demo-sim-buttons">
                      <button
                        className="demo-sim-btn btn-sim-confirm"
                        onClick={() => handleSimulateReply('confirmed')}
                        disabled={isSimulatingReply}
                      >
                        ✅ Simulate Confirmed
                      </button>
                      <button
                        className="demo-sim-btn btn-sim-reject"
                        onClick={() => handleSimulateReply('rejected')}
                        disabled={isSimulatingReply}
                      >
                        ❌ Simulate Declined (No Slots)
                      </button>
                      <button
                        className="demo-sim-btn btn-sim-resched"
                        onClick={() => handleSimulateReply('rescheduled')}
                        disabled={isSimulatingReply}
                      >
                        🔄 Simulate Reschedule
                      </button>
                      <button
                        className="demo-sim-btn btn-sim-expire"
                        onClick={() => handleSimulateReply('expired')}
                        disabled={isSimulatingReply}
                      >
                        ⏳ Simulate 24h Expiry
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI-Summarized Clinic Reply */}
              {clinicReplySummary && (
                <div className={`clinic-reply-card ${appointmentStatus}`}>
                  <div className="clinic-reply-header">
                    <div className="clinic-reply-icon">🤖</div>
                    <div>
                      <strong>AI Summary of Clinic Decision</strong>
                      <span className={`reply-status-pill pill-${appointmentStatus}`}>
                        {appointmentStatus === 'confirmed' ? '✅ Confirmed' :
                         appointmentStatus === 'rejected' ? '❌ No Slots Left' :
                         appointmentStatus === 'expired' ? '⏳ Expired (24h)' : '🔄 Rescheduled'}
                      </span>
                    </div>
                  </div>
                  <div className="clinic-reply-summary-text">
                    {clinicReplySummary.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  {clinicReplyRaw && (
                    <>
                      <button className="show-raw-btn" onClick={() => setShowRawReply(!showRawReply)}>
                        {showRawReply ? '▲ Hide' : '▼ Show'} raw clinic email
                      </button>
                      {showRawReply && (
                        <pre className="raw-reply-text">{clinicReplyRaw}</pre>
                      )}
                    </>
                  )}
                </div>
              )}


              {/* Booking Details */}
              <div className="receipt-details-box">
                <div className="receipt-row"><span>Booking Reference:</span><strong>#{bookingRef}</strong></div>
                <div className="receipt-row"><span>Specialist:</span><strong>{selectedDoctor.name}</strong></div>
                <div className="receipt-row"><span>Scheduled:</span><strong>{selectedDate}, {selectedTime}</strong></div>
                <div className="receipt-row"><span>Consultation Mode:</span><strong>{consultationMode}</strong></div>
                <div className="receipt-row"><span>Location:</span><strong>{selectedDoctor.clinicName}, {selectedDoctor.address}</strong></div>
                {attachReport && (
                  <div className="receipt-row">
                    <span>Assessment:</span>
                    <strong className="report-submitted-tag">✓ Summary Attached to Clinic Email</strong>
                  </div>
                )}
              </div>

              <div className="confirmed-actions">
                <button className="btn btn-invoice-btn" onClick={() => setShowInvoiceModal(true)}>
                  📄 Download Official Tax Invoice / Receipt
                </button>
                <button className="btn btn-outline" onClick={resetAll}>
                  Book Another Appointment
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                  View in Profile →
                </button>
              </div>
            </div>
          )}


        </div>
      </section>

      {/* ── AI Concierge Modal ──────────────────────────────────────────────── */}
      {showAiModal && (
        <div className="ai-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAiModal(false); }}>
          <div className="ai-modal">
            <button className="ai-modal-close" onClick={() => setShowAiModal(false)}>✕</button>

            <div className="ai-modal-header">
              <div className="ai-modal-brain-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#3f72af" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
              </div>
              <div>
                <h2 className="ai-modal-title">AI Concierge</h2>
                <p className="ai-modal-subtitle">Personalized Top 3 Therapist Recommendations</p>
              </div>
            </div>

            {/* Loading */}
            {aiLoading && (
              <div className="ai-loading-container">
                <div className="ai-loading-orb">
                  <div className="ai-orb-pulse"></div>
                  <div className="ai-orb-inner">🤖</div>
                </div>
                <div className="ai-loading-steps">
                  {AI_LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`ai-loading-step ${i <= aiLoadingStep ? 'active' : ''} ${i < aiLoadingStep ? 'done' : ''}`}>
                      <span className="ai-step-dot">{i < aiLoadingStep ? '✓' : i === aiLoadingStep ? '◉' : '○'}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {aiError && !aiLoading && (
              <div className="ai-error-box">
                <p>⚠️ {aiError}</p>
                <button className="btn btn-primary" onClick={handleAIConcierge}>Try Again</button>
              </div>
            )}

            {/* Recommendations */}
            {!aiLoading && !aiError && aiRecommendations.length > 0 && (
              <div className="ai-recommendations-list">
                <p className="ai-recs-subtitle">Based on your profile &amp; assessment history, here are your top matches:</p>
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`ai-rec-card ${rec.isTopPick ? 'top-pick' : ''}`}>
                    {rec.isTopPick && <div className="top-pick-badge">⭐ Best Match</div>}

                    <div className="ai-rec-header">
                      <img src={rec.image} alt={rec.name} className="ai-rec-avatar" />
                      <div className="ai-rec-info">
                        <h3>{rec.name}</h3>
                        <p>{rec.title}</p>
                        <p className="ai-rec-clinic">📍 {rec.clinicName}, {rec.city}</p>
                      </div>
                      <div className="ai-match-score-circle">
                        <svg viewBox="0 0 36 36" className="match-donut">
                          <circle className="donut-ring" cx="18" cy="18" r="15" fill="none" strokeWidth="3" />
                          <circle
                            className="donut-segment"
                            cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                            strokeDasharray={`${(rec.matchScore || 0) * 0.94} 94`}
                            strokeDashoffset="23.5"
                          />
                        </svg>
                        <div className="match-score-text">{rec.matchScore}%</div>
                      </div>
                    </div>

                    <div className="ai-rec-reason">
                      <span className="reason-label">🤖 Why this match:</span>
                      <p>{rec.matchReason}</p>
                    </div>

                    {rec.specialtyHighlight && (
                      <div className="ai-rec-specialty-highlight">
                        <span>Key specialty for you:</span>
                        <span className="specialty-chip">{rec.specialtyHighlight}</span>
                      </div>
                    )}

                    <div className="ai-rec-footer">
                      <div className="ai-rec-meta">
                        <span>★ {rec.rating} ({rec.reviewsCount} reviews)</span>
                        <span>{rec.experience}</span>
                        <span>{rec.fee}</span>
                      </div>
                      <button
                        className={`btn ${rec.isTopPick ? 'btn-primary' : 'btn-outline'} ai-select-btn`}
                        onClick={() => handleSelectAiRecommendation(rec)}
                      >
                        {rec.isTopPick ? 'Select Top Match →' : `Select Dr. ${rec.name.split(' ').slice(-1)[0]}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Official Tax Invoice Modal ────────────────────────────────────── */}
      {selectedDoctor && (

        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          data={{
            bookingRef: bookingRef || bookedAppointment?.bookingRef || 'SSAI-DEMO-2026',
            doctorName: selectedDoctor.name,
            doctorTitle: selectedDoctor.title,
            qualification: selectedDoctor.qualification,
            clinicName: selectedDoctor.clinicName,
            clinicAddress: selectedDoctor.address,
            clinicPhone: (selectedDoctor as any).phone,
            patientName: patientName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Patient',
            patientEmail: user?.email || 'patient@soulspace.app',
            patientPhone: patientPhone || user?.phone,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            consultationMode: consultationMode,
            fee: selectedDoctor.fee,
            paymentStatus: (paymentStatus as 'paid' | 'pending') || 'pending',
            paymentId: paymentId,
            paymentMethod: paymentOption === 'razorpay' ? 'Razorpay Online Gateway (UPI / Cards / NetBanking)' : 'Pay at Clinic',
          }}
        />
      )}
    </div>
  );
};


export default Appointment;
