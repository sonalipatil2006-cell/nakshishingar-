require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
  } else {
    console.log('✅ SMTP Connected! Sending test email...');
    transporter.sendMail({
      from: `"Nakshishrungar" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '🔐 Test OTP - 123456',
      html: '<h2>Test OTP is: <b>123456</b></h2>'
    }, (err, info) => {
      if (err) {
        console.error('❌ Email send failed:', err.message);
      } else {
        console.log('✅ Email sent successfully! MessageId:', info.messageId);
      }
      process.exit(0);
    });
  }
});
