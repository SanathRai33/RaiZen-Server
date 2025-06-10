const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // e.g. your@gmail.com
        pass: process.env.EMAIL_PASS,  // App password (not your real Gmail login password)
      },
    });

    const mailOptions = {
      from: `"RaiZen Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ Failed to send email:`, error);
  }
};

module.exports = sendEmail;
