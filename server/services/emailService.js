import { createTransport } from 'nodemailer';
import { emailHost, emailPort, emailSecure, emailUser, emailPassword } from '../config/config.js';

// Create reusable transporter
const transporter = createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailSecure,
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server connection established');
  }
});

// Send email function
const sendEmail = async (to, subject, body) => {
  try {
    const mailOptions = {
      from: `"Email Flow Designer" <${emailUser}>`,
      to,
      subject,
      html: body
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default {
  sendEmail
};