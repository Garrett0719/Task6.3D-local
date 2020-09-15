
var nodemailer = require('nodemailer');
 
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: 'kapgarry0719@gmail.com',
      pass: 'Yyhmxdzh0719!'
  }
});
 
exports.send = function(mailOptions) {
  mailOptions = mailOptions ? mailOptions : {
      from: '"YuhaoYang" <kapgarry0719@gmail.com>',
      to: mail, 
      subject: '',
      text: '', 
      html: '' 
  };
 
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
}