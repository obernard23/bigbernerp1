const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName} = require('../.env');
const customer = require("../modules/customers");
const { ObjectId } = require("mongodb");
const bills = require("../modules/Bills");



//this function sends quotation tocustomer  on singleill page

const sendQuot = async (req,res,next) => {

    if (ObjectId.isValid(req.params.id)) {
        try {
          await bills
            .findOne({ _id: new ObjectId(req.params.id) })
            .then(async(result) => {
            //get customer email address
            const date = new Date()
            const CustomerEmail = await customer.findOne({_id: result.customer})
            result.ActivityLog.unshift({logMsg:`Quotation sent to ${CustomerEmail.Username} on ${date.getDay()}/${date.getMonth()}/${date.getYear()}`,status:`Quotation sent`})
            result.save()
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
                    intro: `Your Quotation is here. Please make payment so we can continue with your order processing.`,
                    greeting: 'Dear',
                    signature: 'Sincerely',
                    
                    table: [
                        {
                            // Optionally, add a title to each table.
                            title: 'Orders',
                            data: result.orders.map(order =>{
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
                            data: result.promotionItems.map(item => {
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
                                    "price(N)": result.shippingFee
                                },
                                {
                                    item: 'Sub Total',
                                    "price(N)": result.subTotal
                                },
                                {
                                    item: 'Grand Total',
                                    "price(N)": result.grandTotal
                                }
                            ],
                          
                        }
                    ],
                    
                    action: [
                        {
                            instructions: `Please make payment using bill reference ${result.billReferenceNo} as payment description`,
                            button: {
                                color: '#22BC66',
                                text: 'Proceed to Payment',
                                link: `https://bigbern.onrender.com/wh-lagos/bill/${result._id}`
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
                res.status(200).json({ message: 'Customer will recive this Quote in thier email'})
            }).catch(error => {
                throw new Error(error.message)
            })

            });
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message:error.message})
        }
      }


    
    
    
};

module.exports = sendQuot
