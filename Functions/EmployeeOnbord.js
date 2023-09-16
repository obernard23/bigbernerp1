const nodemailer = require("nodemailer");
const Onboarded = require('../EmailTemplates/onboardTemplate');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const Employe = require('../modules/Employees')


const EmployeeOnboarded = async (data,handelPassword,handelOps) => {
    
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
        to : data.Email,
        subject: `Bade Onboarding`,
        html: Onboarded(data,handelPassword,handelOps)
    }
    
    transporter.sendMail(message).then(() => {
       console.log('mail sent successfully')
    }).catch(error => {
        console.log(error.message)
    })
    
    
};

module.exports = EmployeeOnboarded
