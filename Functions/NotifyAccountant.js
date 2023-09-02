const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const Employee = require('../modules/Employees');
const Bills = require('../modules/Bills');


// this function sends mail to ware house manager 
const NotifyAccountant = async (data) => {
   const bill =  await Bills.findById(data.id)//find bill 

   await Employee.find({jobTittle:'Accountant'})
    .then((Accontant) => {
        Accontant.forEach( person => {
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
                name : `Accountant ${person.firstName}`,
                intro: `New Bill Payment for REF ${data.billReferenceNo} to review`,
                action: [
                    {
                        instructions: `Total Amount to collect / Register: N${data.grandTotal}K. Also ensure to upload proof of payment`,
                        button: {
                            color: '#22BC66',
                            text: `Acknowledge Payment for bill ${data.billReferenceNo}`,
                            link: `https://bigbern.onrender.com/Register/bill/${person._id}/${data._id}`
                        }
                    }
                ]
            },
                outro: "kind Regards"
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//accountant email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(() => {
                console.log("you should receive an email")
            }).catch(error => {
                console.log( error )
            })
        });
    })
    
};

module.exports = NotifyAccountant
