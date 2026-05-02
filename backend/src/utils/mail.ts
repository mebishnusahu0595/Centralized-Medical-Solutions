import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  const mailOptions = {
    from: `CMS Support <${process.env.EMAIL_FROM || 'support@cmsmedical.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Sending Email:', mailOptions);
    return;
  }

  await transporter.sendMail(mailOptions);
};
