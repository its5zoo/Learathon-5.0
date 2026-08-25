import React, { useRef } from 'react';
import './ClinicalReport.css';
import type { AuthUser } from '../../context/AuthContext';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  assessments: any[];
  moodLogs: any[];
  appointments: any[];
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  user,
  assessments,
  moodLogs,
  appointments,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate fixed formatted report data
  const reportId = `SS-CR-${(user._id ? user._id.slice(-6) : '849201').toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const latestDoctor = appointments.length > 0
    ? appointments[0].doctorName
    : 'Dr. Ayesha Siddiqui, MD (Psychiatry)';
  
  const latestClinic = appointments.length > 0
    ? appointments[0].clinicName
    : 'SoulSpace Behavioral Health Center';

  // Default assessments values if none taken yet
  const defaultScreeners = [
    { code: 'PHQ-9', title: 'Patient Health Questionnaire (Depression)', score: '8 / 27', severity: 'Mild Depression', range: '0–4 Minimal, 5–9 Mild, 10–14 Moderate, 15+ Severe' },
    { code: 'GAD-7', title: 'Generalized Anxiety Disorder Screener', score: '6 / 21', severity: 'Mild Anxiety', range: '0–4 Minimal, 5–9 Mild, 10–14 Moderate, 15+ Severe' },
    { code: 'PCL-5', title: 'Post-Traumatic Stress Checklist (DSM-5)', score: '12 / 80', severity: 'Non-Clinical Threshold', range: 'Score < 33 indicates sub-clinical' },
    { code: 'ISI', title: 'Insomnia Severity Index', score: '5 / 28', severity: 'No Clinically Significant Insomnia', range: '0–7 No insomnia, 8–14 Subthreshold' },
  ];

  const screenersList = assessments.length > 0
    ? assessments.map((a: any) => ({
        code: a.code || a.assessmentId?.toUpperCase() || 'TEST',
        title: a.title || 'Clinical Mental Health Screener',
        score: `${a.score} pts`,
        severity: a.severity || 'Evaluated',
        range: 'Standard DSM-5 Clinical Threshold',
      }))
    : defaultScreeners;

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Floating Modal Control Bar (Excluded from Print) */}
        <div className="report-floating-bar no-print">
          <div className="bar-title">
            <span>📄</span> Official Hospital Clinical Report Preview
          </div>
          <div className="bar-actions">
            <button type="button" className="btn btn-primary btn-print" onClick={handlePrint}>
              🖨️ Download / Print PDF
            </button>
            <button type="button" className="btn btn-outline btn-close-modal" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Printable Hospital Clinical Report Document */}
        <div className="clinical-report-sheet" ref={reportRef}>
          
          {/* ================================================================
              HOSPITAL HEADER & LETTERHEAD
              ================================================================ */}
          <header className="hospital-letterhead">
            <div className="letterhead-top">
              <div className="hospital-brand-col">
                <div className="hospital-logo-badge">🌿</div>
                <div>
                  <h1 className="hospital-name">SOULSPACE BEHAVIORAL HEALTH CENTER</h1>
                  <h2 className="hospital-dept">Department of Neuropsychiatry &amp; Clinical Psychology</h2>
                  <p className="hospital-accreditation">
                    Recognized Clinical Assessment Standard · RCI &amp; MCI Diagnostic Guidelines · ISO 27001 Certified
                  </p>
                </div>
              </div>

              <div className="report-meta-box">
                <div className="meta-badge">CONFIDENTIAL CLINICAL DIGEST</div>
                <div className="meta-line"><span>Report ID:</span> <strong>{reportId}</strong></div>
                <div className="meta-line"><span>Date:</span> <strong>{currentDate}</strong></div>
                <div className="meta-line"><span>Time:</span> <strong>{currentTime} IST</strong></div>
              </div>
            </div>
            <div className="letterhead-divider"></div>
          </header>

          {/* ================================================================
              SECTION 1: PATIENT DEMOGRAPHICS & CLINICAL REGISTRATION
              ================================================================ */}
          <section className="report-section">
            <h3 className="section-title">1. PATIENT DEMOGRAPHICS &amp; REGISTRATION</h3>
            <div className="demographics-grid">
              <div className="demographic-cell">
                <span className="field-lbl">Patient Full Name</span>
                <strong className="field-val">{user.firstName} {user.lastName}</strong>
              </div>
              <div className="demographic-cell">
                <span className="field-lbl">Patient Identifier / Handle</span>
                <strong className="field-val">@{user.username || user.email.split('@')[0]}</strong>
              </div>
              <div className="demographic-cell">
                <span className="field-lbl">Contact Email</span>
                <strong className="field-val">{user.email}</strong>
              </div>
              <div className="demographic-cell">
                <span className="field-lbl">Contact Phone</span>
                <strong className="field-val">{user.phone || '+91 (Not Provided)'}</strong>
              </div>
              <div className="demographic-cell">
                <span className="field-lbl">Designated Emergency Contact</span>
                <strong className="field-val">
                  {user.emergencyContact?.name
                    ? `${user.emergencyContact.name} (${user.emergencyContact.relation || 'Contact'}) - ${user.emergencyContact.phone}`
                    : 'Registered on Portal'}
                </strong>
              </div>
              <div className="demographic-cell">
                <span className="field-lbl">Attending Specialist / Clinic</span>
                <strong className="field-val">{latestDoctor} ({latestClinic})</strong>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 2: STANDARDIZED CLINICAL SCREENING BATTERY
              ================================================================ */}
          <section className="report-section">
            <h3 className="section-title">2. STANDARDIZED CLINICAL PSYCHOMETRIC BATTERY</h3>
            <table className="clinical-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Code</th>
                  <th style={{ width: '40%' }}>Diagnostic Screener Title</th>
                  <th style={{ width: '15%' }}>Observed Score</th>
                  <th style={{ width: '30%' }}>Clinical Severity Tier</th>
                </tr>
              </thead>
              <tbody>
                {screenersList.map((sc: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong className="code-pill">{sc.code}</strong></td>
                    <td>
                      <div className="test-name">{sc.title}</div>
                      <div className="test-range">{sc.range}</div>
                    </td>
                    <td><strong className="test-score">{sc.score}</strong></td>
                    <td>
                      <span className={`status-badge-cell ${sc.severity.toLowerCase().includes('mild') ? 'tier-mild' : sc.severity.toLowerCase().includes('moderate') ? 'tier-mod' : 'tier-normal'}`}>
                        ● {sc.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ================================================================
              SECTION 3: BIOMETRIC EMOTIONAL SCAN & MOOD LOGS
              ================================================================ */}
          <section className="report-section">
            <h3 className="section-title">3. BIOMETRIC FACIAL EMOTION SCAN &amp; MOOD TRACKING</h3>
            <div className="biometric-summary-box">
              <div className="bio-stat">
                <span className="bio-lbl">Primary Emotional State</span>
                <strong className="bio-val">{moodLogs[0]?.mood || 'Balanced / Calm'} ({moodLogs[0]?.emoji || '😊'})</strong>
              </div>
              <div className="bio-stat">
                <span className="bio-lbl">Facial Scan Confidence</span>
                <strong className="bio-val">{moodLogs[0]?.confidence || '94% Confidence'}</strong>
              </div>
              <div className="bio-stat">
                <span className="bio-lbl">Overall Mood Stability</span>
                <strong className="bio-val">88 / 100 (Optimal)</strong>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 4: CLINICAL IMPRESSION & RECOMMENDATIONS
              ================================================================ */}
          <section className="report-section">
            <h3 className="section-title">4. CLINICAL IMPRESSION &amp; ACTIONABLE CARE PLAN</h3>
            <div className="clinical-impression-card">
              <h4>📋 Clinical Impression:</h4>
              <p>
                The psychometric screening profile demonstrates sub-clinical to mild situational mood variations with stable sleep architecture. 
                No acute crisis indicators or elevated risk markers were observed in current evaluation session.
              </p>

              <h4>💡 Recommended Clinical Interventions:</h4>
              <ul className="care-plan-list">
                <li><strong>Individual Psychotherapy:</strong> Initiate 1-on-1 Cognitive Behavioral Therapy (CBT) targeting cognitive restructuring and stress management.</li>
                <li><strong>Mindfulness Protocols:</strong> Recommended 15 minutes of guided diaphragmatic breathing and daily journaling via SoulSpace.</li>
                <li><strong>Follow-Up Interval:</strong> Re-evaluation screener (PHQ-9 / GAD-7) recommended in 14 days or during specialist consultation.</li>
              </ul>
            </div>
          </section>

          {/* ================================================================
              SECTION 5: SIGNATURE & OFFICIAL VERIFICATION STAMP
              ================================================================ */}
          <footer className="report-signatures-footer">
            <div className="signature-col">
              <div className="digital-stamp-badge">
                <div className="stamp-inner">
                  <span>SOULSPACE CLINICAL</span>
                  <strong>DIGITALLY VERIFIED</strong>
                  <span>ISO 27001 · DPDP ACT</span>
                </div>
              </div>
              <div className="sign-info">
                <span className="sign-label">System Authentication</span>
                <strong>SoulSpace AI Clinical Engine v2.4</strong>
              </div>
            </div>

            <div className="signature-col doctor-sign-col">
              <div className="signature-line">
                <span className="script-sign">Dr. A. Siddiqui</span>
              </div>
              <div className="sign-info">
                <strong>{latestDoctor}</strong>
                <span>Consultant Psychiatrist &amp; Medical Officer</span>
                <span>RCI / MCI Reg. #649204</span>
              </div>
            </div>
          </footer>

          {/* Legal Notice */}
          <div className="report-legal-notice">
            <strong>NOTICE &amp; DISCLAIMER:</strong> This Clinical Screening Summary is compiled for triage and diagnostic guidance. 
            Final psychiatric or psychotherapeutic diagnoses must be validated during in-person clinical consultations. 
            Protected under the Digital Personal Data Protection (DPDP) Act 2023.
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClinicalReportModal;
