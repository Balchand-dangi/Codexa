// free for 2 months only I have to switch resend.com after 2 months
const sgMail = require('@sendgrid/mail');

// Initialize with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to: to,
      from: process.env.EMAIL_USER, 
      subject: subject,
      html: html
    };
    
    await sgMail.send(msg);
    //console.log('Email sent successfully via SendGrid to:', to);
    return { success: true };
    
  } catch (error) {    
    throw error;
  }
};

module.exports = sendEmail;
