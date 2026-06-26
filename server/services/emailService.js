let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  // Nodemailer not installed, fallback to console logs
}

const sendResetEmail = async (email, resetToken) => {
  // Always log in development
  console.log(`[Email Service] Password Reset Request for ${email}. Reset Token: ${resetToken}`);
  console.log(`[Email Service] Link: http://localhost:5173/reset-password/${resetToken}`);

  if (!nodemailer) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const mailOptions = {
      from: '"Skilltern Support" <noreply@skilltern.com>',
      to: email,
      subject: 'Skilltern - Password Reset Request',
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process:\n\n
http://localhost:5173/reset-password/${resetToken}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending reset email:', error);
  }
};

module.exports = {
  sendResetEmail,
};
