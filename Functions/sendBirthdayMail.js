const nodemailer = require("nodemailer");
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const Employe = require('../modules/Employees')
const birthdayTemplates = require('../EmailTemplates/birthdatTemplate')

async function sendBirtdaysEmail( ){
    const data = await Employe.findOne({Email:'bennygroove8@gmail'})
    const day = new Date().getDate()
    const month = new Date().getMonth() + 1
    console.log(data)

  let config = {
      service : 'gmail',
      auth : {
          user: EMAIL,
          pass: PASSWORD
      },
      tls : { rejectUnauthorized: false }//always add this to stop error in console   
  }

  let transporter = nodemailer.createTransport(config);
  
  let message = {
      from : EMAIL,
      to : 'bennygroove8@gmail.com',//employee email
      subject: `${ERPSmtpName} Birthday Celebrant`,
      html: birthdayTemplates()
  }
  
  transporter.sendMail(message).then(() => {
    console.log('birthday message sent')
    //   res.status(200).json( {message:''});
  }).catch(error => {
    console.log(error)
    //   res.status(404).json( {message: error.message});
  })
}


module.exports = sendBirtdaysEmail;
