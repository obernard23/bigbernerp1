const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const customer = require("../modules/customers");

const sendQuot = async (params) => {

    //get customer email address
    const CustomerEmail = await customer.findOne({_id: params.customer})
    
    
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
            name : CustomerEmail.Username,
            intro: `Your Quotation is here. Please make payment before ${params.dueDate}`,
            greeting: 'Dear',
            signature: 'Sincerely',
            
            table: [
                {
                    // Optionally, add a title to each table.
                    title: 'Orders',
                    data: params.orders.map(order =>{
                        return {
                            Product :order.item.Name,
                            Qty:order.Qty,
                            Vat:order.item.VAT,
                           "Price(N)" : `${order.item.selling_Price}`,
                            Scale:order.item.UMO,
                            "Total(N)": `${order.total}`,
                        }
                    }),
                },

                //for promotion
                {
                    // Optionally, add a title to each table.
                    title: 'Promotions',
                    data: params.promotionItems.map(item => {
                        return{
                            'Item':'Nothing added for this promotion'
                        }
                    })
                },


                {
                    // Optionally, add a title to each table.
                    title: 'Cummulative',
                    data: [
                        {
                            item: 'Delivery',
                            "price(N)": params.shippingFee
                        },
                        {
                            item: 'Sub Total',
                            "price(N)": params.subTotal
                        },
                        {
                            item: 'Grand Total',
                            "price(N)": params.grandTotal
                        }
                    ],
                  
                }
            ],
            
            action: [
                {
                    instructions: `Please make payment to ${params.bankAccount}, using bill reference 1234567 as payment description`,
                    button: {
                        color: '#22BC66',
                        text: 'Proceed to Payment',
                        link: `https://bigbern.onrender.com/wh-lagos/bill/${params._id}`
                    }
                }
            ],
            outro: "Looking forward to do more business"
        }
    }

    let mail = MailGenerator.generate(response)

    
    let message = {
        from : EMAIL,
        to : CustomerEmail.Email,
        subject: `${ERPSmtpName} Quotation`,
        html: mail
    }
    
    transporter.sendMail(message).then(() => {
        console.log("you should receive an email")
        return 'you should receive an email'
    }).catch(error => {
        console.log( error )
        return error.message
    })
    
    
};

module.exports = sendQuot
