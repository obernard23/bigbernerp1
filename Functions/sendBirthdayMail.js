const nodemailer = require("nodemailer");
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const Employe = require('../modules/Employees')
const birthdayTemplates = require('../EmailTemplates/birthdatTemplate')

async function sendBirtdaysEmail( ){

  const day = new Date().getDate()
  const month = new Date().getMonth() + 1

    const data = await Employe.find({blocked:false})
    .then((employee)=>{
     return employee.filter(celebrante=>{
      return celebrante.DOB.substring(0,3) === `${day}/${month}`
    })
    
    
    })

  let config = {
      service : 'gmail',
      auth : {
          user: EMAIL,
          pass: PASSWORD
      },
      tls : { rejectUnauthorized: false }//always add this to stop error in console   
  }

  let transporter = nodemailer.createTransport(config);
  

    //send mail to each email
       data.forEach((person) => {
        if(person){
          let message = {
            from : EMAIL,
            to : person.Email,//employee email
            subject: `Happy Birthday ${person.firstName} `,
            html: birthdayTemplates(person)
        }
        
        transporter.sendMail(message).then(() => {
          console.log('birthday message sent')
        }).catch(error => {
          console.log(error.message)
        })
           }
  })
  
}


module.exports = sendBirtdaysEmail;
