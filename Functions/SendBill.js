const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');


// this function sends mail to ware house manager 
const sendMail = async (result,wh) => {
    
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
            name: 'BADE',
                    link : 'https://mailgen.js/',
                    logo: 'bade.jpg',
                    copyright: `© ${date.getFullYear()} BADE.`,
        }
    })

    let response = {
        body: {
        name : 'Manager',
        intro: "New Quotation  for review",
        action: [
            {
                instructions: 'To view with this request, please click here:',
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
        to : wh.Manager.Email,
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
