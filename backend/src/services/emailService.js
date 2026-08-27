import nodemailer from 'nodemailer';

const BOOKING_REF_PREFIX = 'SS';

let cachedTransporter = null;
let cachedTestAccount = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    if (!cachedTestAccount) {
      cachedTestAccount = await nodemailer.createTestAccount();
    }
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: cachedTestAccount.user,
        pass: cachedTestAccount.pass,
      },
    });
  }

  return cachedTransporter;
};

const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SoulSpace — Appointment Report</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:640px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">
    
    <div style="background:linear-gradient(135deg,#1a3a6b 0%,#3f72af 60%,#6c9fd8 100%);padding:36px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px;">🌿</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">SoulSpace</h1>
      <p style="color:rgba(255,255,255,0.80);margin:6px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Mental Health Platform · Learnathon 5.0</p>
    </div>

    <div style="padding:36px 32px;">
      ${bodyContent}
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;">
        This is an automated message sent by the <strong>SoulSpace AI Appointment Concierge</strong>.<br/>
        Do not reply to this email if it was not intended for you.
      </p>
      <p style="margin:0;color:#94a3b8;font-size:11px;">
        © 2026 SoulSpace · Learnathon 5.0 · Built with ❤️ for mental health
      </p>
    </div>

  </div>
</body>
</html>
`;

const detailRow = (label, value, shade = false) => `
  <tr style="background:${shade ? '#f8fafc' : '#fff'};">
    <td style="padding:13px 16px;font-weight:600;color:#3f72af;font-size:13px;width:42%;border-bottom:1px solid #e2e8f0;">${label}</td>
    <td style="padding:13px 16px;color:#1e293b;font-size:13px;border-bottom:1px solid #e2e8f0;">${value}</td>
  </tr>
`;

export const sendAppointmentRequestEmail = async ({
  toClinicEmail,
  clinicName,
  doctorName,
  doctorPhone,
  patientName,
  patientEmail,
  patientPhone,
  date,
  time,
  mode,
  concerns,
  matchScore,
  assessmentSummary,
  bookingRef,
}) => {
  const transporter = await getTransporter();

  const fromAddress = process.env.GMAIL_USER
    ? `SoulSpace Platform <${process.env.GMAIL_USER}>`
    : `SoulSpace Platform <noreply@soulspace.app>`;

  const ref = bookingRef || `${BOOKING_REF_PREFIX}-${Date.now().toString(36).toUpperCase()}`;
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

  const assessmentBlock = assessmentSummary ? `
    <div style="margin:24px 0;padding:18px 20px;background:#eff6ff;border-left:4px solid #3f72af;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">📊 Patient Assessment Summary (Confidential)</p>
      <p style="margin:0;color:#334155;font-size:13px;line-height:1.7;white-space:pre-line;">${assessmentSummary}</p>
    </div>
  ` : '';

  const concernsBlock = concerns ? `
    <div style="margin:16px 0;padding:14px 18px;background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">💬 Patient's Primary Concerns</p>
      <p style="margin:0;color:#1e293b;font-size:13px;line-height:1.6;">${concerns}</p>
    </div>
  ` : '';

  const body = `
    <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;margin-bottom:24px;text-transform:uppercase;">
      📋 New Appointment Request
    </div>

    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Appointment Request Report</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">Booking Reference: <strong style="color:#3f72af;">${ref}</strong> &nbsp;·&nbsp; Sent: ${sentAt}</p>

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Dear <strong>${doctorName}</strong> &amp; the team at <strong>${clinicName}</strong>,<br/><br/>
      A patient from the <strong>SoulSpace Mental Health Platform</strong> has requested an appointment 
      through our AI-powered concierge. Please review the details below and reply to 
      <strong>${patientEmail}</strong> to confirm or suggest an alternative slot.
    </p>

    <p style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">Patient Details</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${detailRow('Full Name', patientName, true)}
      ${detailRow('Email', `<a href="mailto:${patientEmail}" style="color:#3f72af;">${patientEmail}</a>`)}
      ${detailRow('Phone', patientPhone || 'Not provided', true)}
    </table>

    <p style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">Appointment Details</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${detailRow('Specialist', `${doctorName}`, true)}
      ${detailRow('Clinic', clinicName)}
      ${detailRow('Clinic Phone', doctorPhone || 'N/A', true)}
      ${detailRow('Requested Date', date)}
      ${detailRow('Requested Time', time, true)}
      ${detailRow('Consultation Mode', `<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">${mode}</span>`)}
      ${matchScore ? detailRow('AI Match Score', `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">${matchScore}% Match</span>`, true) : ''}
    </table>

    ${concernsBlock}
    ${assessmentBlock}

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px 20px;margin:24px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
        ⚡ <strong>Action Required:</strong> Please reply to the patient at 
        <a href="mailto:${patientEmail}" style="color:#d97706;font-weight:600;">${patientEmail}</a>
        to confirm or reschedule.
      </p>
    </div>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;">
      <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.5;">
        🔒 <strong>Privacy Notice:</strong> All assessment data shared in this report is with the patient's 
        explicit consent and is protected under applicable health data privacy regulations.
      </p>
    </div>
  `;

  const mailOptions = {
    from: fromAddress,
    to: toClinicEmail || 'ashiafhalak786@gmail.com',
    cc: toClinicEmail && toClinicEmail.toLowerCase() !== 'ashiafhalak786@gmail.com' ? 'ashiafhalak786@gmail.com' : undefined,
    replyTo: patientEmail,
    subject: `Appointment Request [${ref}] — ${patientName} with ${doctorName} · ${date} ${time}`,
    html: emailWrapper(body),
    text: `[SoulSpace Appointment Request]
Ref: ${ref}
Patient: ${patientName} | ${patientEmail} | ${patientPhone || 'N/A'}
Doctor: ${doctorName} — ${clinicName}
Date/Time: ${date} at ${time} (${mode})
Concerns: ${concerns || 'N/A'}
Assessment: ${assessmentSummary || 'N/A'}
Action: Reply to ${patientEmail} to confirm.`,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  return { messageId: info.messageId, previewUrl, bookingRef: ref };
};

export const sendConfirmationToPatient = async ({
  patientEmail,
  patientName,
  doctorName,
  clinicName,
  clinicPhone,
  date,
  time,
  mode,
  concerns,
  bookingRef,
}) => {
  const transporter = await getTransporter();

  const fromAddress = process.env.GMAIL_USER
    ? `SoulSpace Platform <${process.env.GMAIL_USER}>`
    : `SoulSpace Platform <noreply@soulspace.app>`;

  const ref = bookingRef || `${BOOKING_REF_PREFIX}-${Date.now().toString(36).toUpperCase()}`;
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;background:#dcfce7;border-radius:50%;font-size:32px;margin-bottom:12px;">✅</div>
      <h2 style="margin:0;color:#166534;font-size:22px;font-weight:700;">Appointment Request Sent!</h2>
      <p style="margin:8px 0 0;color:#64748b;font-size:13px;">Your request has been forwarded to the clinic by SoulSpace.</p>
    </div>

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Dear <strong>${patientName}</strong>,<br/><br/>
      Your appointment request has been successfully submitted to 
      <strong>${clinicName}</strong>. The clinic will contact you within <strong>24–48 hours</strong> 
      to confirm your slot.
    </p>

    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 24px;">
      <div style="background:#3f72af;padding:14px 20px;">
        <p style="margin:0;color:#fff;font-size:13px;font-weight:700;letter-spacing:0.5px;">📋 BOOKING SUMMARY</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Booking Reference', `<strong style="color:#3f72af;font-family:monospace;">${ref}</strong>`, true)}
        ${detailRow('Specialist', doctorName)}
        ${detailRow('Clinic', clinicName, true)}
        ${detailRow('Clinic Phone', clinicPhone || 'Will be shared on confirmation')}
        ${detailRow('Requested Date', date, true)}
        ${detailRow('Requested Time', time)}
        ${detailRow('Mode', `<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">${mode}</span>`, true)}
        ${concerns ? detailRow('Your Concerns', concerns) : ''}
      </table>
    </div>

    <div style="background:#f0f9ff;border-left:4px solid #3f72af;border-radius:0 10px 10px 0;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">📌 What happens next?</p>
      <ol style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8;">
        <li>The clinic reviews your request and contacts you at <strong>${patientEmail}</strong></li>
        <li>Once confirmed, your appointment will appear in your SoulSpace profile</li>
        <li>You will receive a confirmation email with session details</li>
      </ol>
    </div>

    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      Keep your booking reference <strong style="color:#3f72af;">${ref}</strong> handy.<br/>
      Sent at ${sentAt} IST
    </p>
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: patientEmail,
    subject: `Appointment Request Sent — ${doctorName} · ${date} [${ref}]`,
    html: emailWrapper(body),
    text: `[SoulSpace] Your appointment request has been sent.
Booking Ref: ${ref}
Doctor: ${doctorName} — ${clinicName}
Date/Time: ${date} at ${time} (${mode})
The clinic will contact you within 24-48 hours.`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return { messageId: info.messageId, previewUrl };
};
