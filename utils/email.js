const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.APP_EMAIL_HOST,
    port: process.env.APP_EMAIL_PORT,
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_EMAIL_PW,
    },
  });

  const outgoing = {
    from: 'Natours <hello@natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(outgoing);
};

module.exports = sendEmail;
