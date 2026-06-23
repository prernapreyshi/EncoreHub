const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return cachedTransporter;
};

/**
 * Sends an email. Designed to fail soft — callers that treat email as a
 * non-critical side effect (e.g. booking confirmations) should wrap calls
 * in try/catch and log rather than fail the parent request.
 */
const sendEmail = async ({ email, subject, html }) => {
  // If email isn't configured (e.g. local dev without SMTP creds), skip
  // silently rather than throwing — most flows treat email as best-effort.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[email] Skipped "${subject}" to ${email} — EMAIL_USER/EMAIL_PASS not configured.`);
    return;
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `EncoreHub <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = { sendEmail };
