import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
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

// ─── Component ────────────────────────────────────────────────────────────────
const Appointment: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();

  // Stepper: 1=Select, 2=Schedule, 3=Review & Send  | 'confirmed'=success state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 'confirmed'>(1);

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

  // ─── Book Appointment ──────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
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
        }),
      });
      const data = await res.json();

      if (data.success) {
        const ref = data.appointment.bookingRef || `SSAI-${Date.now().toString(36).toUpperCase()}`;
        setBookingRef(ref);
        setBookedAppointment(data.appointment);
        setAppointmentStatus(data.appointment.status || 'request_sent');
        setIsDummyDoctor(data.appointment.status === 'demo_no_email');
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

  // ─── Simulate Clinic Reply ─────────────────────────────────────────────────
  const handleSimulateReply = async () => {
    if (!bookedAppointment?._id) return;
    setIsSimulatingReply(true);
    try {
      const res = await fetch(`${API_URL}/appointments/${bookedAppointment._id}/simulate-reply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setClinicReplySummary(data.clinicReplySummary);
        setClinicReplyRaw(data.clinicReplyRaw);
        setAppointmentStatus(data.status);

        // Update profile notification with confirmed status
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

                {/* Date */}
                <h4 className="slots-heading">Select Date</h4>
                <div className="dates-row">
                  {['Today (Earliest)', 'Tomorrow', 'Day After Tomorrow'].map(d => (
                    <button key={d} className={`date-btn ${selectedDate === d ? 'active' : ''}`} onClick={() => setSelectedDate(d)}>{d}</button>
                  ))}
                </div>

                {/* Time */}
                <h4 className="slots-heading">Select Time Slot</h4>
                <div className="time-slots-grid">
                  {timeSlots.map(time => (
                    <button key={time} className={`time-slot-btn ${selectedTime === time ? 'active' : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>
                  ))}
                </div>

                {/* Patient Details (prefilled) */}
                <h4 className="slots-heading" style={{ marginTop: '28px' }}>Your Contact Details</h4>
                <div className="schedule-patient-fields">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-field form-field-full">
                    <label>Email (pre-filled from account)</label>
                    <input type="email" value={user?.email || ''} readOnly className="readonly-input" />
                  </div>

                  {/* Attach report toggle */}
                  <div className="ai-report-attachment-box" style={{ marginTop: '12px' }}>
                    <label className="ai-report-checkbox">
                      <input type="checkbox" checked={attachReport} onChange={e => setAttachReport(e.target.checked)} />
                      <div>
                        <strong>Attach Assessment Summary to Email</strong>
                        <p>Sends your PHQ-9/GAD-7 scores to {selectedDoctor.name} for a more personalized session.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="schedule-actions-row">
                  <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>← Change Specialist</button>
                  <button
                    className="btn btn-primary"
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

                  {bookingError && <div className="booking-error-msg">⚠️ {bookingError}</div>}

                  <button
                    className="btn btn-primary confirm-submit-btn"
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    style={{ marginTop: '24px', width: '100%' }}
                  >
                    {isBooking ? (
                      <><span className="btn-spinner"></span> Sending Appointment Request…</>
                    ) : (
                      '🤖 Confirm & Send Email →'
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
            <div className="confirmed-receipt-card">
              <div className="success-icon-badge">✓</div>
              <h2 className="confirmed-title">
                {isDummyDoctor ? 'Appointment Booked! (Demo Mode)' : 'Appointment Request Sent!'}
              </h2>
              <p className="confirmed-desc">
                {isDummyDoctor
                  ? <>This doctor is in <strong>demo mode</strong> — no real email was sent. Your booking is saved. You can use this to demonstrate the flow.</>
                  : <>Our AI Agent has emailed <strong>{selectedDoctor.clinicName}</strong> on your behalf. You'll see a reply summary here once the clinic responds.</>
                }
              </p>

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
                      <strong>Clinic Reply</strong>
                      <span>{clinicReplySummary
                        ? (appointmentStatus === 'confirmed' ? '✅ Confirmed!' : '🔄 Rescheduled')
                        : 'Awaiting clinic response…'
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

              {/* Live auto-check indicator + Simulate fallback */}
              {!clinicReplySummary && (
                <div className="live-poll-section">
                  <div className="live-poll-indicator">
                    <span className="live-poll-dot"></span>
                    <span>
                      <strong>Auto-checking for clinic reply…</strong>
                      <br />
                      <small>When {selectedDoctor.clinicName} replies to the email, it will appear here automatically.</small>
                    </span>
                  </div>
                  <button
                    className="btn btn-outline simulate-reply-btn"
                    onClick={handleSimulateReply}
                    disabled={isSimulatingReply}
                    style={{ marginTop: '12px' }}
                  >
                    {isSimulatingReply ? (
                      <><span className="btn-spinner"></span> AI Summarizing Clinic Reply…</>
                    ) : (
                      '📥 Simulate Clinic Reply (Demo — don\'t wait)'
                    )}
                  </button>
                </div>
              )}


              {/* AI-Summarized Clinic Reply */}
              {clinicReplySummary && (
                <div className={`clinic-reply-card ${appointmentStatus === 'confirmed' ? 'confirmed' : 'rescheduled'}`}>
                  <div className="clinic-reply-header">
                    <div className="clinic-reply-icon">🤖</div>
                    <div>
                      <strong>AI Summary of Clinic Reply</strong>
                      <span className="reply-status-pill">{appointmentStatus === 'confirmed' ? '✅ Confirmed' : '🔄 Rescheduled'}</span>
                    </div>
                  </div>
                  <div className="clinic-reply-summary-text">
                    {clinicReplySummary.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <button className="show-raw-btn" onClick={() => setShowRawReply(!showRawReply)}>
                    {showRawReply ? '▲ Hide' : '▼ Show'} raw clinic email
                  </button>
                  {showRawReply && (
                    <pre className="raw-reply-text">{clinicReplyRaw}</pre>
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
    </div>
  );
};

export default Appointment;
