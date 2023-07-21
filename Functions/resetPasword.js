const nodemailer = require("nodemailer");
const PasswordReset = require('../EmailTemplates/PasswordResetTemplate');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');


const restPassword = async (data,otp) => {
    
    
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
        subject: `${ERPSmtpName} password reset`,
        html: PasswordReset(otp)
    }
    
    transporter.sendMail(message).then(() => {
        console.log("you should receive an email")
    }).catch(error => {
        console.log( error )
    })
    
    
};

module.exports = restPassword
