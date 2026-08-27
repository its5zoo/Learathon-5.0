import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClinicalReportModal from '../components/ClinicalReport/ClinicalReportModal';
import InvoiceModal from '../components/InvoiceModal/InvoiceModal';
import { API_URL } from '../config';
import './Profile.css';


interface AppointmentRecord {
  _id: string;
  doctorName: string;
  doctorTitle?: string;
  clinicName: string;
  date: string;
  time: string;
  mode: string;
  status: string;
  aiMatchScore?: number;
  aiMatchReason?: string;
  attachedAssessment?: boolean;
  assessmentSummary?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, isLoggedIn, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'assessments' | 'mood' | 'appointments' | 'settings'>('assessments');
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Clinical Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Appointment notification from localStorage
  const [latestAppt, setLatestAppt] = useState<any>(null);
  const [showApptNotif, setShowApptNotif] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);


  useEffect(() => {
    try {
      const stored = localStorage.getItem('ss_latest_appointment');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Show banner only if booked in last 24h
        const bookedAt = new Date(parsed.bookedAt).getTime();
        const now = Date.now();
        if (now - bookedAt < 24 * 60 * 60 * 1000) {
          setLatestAppt(parsed);
          setShowApptNotif(true);
        }
      }
    } catch {}
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Refresh user data & fetch appointments
  useEffect(() => {
    if (isLoggedIn) {
      refreshUser();
      fetchUserAppointments();
    }
  }, [isLoggedIn]);

  // Sync edit form with user data
  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setEditUsername(user.username || (user.email ? user.email.split('@')[0] : ''));
      setEditPhone(user.phone || '');
      setEditBio(user.bio || '');
      setEditEmergencyName(user.emergencyContact?.name || '');
      setEditEmergencyPhone(user.emergencyContact?.phone || '');
      setEditEmergencyRelation(user.emergencyContact?.relation || '');
    }
  }, [user]);

  // Fetch appointments from API
  const fetchUserAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const token = localStorage.getItem('ss_token');
      const res = await fetch(`${API_URL}/appointments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.warn('Could not fetch appointments from API:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyHandle = () => {
    const handle = `@${user?.username || (user?.email ? user.email.split('@')[0] : 'user')}`;
    navigator.clipboard.writeText(handle);
    setCopiedHandle(true);
    showToast(`Copied handle ${handle} to clipboard!`);
    setTimeout(() => setCopiedHandle(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProfile({
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername,
        phone: editPhone,
        bio: editBio,
        emergencyContact: {
          name: editEmergencyName,
          phone: editEmergencyPhone,
          relation: editEmergencyRelation,
        },
      });

      if (res.success) {
        setIsEditModalOpen(false);
        showToast('✨ Profile details updated successfully!');
      } else {
        showToast(`⚠️ ${res.message}`);
      }
    } catch {
      showToast('❌ Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading-screen">
        <div className="profile-spinner"></div>
        <p>Loading your SoulSpace profile…</p>
      </div>
    );
  }

  // Get Initials & Handle
  const initials = `${user.firstName?.[0] || 'S'}${user.lastName?.[0] || 'S'}`.toUpperCase();
  const userHandle = user.username ? `@${user.username}` : `@${user.email.split('@')[0]}`;

  // Gather assessment list from user profile or fallback
  const assessments = user.assessmentResults && user.assessmentResults.length > 0
    ? user.assessmentResults
    : (() => {
        try {
          const local = localStorage.getItem('ss_assessment_history');
          return local ? JSON.parse(local) : [];
        } catch {
          return [];
        }
      })();

  // Gather mood logs from user profile or fallback
  const moodLogs = user.moodLogs && user.moodLogs.length > 0
    ? user.moodLogs
    : [
        {
          mood: 'Happy',
          level: 6,
          emoji: '😄',
          type: 'AI Facial Scan',
          confidence: '94%',
          note: 'Felt positive and energized after morning meditation.',
          date: '24 Aug',
          time: '10:30 AM',
        },
        {
          mood: 'Neutral',
          level: 5,
          emoji: '😐',
          type: 'Manual Selection',
          note: 'Balanced work day with calm headspace.',
          date: '23 Aug',
          time: '04:15 PM',
        },
        {
          mood: 'Surprise',
          level: 7,
          emoji: '😲',
          type: 'AI Facial Scan',
          confidence: '89%',
          note: 'Pleasant catch-up with an old friend.',
          date: '21 Aug',
          time: '08:00 PM',
        },
      ];

  const getSeverityBadgeClass = (severity: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('minimal') || s.includes('none') || s.includes('normal')) return 'badge-success';
    if (s.includes('mild') || s.includes('subthreshold')) return 'badge-warning';
    if (s.includes('moderate')) return 'badge-orange';
    return 'badge-danger';
  };

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="profile-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Appointment Notification Banner */}
      {showApptNotif && latestAppt && (
        <div className={`appt-notif-banner ${latestAppt.status === 'confirmed' ? 'banner-confirmed' : 'banner-pending'}`}>
          <div className="appt-notif-icon">
            {latestAppt.status === 'confirmed' ? '✅' : '⏳'}
          </div>
          <div className="appt-notif-content">
            <strong>
              {latestAppt.status === 'confirmed'
                ? `✅ Appointment Confirmed with ${latestAppt.doctorName}!`
                : `⏳ Appointment Status: Pending Clinic Confirmation`}
            </strong>
            <span>
              {latestAppt.status === 'confirmed'
                ? `Your appointment is fixed for ${latestAppt.date} at ${latestAppt.time} (${latestAppt.mode}) at ${latestAppt.clinicName}.`
                : `Request sent to ${latestAppt.doctorName} (${latestAppt.clinicName}) for ${latestAppt.date} at ${latestAppt.time}. Awaiting confirmation email.`}
              &nbsp;·&nbsp; Ref: <em>#{latestAppt.bookingRef}</em>
            </span>
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn-profile-invoice"
                onClick={() => {
                  setSelectedInvoiceData({
                    bookingRef: latestAppt.bookingRef || 'SSAI-DEMO-2026',
                    doctorName: latestAppt.doctorName,
                    clinicName: latestAppt.clinicName,
                    patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient',
                    patientEmail: user.email,
                    patientPhone: user.phone,
                    appointmentDate: latestAppt.date,
                    appointmentTime: latestAppt.time,
                    consultationMode: latestAppt.mode,
                    fee: '₹1,200 / session',
                    paymentStatus: latestAppt.paymentStatus || 'pending',
                    paymentId: latestAppt.paymentId,
                    paymentMethod: latestAppt.paymentStatus === 'paid' ? 'Razorpay Online Gateway' : 'Pay at Clinic',
                  });
                  setIsInvoiceModalOpen(true);
                }}
              >
                📄 View Tax Invoice &amp; Receipt
              </button>
            </div>
          </div>


          <button
            className="appt-notif-dismiss"
            onClick={() => {
              setShowApptNotif(false);
              localStorage.removeItem('ss_latest_appointment');
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="container profile-container">
        {/* ================================================================
            MAIN 2-COLUMN DASHBOARD GRID
            ================================================================ */}
        <div className="profile-dashboard-layout">
          
          {/* ──────────────────────────────────────────────────────────────
              LEFT COLUMN: USER IDENTITY SIDEBAR
              ────────────────────────────────────────────────────────────── */}
          <aside className="profile-sidebar">
            {/* Identity Card */}
            <div className="profile-user-card">
              <div className="profile-card-cover"></div>
              
              <div className="profile-card-body">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-circle">{initials}</div>
                  <div className="profile-status-dot" title="Active on SoulSpace"></div>
                </div>

                <div className="profile-identity-text">
                  <h2 className="profile-user-name">{user.firstName} {user.lastName}</h2>
                  
                  <div className="profile-handle-box">
                    <span className="profile-handle-text">{userHandle}</span>
                    <button
                      type="button"
                      className="profile-handle-copy-btn"
                      onClick={handleCopyHandle}
                      title="Copy handle"
                    >
                      {copiedHandle ? '✓' : '📋'}
                    </button>
                  </div>

                  <span className={`profile-badge-pill ${user.isDemo ? 'badge-demo' : 'badge-verified'}`}>
                    {user.isDemo ? 'Demo Explorer' : '✓ Verified Patient'}
                  </span>
                </div>

                <div className="profile-details-list">
                  <div className="profile-detail-row">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{user.email}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-icon">📞</span>
                    <span className="detail-text">{user.phone || '+91 Not Provided'}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Aug 2026'}
                    </span>
                  </div>
                </div>

                {user.bio && (
                  <div className="profile-bio-box">
                    <p>"{user.bio}"</p>
                  </div>
                )}

                <div className="profile-sidebar-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-block"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    📄 Hospital Report (PDF)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Emergency Contact Box */}
            <div className="profile-side-box emergency-side-box">
              <div className="side-box-header">
                <span className="side-box-icon">🛡️</span>
                <div>
                  <h4>Emergency Contact</h4>
                  <p>Designated support person</p>
                </div>
              </div>
              <div className="side-box-body">
                <div className="side-box-info-item">
                  <span>Name:</span>
                  <strong>{user.emergencyContact?.name || 'Not Added Yet'}</strong>
                </div>
                <div className="side-box-info-item">
                  <span>Phone:</span>
                  <strong>{user.emergencyContact?.phone || 'Not Added Yet'}</strong>
                </div>
                <div className="side-box-info-item">
                  <span>Relation:</span>
                  <strong>{user.emergencyContact?.relation || 'Not Specified'}</strong>
                </div>
              </div>
              <button
                type="button"
                className="side-box-link-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                Update Contact →
              </button>
            </div>

            {/* 24/7 Helplines Box */}
            <div className="profile-side-box helpline-side-box">
              <div className="side-box-header">
                <span className="side-box-icon">🆘</span>
                <div>
                  <h4>24/7 Crisis Helplines</h4>
                  <p>Free confidential support</p>
                </div>
              </div>
              <div className="helpline-compact-list">
                <div className="helpline-compact-item">
                  <span>iCall (TISS):</span>
                  <a href="tel:9152987821">9152987821</a>
                </div>
                <div className="helpline-compact-item">
                  <span>Vandrevala:</span>
                  <a href="tel:18602662345">1860-2662-345</a>
                </div>
                <div className="helpline-compact-item">
                  <span>NIMHANS:</span>
                  <a href="tel:08046110007">080-46110007</a>
                </div>
              </div>
            </div>
          </aside>

          {/* ──────────────────────────────────────────────────────────────
              RIGHT COLUMN: STATS & ACTIVITY HUB
              ────────────────────────────────────────────────────────────── */}
          <main className="profile-main-area">
            
            {/* Top Vital Stats Cards */}
            <div className="profile-stats-row">
              <div className="stat-box">
                <div className="stat-box-icon icon-blue">📋</div>
                <div className="stat-box-content">
                  <span className="stat-box-val">{assessments.length}</span>
                  <span className="stat-box-label">Assessments Taken</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-box-icon icon-green">😊</div>
                <div className="stat-box-content">
                  <span className="stat-box-val">{moodLogs.length}</span>
                  <span className="stat-box-label">Mood Check-ins</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-box-icon icon-purple">🩺</div>
                <div className="stat-box-content">
                  <span className="stat-box-val">{appointments.length}</span>
                  <span className="stat-box-label">Doctor Consultations</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-box-icon icon-teal">🛡️</div>
                <div className="stat-box-content">
                  <span className="stat-box-val">Active</span>
                  <span className="stat-box-label">DPDP Protected</span>
                </div>
              </div>
            </div>

            {/* Structured Activity Box */}
            <div className="profile-activity-card">
              
              {/* Full-width segmented tabs bar */}
              <div className="profile-nav-tabs-bar">
                <button
                  type="button"
                  className={`tab-btn-pill ${activeTab === 'assessments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assessments')}
                >
                  <span>📋</span> Clinical Assessments <span className="tab-badge">{assessments.length}</span>
                </button>
                
                <button
                  type="button"
                  className={`tab-btn-pill ${activeTab === 'mood' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mood')}
                >
                  <span>🎭</span> Mood Track Record <span className="tab-badge">{moodLogs.length}</span>
                </button>
                
                <button
                  type="button"
                  className={`tab-btn-pill ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <span>📅</span> Doctor Consultations <span className="tab-badge">{appointments.length}</span>
                </button>
                
                <button
                  type="button"
                  className={`tab-btn-pill ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <span>⚙️</span> Safety Protocols
                </button>
              </div>

              {/* Tab Content Box */}
              <div className="profile-activity-body">
                
                {/* TAB 1: CLINICAL ASSESSMENTS */}
                {activeTab === 'assessments' && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <div>
                        <h3>DSM-5 Assessment History</h3>
                        <p>Validated clinical screeners completed with calculated severity tiers.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsReportModalOpen(true)}
                        >
                          📄 Hospital Report (PDF)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate('/mental-health')}
                        >
                          + Take Screener
                        </button>
                      </div>
                    </div>

                    {assessments.length === 0 ? (
                      <div className="empty-state-box">
                        <span className="empty-icon">🧠</span>
                        <h4>No Clinical Assessments Yet</h4>
                        <p>Take your first screener (PHQ-9, GAD-7, PCL-5, or ISI) to track your mental wellbeing.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/mental-health')}>
                          Start Assessment →
                        </button>
                      </div>
                    ) : (
                      <div className="records-box-list">
                        {assessments.map((item: any, idx: number) => (
                          <div key={idx} className="record-card-box">
                            <div className="record-card-main">
                              <div className="record-pill-tag">{item.code || item.assessmentId?.toUpperCase() || 'TEST'}</div>
                              <div className="record-info-col">
                                <h4>{item.title || `${item.code || 'Mental Health'} Screener`}</h4>
                                <div className="record-meta-line">
                                  <span>📅 {item.completedAt ? new Date(item.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                                  <span className="score-tag">Total Score: <strong>{item.score}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="record-card-actions">
                              <span className={`severity-tag ${getSeverityBadgeClass(item.severity)}`}>
                                {item.severity || 'Completed'}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => navigate('/mental-health')}
                              >
                                Retake
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: MOOD TRACK RECORD */}
                {activeTab === 'mood' && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <div>
                        <h3>Daily Emotional Timeline</h3>
                        <p>Biometric AI facial scans and manual emotional check-ins.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate('/mood-tracker')}
                      >
                        + Log Mood
                      </button>
                    </div>

                    <div className="mood-cards-container">
                      {moodLogs.map((log: any, idx: number) => (
                        <div key={idx} className="mood-item-card">
                          <div className="mood-item-header">
                            <span className="mood-item-emoji">{log.emoji || '😊'}</span>
                            <div className="mood-item-info">
                              <h4>{log.mood}</h4>
                              <span className="mood-item-time">{log.date || 'Today'} • {log.time || 'Recent'}</span>
                            </div>
                            <span className={`mood-source-tag ${log.type?.includes('AI') ? 'source-ai' : 'source-manual'}`}>
                              {log.type?.includes('AI') ? '🤖 AI Facial Scan' : '✋ Manual'}
                            </span>
                          </div>

                          {log.confidence && (
                            <div className="mood-confidence-strip">
                              <span>AI Recognition Confidence:</span>
                              <strong>{log.confidence}</strong>
                            </div>
                          )}

                          {log.note && (
                            <div className="mood-note-quote">
                              "{log.note}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: DOCTOR CONSULTATIONS */}
                {activeTab === 'appointments' && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <div>
                        <h3>Doctor Consultations</h3>
                        <p>Specialist bookings coordinated by the SoulSpace AI Concierge.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate('/appointment')}
                      >
                        + Book Doctor
                      </button>
                    </div>

                    {isLoadingAppointments ? (
                      <div className="tab-loading-state">
                        <div className="profile-spinner"></div>
                        <p>Fetching doctor appointments…</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="empty-state-box">
                        <span className="empty-icon">🩺</span>
                        <h4>No Appointments Booked Yet</h4>
                        <p>Tell our AI Concierge your concerns to get matched with verified psychiatrists and clinical psychologists.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/appointment')}>
                          Match Doctors with AI →
                        </button>
                      </div>
                    ) : (
                      <div className="records-box-list">
                        {appointments.map((apt) => (
                          <div key={apt._id} className="appointment-card-box">
                            <div className="apt-card-left">
                              <div className="doctor-avatar-box">🩺</div>
                              <div className="apt-info-col">
                                <div className="apt-name-title-row">
                                  <h4>{apt.doctorName}</h4>
                                  <span className={`apt-status-pill status-${apt.status}`}>
                                    {apt.status === 'confirmed' ? '✓ Confirmed' : apt.status === 'request_sent' ? '✉️ Request Sent' : '⏳ Pending'}
                                  </span>
                                </div>
                                <p className="apt-clinic-name">{apt.clinicName} • <strong>{apt.mode}</strong></p>
                                <div className="apt-schedule-badges">
                                  <span>📅 {apt.date}</span>
                                  <span>⏰ {apt.time}</span>
                                  {apt.aiMatchScore && (
                                    <span className="ai-match-tag">🤖 {apt.aiMatchScore}% AI Match</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SAFETY & EMERGENCY SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <div>
                        <h3>Safety &amp; Compliance Details</h3>
                        <p>Emergency contact management and patient data protection policies.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        Edit Information
                      </button>
                    </div>

                    <div className="safety-grid-box">
                      <div className="safety-card">
                        <h4>🛡️ Emergency Contact Profile</h4>
                        <div className="safety-details-rows">
                          <div><span>Full Name:</span> <strong>{user.emergencyContact?.name || 'None Set'}</strong></div>
                          <div><span>Contact Phone:</span> <strong>{user.emergencyContact?.phone || 'None Set'}</strong></div>
                          <div><span>Relationship:</span> <strong>{user.emergencyContact?.relation || 'Not Specified'}</strong></div>
                        </div>
                      </div>

                      <div className="safety-card privacy-card">
                        <h4>🔒 Data Privacy &amp; Protection</h4>
                        <p>SoulSpace complies with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> of India.</p>
                        <ul>
                          <li>✓ 256-bit AES Encryption at rest</li>
                          <li>✓ Zero commercial third-party tracking</li>
                          <li>✓ Confidential clinical screening data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ================================================================
          EDIT PROFILE MODAL
          ================================================================ */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile Information</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Unique Username Handle</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio / Mindset Statement</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a brief note about your wellness journey..."
                ></textarea>
              </div>

              <div className="modal-sub-section">
                <h3>🛡️ Emergency Contact Information</h3>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      placeholder="e.g. Parent / Friend"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={editEmergencyRelation}
                      onChange={(e) => setEditEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse / Brother"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Changes…' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          OFFICIAL HOSPITAL CLINICAL REPORT MODAL (PDF GENERATOR)
          ================================================================ */}
      <ClinicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        user={user}
        assessments={assessments}
        moodLogs={moodLogs}
        appointments={appointments}
      />

      {/* Official Tax Invoice Modal */}
      {selectedInvoiceData && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          data={selectedInvoiceData}
        />
      )}
    </div>

  );
};

export default Profile;
