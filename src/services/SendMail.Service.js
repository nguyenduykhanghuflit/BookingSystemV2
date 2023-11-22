const nodeMailer = require('nodemailer');
require('dotenv').config();
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const sendMail = (to, subject, htmlContent) => {
   const transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
         user: 'phuchoang07092003@gmail.com', //thay mail 
         pass: 'odxr qxml bbsz laty',
      },
   });

   const options = {
      from: 'phuchoang07092003@gmail.com',
      to: to,
      subject: subject,
      html: htmlContent,
   };

   return transporter.sendMail(options);
};

module.exports = {
   sendMail: sendMail,
};
