const nodeMailer = require('nodemailer');
require('dotenv').config();
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const sendMail = (to, subject, htmlContent) => {
   const transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
         user: 'nguyenduykhanghuflit@gmail.com',
         pass: 'ntds euot pafg qrve',
      },
   });

   const options = {
      from: 'nguyenduykhanghuflit@gmail.com',
      to: to,
      subject: subject,
      html: htmlContent,
   };

   return transporter.sendMail(options);
};

module.exports = {
   sendMail: sendMail,
};
