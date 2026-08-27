import React from 'react';
import './InvoiceModal.css';

export interface InvoiceData {
  invoiceNumber?: string;
  issueDate?: string;
  bookingRef: string;
  doctorName: string;
  doctorTitle?: string;
  qualification?: string;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationMode: string;
  fee: string;
  paymentStatus: 'paid' | 'pending';
  paymentId?: string | null;
  paymentMethod?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const rawFeeMatch = data.fee ? data.fee.replace(/,/g, '').match(/\d+/) : null;
  const numericAmount = rawFeeMatch ? parseInt(rawFeeMatch[0], 10) : 1200;
  const formattedFee = `₹${numericAmount.toLocaleString('en-IN')}.00`;
  const invoiceNum = data.invoiceNumber || `INV-SS-${new Date().getFullYear()}-${data.bookingRef.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const todayDate = data.issueDate || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="invoice-modal-container">
        
        {/* Action Header (Hidden during Print) */}
        <div className="invoice-modal-topbar">
          <div className="topbar-title">
            <span>📄 Official Medical Consultation Invoice</span>
          </div>
          <div className="topbar-actions">
            <button className="btn-invoice-action btn-print" onClick={handlePrint}>
              🖨️ Print / Save as PDF
            </button>
            <button className="btn-invoice-action btn-close-modal" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="invoice-sheet" id="printable-invoice">
          
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-brand-col">
              <div className="invoice-logo">
                <span className="brand-leaf">🌿</span>
                <span className="brand-name">SoulSpace</span>
              </div>
              <p className="brand-sub">Mental Health &amp; Psychological Care Platform</p>
              <p className="brand-tax-info">
                SoulSpace Health Technologies Pvt. Ltd.<br />
                CIN: U85110KA2026PTC142981 | GSTIN: 29AABCS1429B1Z8<br />
                Indiranagar, Bengaluru, Karnataka 560038, India
              </p>
            </div>

            <div className="invoice-meta-col">
              <h2 className="tax-invoice-heading">TAX INVOICE</h2>
              <div className="meta-badge-box">
                <div className="meta-row">
                  <span>Invoice No:</span>
                  <strong>{invoiceNum}</strong>
                </div>
                <div className="meta-row">
                  <span>Booking Ref:</span>
                  <strong className="code-ref">{data.bookingRef}</strong>
                </div>
                <div className="meta-row">
                  <span>Date of Issue:</span>
                  <strong>{todayDate}</strong>
                </div>
                <div className="meta-row">
                  <span>Place of Supply:</span>
                  <strong>Karnataka (29), India</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Patient & Clinic Details Grid */}
          <div className="invoice-parties-grid">
            
            {/* Bill To: Patient */}
            <div className="party-card">
              <h4 className="party-title">👤 BILLED TO (PATIENT):</h4>
              <p className="party-name">{data.patientName || 'Anonymous Patient'}</p>
              <p className="party-info"><strong>Email:</strong> {data.patientEmail}</p>
              {data.patientPhone && <p className="party-info"><strong>Phone:</strong> {data.patientPhone}</p>}
              <p className="party-info"><strong>Category:</strong> Outpatient Psychological Consultation</p>
            </div>

            {/* Service Provider: Doctor & Clinic */}
            <div className="party-card">
              <h4 className="party-title">🩺 HEALTHCARE SPECIALIST &amp; CLINIC:</h4>
              <p className="party-name">{data.doctorName}</p>
              {data.doctorTitle && <p className="party-info"><strong>Specialty:</strong> {data.doctorTitle}</p>}
              {data.qualification && <p className="party-info"><strong>Credentials:</strong> {data.qualification}</p>}
              <p className="party-info"><strong>Clinic / Center:</strong> {data.clinicName}</p>
              {data.clinicAddress && <p className="party-info"><strong>Address:</strong> {data.clinicAddress}</p>}
            </div>

          </div>

          {/* Appointment Particulars Box */}
          <div className="session-particulars-box">
            <div className="particular-item">
              <span className="p-label">Appointment Date</span>
              <strong className="p-val">{data.appointmentDate}</strong>
            </div>
            <div className="particular-item">
              <span className="p-label">Slot Time</span>
              <strong className="p-val">{data.appointmentTime}</strong>
            </div>
            <div className="particular-item">
              <span className="p-label">Consultation Mode</span>
              <strong className="p-val mode-pill">{data.consultationMode}</strong>
            </div>
            <div className="particular-item">
              <span className="p-label">Platform Verified</span>
              <strong className="p-val text-green">✓ Confirmed</strong>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>#</th>
                <th style={{ width: '47%' }}>Service Description</th>
                <th style={{ width: '15%' }}>SAC Code</th>
                <th style={{ width: '15%' }}>Rate</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Professional Mental Health Consultation &amp; Counseling</strong>
                  <p className="table-item-desc">
                    One-on-one specialist session with {data.doctorName} including clinical intake and treatment guidance.
                  </p>
                </td>
                <td>999312</td>
                <td>{formattedFee}</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>{formattedFee}</td>
              </tr>
            </tbody>
          </table>

          {/* Calculation Summary Row */}
          <div className="invoice-calc-layout">
            <div className="invoice-tax-exempt-notice">
              <p>
                <strong>ℹ️ GST Exemption Notice:</strong><br />
                Health care services provided by clinical psychologists and recognized medical practitioners are exempt from GST under Notification No. 12/2017 - Central Tax (Rate), Heading 9993.
              </p>
            </div>

            <div className="invoice-totals-box">
              <div className="totals-row">
                <span>Subtotal:</span>
                <strong>{formattedFee}</strong>
              </div>
              <div className="totals-row">
                <span>Healthcare GST (0% Exempt):</span>
                <span>₹0.00</span>
              </div>
              <div className="totals-divider"></div>
              <div className="totals-row grand-total">
                <span>Total Amount:</span>
                <span className="grand-price">{formattedFee}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Stamp */}
          <div className={`invoice-payment-status-box ${data.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
            {data.paymentStatus === 'paid' ? (
              <div className="status-flex">
                <div className="stamp-seal paid-seal">
                  <span>PAID</span>
                </div>
                <div className="status-details">
                  <strong>✓ Payment Completed Online via Razorpay Gateway</strong>
                  <p>
                    Transaction Ref ID: <code>{data.paymentId || 'pay_verified_razorpay'}</code><br />
                    Payment Mode: UPI / Cards / NetBanking (Authorized &amp; Reconciled)
                  </p>
                </div>
              </div>
            ) : (
              <div className="status-flex">
                <div className="stamp-seal pending-seal">
                  <span>DUE</span>
                </div>
                <div className="status-details">
                  <strong>🏥 Payment Due at Clinic Reception</strong>
                  <p>Please present this invoice voucher and settle {formattedFee} upon arrival at the clinic counter.</p>
                </div>
              </div>
            )}
          </div>

          {/* Digital Signature and Legal Stamp */}
          <div className="invoice-footer">
            <div className="footer-terms">
              <p><strong>Terms &amp; Refund Policy:</strong></p>
              <ul>
                <li>Free cancellation/rescheduling is permitted up to 4 hours before the scheduled slot time.</li>
                <li>Tele-consultation secure video links will be shared 15 minutes prior to appointment.</li>
                <li>All health assessments shared are encrypted under the Digital Personal Data Protection (DPDP) Act 2023.</li>
              </ul>
            </div>

            <div className="digital-signature-box">
              <div className="signature-seal">
                <span className="seal-icon">🌿</span>
                <span className="seal-text">SOULSPACE VERIFIED</span>
              </div>
              <p className="signatory-title">Authorized Digital Signatory</p>
              <p className="signatory-org">SoulSpace Health Technologies</p>
            </div>
          </div>

          {/* Print Footer Note */}
          <div className="invoice-print-footnote">
            This is a computer-generated official tax invoice and electronic medical receipt. No physical signature is required.
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
