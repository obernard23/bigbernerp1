const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');


// this function sends mail to ware house manager 
const sendMail = async (result,wh) => {
    
    const wareHouseEmail = wh.Email
    let config = {
        service : 'gmail',
        auth : {
            user: EMAIL,
            pass: PASSWORD
        },
        tls : { rejectUnauthorized: false }//always add this to stop error in console   
    }

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
        theme: "salted",
        product : {
            name: 'BigBern',
            link : 'https://mailgen.js/',
            logo: 'https://mailgen.js/img/logo.png',
            copyright: 'Copyright © 2023 Bigbern.',
        }
    })

    let response = {
        body: {
        name : 'Manager',
        intro: "New Quotation  for review",
        action: [
            {
                instructions: 'To get view with this request, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Goto this  request',
                    link: `https://bigbern.onrender.com/${wh.WHName}/bill/${result._id}`
                }
            }
        ]
    },
        outro: "kind Regards"
    }
    
    let mail = MailGenerator.generate(response)
    
    let message = {
        from : EMAIL,
        to : wareHouseEmail,
        subject: `${ERPSmtpName} Operations`,
        html: mail
    }
    
    transporter.sendMail(message).then(() => {
        console.log("you should receive an email")
    }).catch(error => {
        console.log( error )
    })
    
    
};

module.exports = sendMail
