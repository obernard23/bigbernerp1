const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const { ObjectId } = require("mongodb");
const bills = require('../modules/Bills')
const {WHouse} = require('../modules/warehouse')


// sends notification to raise delivery note / waybill to WH manager
const NotifyManagerPayment = async (req,res,next) => {
    const bill = await bills.findById( new ObjectId(req.params.id))
    
    const wareHouseEmail = await WHouse.findById(new ObjectId(bill.whId)).then((warehouse) =>{
        return warehouse.Manager.Email;
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
        name : 'Store keeper',
        intro: "New Delivery to sort",
        action: [
            {
                instructions: 'To get view with this request, please click here:',
                button: {
                    color: '#22BC66',
                    text: `Raise WayBill ${bill.billReferenceNo}`,
                    link: `https://bigbern.onrender.com/wh-lagos/bill/${bill._id}`
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
    res.status(200).json({ message:'Payment acknowledged. Ware House Stock keeper will receive notification'})
    next()
    }).catch(error => {
        res.status(500).json({ message: error.message })
    })
    
    
};

module.exports = NotifyManagerPayment
