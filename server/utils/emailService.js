
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  family: 4
});
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Gmail SMTP connection verified successfully.");
  } catch (error) {
    console.error("Gmail SMTP verification failed:", error.message);
  }
};

verifyEmailConnection();
const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    console.log("Email skipped: Customer email not available.");
    return;
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};

module.exports = sendEmail;
