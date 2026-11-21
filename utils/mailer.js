const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.NOTIFY_TO) {
    const error = new Error('Email delivery is not configured.');
    error.statusCode = 503;
    throw error;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function deliver(message) {
  try {
    await getTransporter().sendMail(message);
  } catch (cause) {
    if (cause.statusCode === 503) throw cause;
    const error = new Error('Email delivery failed.');
    error.statusCode = 502;
    error.cause = cause;
    throw error;
  }
}

exports.sendGuessEmail = async (g) => {
  await deliver({
    from: `"${env.mail.fromName}" <${env.mail.user}>`,
    to: env.mail.to,
    replyTo: g.email,
    subject: `New guess from ${g.name}`,
    text: `Name: ${g.name}\nPhone: ${g.phone}\nEmail: ${g.email}\n\nGuess:\n${g.guess}\n\nReceived: ${g.created_at} UTC`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">New guess for Luzara Nova</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><b>Name</b></td><td>${esc(g.name)}</td></tr>
          <tr><td><b>Phone</b></td><td>${esc(g.phone)}</td></tr>
          <tr><td><b>Email</b></td><td>${esc(g.email)}</td></tr>
        </table>
        <p style="margin:16px 0 4px"><b>Guess</b></p>
        <p style="white-space:pre-wrap;margin:0">${esc(g.guess)}</p>
        <p style="color:#777;font-size:12px;margin-top:20px">Received ${esc(g.created_at)} UTC</p>
      </div>`,
  });
  return true;
};

exports.sendContactEmail = async (m) => {
  await deliver({
    from: `"${env.mail.fromName}" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFY_TO,
    replyTo: m.email,
    subject: `New enquiry from ${m.name}`,
    text: `Name: ${m.name}\nEmail: ${m.email}\nPhone: ${m.phone || '-'}\nInterested in: ${m.interest || '-'}\n\nMessage:\n${m.message}\n\nReceived: ${m.created_at} UTC`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">New enquiry for Luzara Nova</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><b>Name</b></td><td>${esc(m.name)}</td></tr>
          <tr><td><b>Email</b></td><td>${esc(m.email)}</td></tr>
          <tr><td><b>Phone</b></td><td>${esc(m.phone || '-')}</td></tr>
          <tr><td><b>Interested in</b></td><td>${esc(m.interest || '-')}</td></tr>
        </table>
        <p style="margin:16px 0 4px"><b>Message</b></p>
        <p style="white-space:pre-wrap;margin:0">${esc(m.message)}</p>
        <p style="color:#777;font-size:12px;margin-top:20px">Received ${esc(m.created_at)} UTC</p>
      </div>`,
  });
  return true;
};
