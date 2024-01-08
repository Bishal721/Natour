const nodemailer = require("nodemailer");

const sendEmail = async (sent_from, send_to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });
  const options = {
    from: sent_from,
    to: send_to,
    subject: subject,
    html: message,
  };


  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      console.log("Logged this");
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
