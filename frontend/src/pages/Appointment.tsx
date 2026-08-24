import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Appointment.css';

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
}

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
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
    image: 'https://images.unsplash.com/photo-1594824813686-7a1a8c9b9173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
];

const timeSlots = [
  '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM', '07:30 PM'
];

const Appointment: React.FC = () => {
  const navigate = useNavigate();
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Stepper state (1: Select, 2: Schedule, 3: Details, 4: Confirmed)
  const [currentStep, setCurrentStep] = useState(1);

  // Filters state
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Anxiety & Stress']);
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Booking selection state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('Today (Earliest)');
  const [selectedTime, setSelectedTime] = useState('04:30 PM');
  const [consultationMode, setConsultationMode] = useState<'In-Clinic' | 'Video Consultation'>('In-Clinic');
  const [patientName, setPatientName] = useState('Faizaan Khan');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [attachReport, setAttachReport] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // AI 1-Click Match Modal
  const [isAiMatching, setIsAiMatching] = useState(false);

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const filteredDoctors = doctorsData.filter(doc => {
    // Specialty filter (matches any selected)
    const matchesSpec = selectedSpecialties.length === 0 || 
      selectedSpecialties.some(s => doc.specialties.includes(s));
    
    // Mode filter
    const matchesMode = selectedMode === 'All' || doc.modes.includes(selectedMode as any);

    // City filter
    const matchesCity = selectedCity === 'All' || doc.city === selectedCity;

    return matchesSpec && matchesMode && matchesCity;
  });

  const handleSelectDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setSelectedDoctor(doctor);
    setCurrentStep(2);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleAiAutoBook = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsAiMatching(true);
    setTimeout(() => {
      setIsAiMatching(false);
      const topMatch = doctorsData[0];
      setSelectedDoctor(topMatch);
      setSelectedDate('Today (Earliest Available)');
      setSelectedTime('04:30 PM');
      setCurrentStep(3);
    }, 1200);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentStep(1);
    setSelectedDoctor(null);
    setBookingConfirmed(false);
  };

  return (
    <div className="appointment-page">
      {/* Hero Header Section */}
      <section className="app-hero">
        <div className="container app-hero-container">
          <div className="app-hero-left">
            <h1 className="app-hero-title">Book Your Serenity</h1>
            <p className="app-hero-subtitle">
              Find the right therapist for your journey. A safe space for your mind to bloom, curated with empathy and professional expertise.
            </p>

            {/* AI 1-Click Scheduling Badge */}
            <div className="ai-agent-banner">
              <div className="ai-agent-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                  <path d="M13 13l6 6"></path>
                </svg>
              </div>
              <div className="ai-agent-text">
                <strong>1-Click AI Agent Auto-Booking:</strong>
                <span> Our AI packages your assessment scores & secures the earliest optimal slot with verified clinical experts.</span>
              </div>
              <button className="btn btn-primary ai-book-btn" onClick={handleAiAutoBook}>
                {isAiMatching ? 'Matching Specialist...' : 'AI Auto-Book Now →'}
              </button>
            </div>
          </div>

          {/* Right Header Visual Card */}
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

      {/* Stepper Navigation */}
      <div className="container">
        <div className="booking-stepper">
          <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} onClick={() => setCurrentStep(1)}>
            <div className="step-circle">1</div>
            <span className="step-label">Select Specialist</span>
          </div>
          <div className="step-line"></div>

          <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`} onClick={() => selectedDoctor && setCurrentStep(2)}>
            <div className="step-circle">2</div>
            <span className="step-label">Schedule Slot</span>
          </div>
          <div className="step-line"></div>

          <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`} onClick={() => selectedDoctor && setCurrentStep(3)}>
            <div className="step-circle">3</div>
            <span className="step-label">Details & Confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
                    onClick={() => {
                      setSelectedSpecialties([]);
                      setSelectedMode('All');
                      setSelectedCity('All');
                    }}
                  >
                    Reset
                  </button>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Specialty</h4>
                  {['Anxiety & Stress', 'Depression', 'Relationships', 'Trauma & PTSD', 'Sleep & Burnout'].map(spec => (
                    <label className="checkbox-label" key={spec}>
                      <input 
                        type="checkbox" 
                        checked={selectedSpecialties.includes(spec)}
                        onChange={() => toggleSpecialty(spec)}
                      />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Consultation Mode</h4>
                  <div className="radio-group">
                    {['All', 'In-Clinic', 'Video Consultation'].map(mode => (
                      <label className="radio-label" key={mode}>
                        <input 
                          type="radio" 
                          name="modeFilter" 
                          checked={selectedMode === mode}
                          onChange={() => setSelectedMode(mode)}
                        />
                        <span>{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-group-title">Location / City</h4>
                  <select 
                    className="city-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="All">All Cities across India</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </aside>

              {/* Right Content / Doctor Directory */}
              <main className="directory-content">
                <div className="directory-header-row">
                  <div className="results-count">
                    <strong>{filteredDoctors.length} Verified Specialists</strong> available
                  </div>

                  {/* Auth Status Pill */}
                  <div className="auth-status-pill-wrapper">
                    {isLoggedIn ? (
                      <div className="logged-in-badge">
                        <span className="user-dot"></span>
                        <span>Logged In (User)</span>
                        <button className="logout-link" onClick={handleLogout}>Log Out</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary auth-btn-compact" onClick={() => navigate('/login')}>
                        🔒 Login to Book
                      </button>
                    )}
                  </div>
                </div>

                {/* If Not Logged In -> Show Locked Message Banner */}
                {!isLoggedIn ? (
                  <div className="locked-directory-card">
                    <div className="lock-icon-circle">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#3f72af" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <h3 className="locked-title">Login Required to View & Book Specialists</h3>
                    <p className="locked-desc">
                      Please login to your SoulSpace AI account to view doctor profiles, check live clinic slots, and schedule consultations.
                    </p>
                    <button className="btn btn-primary locked-login-btn" onClick={() => navigate('/login')}>
                      🔒 Login to Unlock Specialists
                    </button>
                  </div>
                ) : (
                  /* Doctor Cards List */
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
                            <div className="doc-rating-badge">
                              ★ {doctor.rating} <span className="reviews-num">({doctor.reviewsCount})</span>
                            </div>
                          </div>

                          <div className="doc-specialties-tags">
                            {doctor.specialties.map(tag => (
                              <span className="spec-pill" key={tag}>{tag}</span>
                            ))}
                            <span className="exp-pill">{doctor.experience}</span>
                          </div>

                          {/* Clinic Address & Details */}
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

                          {/* Bottom Row: Next Available Slot, Fee, and Action Buttons */}
                          <div className="doc-footer-row">
                            <div className="slot-and-fee">
                              <div className="next-slot">
                                <span className="slot-dot"></span> Next Slot: <strong>{doctor.nextAvailable}</strong>
                              </div>
                              <div className="consult-fee">{doctor.fee}</div>
                            </div>

                            <button 
                              className="btn btn-primary book-slot-btn"
                              onClick={() => handleSelectDoctor(doctor)}
                            >
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

          {/* STEP 2: SCHEDULE SLOT */}
          {currentStep === 2 && selectedDoctor && (
            <div className="schedule-step-container">
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
                <h3 className="schedule-card-title">Select Consultation Mode & Date</h3>

                {/* Consultation Mode Toggle */}
                <div className="mode-toggle-group">
                  <button 
                    className={`mode-btn ${consultationMode === 'In-Clinic' ? 'active' : ''}`}
                    onClick={() => setConsultationMode('In-Clinic')}
                  >
                    🏥 In-Person at Clinic
                    <span className="mode-sub">{selectedDoctor.clinicName}</span>
                  </button>
                  <button 
                    className={`mode-btn ${consultationMode === 'Video Consultation' ? 'active' : ''}`}
                    onClick={() => setConsultationMode('Video Consultation')}
                  >
                    📹 Online Video Session
                    <span className="mode-sub">Encrypted Telehealth Room</span>
                  </button>
                </div>

                {/* Date Picker Buttons */}
                <h4 className="slots-heading">Available Dates</h4>
                <div className="dates-row">
                  {['Today (Earliest)', 'Tomorrow', 'Day After Tomorrow'].map((d) => (
                    <button 
                      key={d}
                      className={`date-btn ${selectedDate === d ? 'active' : ''}`}
                      onClick={() => setSelectedDate(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Time Slots Grid */}
                <h4 className="slots-heading">Select Time Slot</h4>
                <div className="time-slots-grid">
                  {timeSlots.map(time => (
                    <button 
                      key={time}
                      className={`time-slot-btn ${selectedTime === time ? 'active' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <div className="schedule-actions-row">
                  <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                    ← Change Specialist
                  </button>
                  <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                    Continue to Details & Report →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS & REPORT CONFIRMATION */}
          {currentStep === 3 && selectedDoctor && !bookingConfirmed && (
            <div className="details-step-container">
              <div className="booking-summary-header">
                <h2>Confirm Appointment Details</h2>
                <p>Review your booking summary and confidential AI report submission.</p>
              </div>

              <div className="details-grid-layout">
                {/* Form column */}
                <form className="patient-details-form" onSubmit={handleConfirmBooking}>
                  <h3 className="form-section-title">Patient Contact Information</h3>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={patientName} 
                        onChange={(e) => setPatientName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        value={patientPhone} 
                        onChange={(e) => setPatientPhone(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  {/* AI Assessment Report Attachment */}
                  <div className="ai-report-attachment-box">
                    <label className="ai-report-checkbox">
                      <input 
                        type="checkbox" 
                        checked={attachReport} 
                        onChange={(e) => setAttachReport(e.target.checked)} 
                      />
                      <div>
                        <strong>Attach SoulSpace AI Assessment Summary</strong>
                        <p>Submits your confidential screener scores (e.g. PHQ-9, GAD-7) to {selectedDoctor.name} in advance for a more personalized consultation.</p>
                      </div>
                    </label>
                  </div>

                  <div className="form-actions-row">
                    <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                      ← Back to Schedule
                    </button>
                    <button type="submit" className="btn btn-primary confirm-submit-btn">
                      Confirm & Reserve Appointment
                    </button>
                  </div>
                </form>

                {/* Right Summary Card */}
                <div className="order-summary-card">
                  <h3 className="summary-title">Appointment Summary</h3>
                  <div className="summary-item">
                    <span>Specialist</span>
                    <strong>{selectedDoctor.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Mode</span>
                    <strong>{consultationMode}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Date & Time</span>
                    <strong>{selectedDate}, {selectedTime}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Clinic Address</span>
                    <strong className="summary-address-text">{selectedDoctor.address}</strong>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-total-row">
                    <span>Consultation Fee</span>
                    <span className="total-fee">{selectedDoctor.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKING CONFIRMED RECEIPT VIEW */}
          {bookingConfirmed && selectedDoctor && (
            <div className="confirmed-receipt-card">
              <div className="success-icon-badge">✓</div>
              <h2 className="confirmed-title">Appointment Successfully Reserved!</h2>
              <p className="confirmed-desc">
                Your consultation with <strong>{selectedDoctor.name}</strong> is confirmed. A calendar invite and WhatsApp reminder have been dispatched.
              </p>

              <div className="receipt-details-box">
                <div className="receipt-row">
                  <span>Booking Reference:</span>
                  <strong>#SSAI-{Math.floor(100000 + Math.random() * 900000)}</strong>
                </div>
                <div className="receipt-row">
                  <span>Scheduled Time:</span>
                  <strong>{selectedDate}, {selectedTime}</strong>
                </div>
                <div className="receipt-row">
                  <span>Consultation Mode:</span>
                  <strong>{consultationMode}</strong>
                </div>
                <div className="receipt-row">
                  <span>Clinic Location:</span>
                  <strong>{selectedDoctor.clinicName}, {selectedDoctor.address}</strong>
                </div>
                {attachReport && (
                  <div className="receipt-row">
                    <span>AI Report Status:</span>
                    <strong className="report-submitted-tag">✓ Assessment Summary Delivered to Specialist</strong>
                  </div>
                )}
              </div>

              <div className="confirmed-actions">
                <button className="btn btn-outline" onClick={() => {
                  setBookingConfirmed(false);
                  setCurrentStep(1);
                }}>
                  Book Another Appointment
                </button>
                <a href="#home" className="btn btn-primary" onClick={() => window.location.href = '/'}>
                  Return to Home
                </a>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default Appointment;
