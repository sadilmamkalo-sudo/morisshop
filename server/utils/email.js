const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    if (!t) {
      console.log(`[EMAIL SIMULATED] To: ${to}, Subject: ${subject}`);
      return { simulated: true };
    }
    const info = await t.sendMail({ from: `"MORISSESHOP" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Email error:', err.message);
    return { error: err.message };
  }
};

const orderStatusEmail = (order, user) => {
  const itemsHtml = order.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">${i.name?.en || 'Product'}</td><td style="padding:8px;border-bottom:1px solid #ddd">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd">${i.price} DH</td></tr>`
  ).join('');
  return sendEmail({
    to: user.email,
    subject: `Order #${order._id.toString().slice(-8)} - ${order.status}`,
    html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
      <h1 style="color:#f59e0b">MORISSESHOP</h1>
      <p>Dear ${user.name},</p>
      <p>Your order status has been updated to: <strong>${order.status}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">${itemsHtml}</table>
      <p><strong>Total: ${order.totalPrice} DH</strong></p>
      <p>Thank you for shopping with us!</p>
    </div>`
  });
};

const ticketResponseEmail = (ticket, user) => {
  return sendEmail({
    to: user.email,
    subject: `Ticket: ${ticket.subject} - New Response`,
    html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
      <h1 style="color:#f59e0b">MORISSESHOP Support</h1>
      <p>Dear ${user.name},</p>
      <p>Your ticket "<strong>${ticket.subject}</strong>" has received a new response.</p>
      <p>Status: <strong>${ticket.status}</strong></p>
      <p>Login to view the response.</p>
    </div>`
  });
};

module.exports = { sendEmail, orderStatusEmail, ticketResponseEmail };
