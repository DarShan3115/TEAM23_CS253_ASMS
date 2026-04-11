/**
 * ASMS Messaging Service
 * ──────────────────────────────────────────────
 * Handles both Email (Nodemailer) and SMS (Twilio).
 * Falls back to console.log in development mode when
 * env vars are not configured.
 *
 * Required ENV vars:
 *   SMTP_USER          — Gmail address         (e.g. noreply@iitk.ac.in)
 *   SMTP_PASS          — Gmail App Password
 *   TWILIO_ACCOUNT_SID — Twilio Account SID
 *   TWILIO_AUTH_TOKEN  — Twilio Auth Token
 *   TWILIO_PHONE       — Twilio "From" number  (e.g. +12345678900)
 */

const nodemailer = require('nodemailer');

// ── Email Transporter ────────────────────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a plain-text or HTML email.
 * @param {string} to      - Recipient address (@iitk.ac.in)
 * @param {string} subject - Email subject
 * @param {string} text    - Plain text fallback
 * @param {string} [html]  - Optional HTML body
 */
const sendEmail = async (to, subject, text, html) => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            await emailTransporter.sendMail({
                from: `"ASMS – IIT Kanpur" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text,
                html: html || undefined,
            });
            console.log(`[EMAIL] ✔ Sent to ${to}: ${subject}`);
        } catch (err) {
            console.error(`[EMAIL] ✘ Failed to send to ${to}:`, err.message);
        }
    } else {
        // Dev fallback – OTP visible in server logs
        console.log(`\n[MOCK EMAIL] ─────────────────────────────────
  To:      ${to}
  Subject: ${subject}
  Body:    ${text}
─────────────────────────────────────────────\n`);
    }
};

// ── SMS (Twilio) ─────────────────────────────────────────────────────────────
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        const twilio = require('twilio');
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        console.log('[SMS] Twilio client initialised.');
    } catch (err) {
        console.warn('[SMS] Twilio package not installed or invalid credentials:', err.message);
    }
}

/**
 * Send an SMS message.
 * Automatically normalises Indian numbers to E.164 (+91XXXXXXXXXX).
 * @param {string} to  - Recipient phone number
 * @param {string} msg - Message body (keep < 160 chars)
 */
const sendSMS = async (to, msg) => {
    // Normalise to E.164 format
    let phone = to.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
        phone = '+91' + phone.replace(/^0+/, ''); // strip leading zeros
    }

    if (twilioClient && process.env.TWILIO_PHONE) {
        try {
            const message = await twilioClient.messages.create({
                body: msg,
                from: process.env.TWILIO_PHONE,
                to: phone,
            });
            console.log(`[SMS] ✔ Sent to ${phone}. SID: ${message.sid}`);
        } catch (err) {
            console.error(`[SMS] ✘ Failed to send to ${phone}:`, err.message);
        }
    } else {
        // Dev fallback – OTP visible in server logs
        console.log(`\n[MOCK SMS] ──────────────────────────────────
  To:  ${phone}
  Msg: ${msg}
────────────────────────────────────────────\n`);
    }
};

// ── Branded Email Templates ──────────────────────────────────────────────────
const otpEmailHtml = (otp, purpose = 'Verification') => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>ASMS OTP</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;">
              <p style="color:#bfdbfe;margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">IIT Kanpur</p>
              <h1 style="color:#ffffff;margin:8px 0 0;font-size:24px;font-weight:900;">Academic School Management System</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#a1a1aa;font-size:15px;margin:0 0 24px;">Your <strong style="color:#fff">${purpose}</strong> OTP:</p>
              <div style="background:#09090b;border:2px dashed #3f3f46;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#3b82f6;">${otp}</span>
              </div>
              <p style="color:#71717a;font-size:13px;margin:0;">This code expires in <strong style="color:#f59e0b">5 minutes</strong>. Do not share it with anyone.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #27272a;">
              <p style="color:#52525b;font-size:11px;margin:0;">This is an automated message from ASMS. If you did not request this, please ignore.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const welcomeEmailHtml = (firstName, email, tempPassword) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to ASMS</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#0284c7);padding:32px 40px;">
              <p style="color:#d1fae5;margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">IIT Kanpur</p>
              <h1 style="color:#ffffff;margin:8px 0 0;font-size:24px;font-weight:900;">Welcome to ASMS!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#a1a1aa;font-size:15px;margin:0 0 20px;">Hello <strong style="color:#fff">${firstName}</strong>,</p>
              <p style="color:#a1a1aa;font-size:14px;">Your account has been created by the admin. Here are your login credentials:</p>
              <div style="background:#09090b;border:1px solid #3f3f46;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="color:#71717a;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                <p style="color:#3b82f6;font-size:15px;font-weight:700;margin:0 0 16px;">${email}</p>
                <p style="color:#71717a;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
                <p style="color:#f59e0b;font-size:18px;font-weight:900;letter-spacing:4px;margin:0;">${tempPassword}</p>
              </div>
              <p style="color:#52525b;font-size:13px;">Please log in and change your password immediately.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #27272a;">
              <p style="color:#52525b;font-size:11px;margin:0;">ASMS — IIT Kanpur Academic School Management System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

module.exports = { sendEmail, sendSMS, otpEmailHtml, welcomeEmailHtml };
