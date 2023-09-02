const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const vendor = require('../modules/Vendors');
const Employee = require('../modules/Employees');
const VendorBill = require('../modules/VendorBill')
var moment = require('moment'); 


// this function sends mail to ware house manager 
const NotifyCFOPO = async (purchased) => {
    let date = new Date()
    var responseDate = moment(date).format("dddd, MMMM Do YYYY,");
   const Vendor =  await vendor.findById(purchased.Vendor)//find bill 
   await Employee.find({jobTittle:'CFO'})
    .then((CFO) => {
        CFO.forEach( person => {
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
                    logo: 'https://mailgen.js/img/logo.png',
                    copyright: `© ${date.getFullYear()} BADE.`,
                }
            })
        
            let response = {
                body: {
                    name : `CFO`,
                    intro: `New Vendor Bill from virtual ware house for ${Vendor.Name} to Review.`,
                    greeting: 'Dear',
                    signature: 'Sincerely',
                    
                    table: [
                        {
                            // Optionally, add a title to each table.
                            title: `Ref:${purchased.billReferenceNo}, P.O Date: ${responseDate} `,
                            data: [
                                {
                                    From:'Virtual Ware House',
                                    Vendor : Vendor.Name.toLowerCase(),
                                    Account :Vendor.Account_num,
                                    Bank: Vendor.Bank_name.toLowerCase(),
                                    "NGN": purchased.grandTotal,
                                }
                            ]
                        },
                    ],
                    action: [
                        {
                            instructions: `To view Purchse Order please contact the Administrator `,
                            button: {
                                color: '#22BC66',
                                text: 'View Vendor Bill',
                                // link: `https://bigbern.onrender.com/invoice/${result._id}`
                            }
                        }
                    ],
                    outro: `Thanks for your speedy response (${person.firstName})`
                }
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//cfo email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(async() => {
            console.log('mail sent')
            }).catch(error => {
              console.log(error)
            })
        });
    })
    
};

module.exports = NotifyCFOPO
