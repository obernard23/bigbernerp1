const { Router } = require('express');
const authController = require('../controllers/authControllers')
const {requireAuth,checkUser} = require('../middleware/authmidddleware')
const {checkResetUser,checkLoginUser} = require('../middleware/checkUser')
const {checkUserRole,ManagerAccess} = require("../middleware/userRole");
const ValidStockTransfer = require('../warehouseValidation/warehouseValidate')
const bills = require('../modules/Bills');
// form here to generate pdf invoice
// const easyinvoice = require('easyinvoice');
// const fs = require('fs');
// const path =  require('path');
// ends here to generate pdf invoice

const router = Router()

router.get('*',checkUser)
router.get('/signup',requireAuth,authController.signup_get);
router.get('/SignIn',authController.signin_get);
router.get('/Cart',authController.cart_get);
router.get('/FAQ',authController.FAQ_get);
router.get('/index',authController.index_get);//check this out
router.get('/About',authController.About_get);
router.get('/Notification',requireAuth,authController.Notification_get);
// router.get('/register',requireAuth,authController.Register_get);
router.get('/Reset',authController.Reset_get);
router.get('/logout',requireAuth,authController.logout_get);
router.get('/Edit/Account',requireAuth,authController.edith_get);
router.get('/employee',requireAuth,authController.OnboardEmployee_get)

router.post('/register',requireAuth,authController.Register_post);
router.post('/SignIn',checkLoginUser,authController.signin_post);
router.post('/Reset/account',checkResetUser,authController.Reset_post);
router.post('/Register-lead',requireAuth,authController.Lead_post);
router.patch('/Reset-password/:id/Security',authController.ResetId_patch);
router.post('/employee/Onboard/:id',requireAuth,checkUserRole,authController.OnboardEmployee_get)///check this

//for erp pls cut out when done 
router.get('/Product/Create-new',requireAuth,authController.ProductCreate_get);
router.post('/Product/Create-new',requireAuth,authController.ProductCreate_post);
router.post('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_post);
router.get('/Products',requireAuth,authController.Product_get);
router.get('/Ecommerce/Customers',requireAuth,authController.Customer_get);
router.get('/Sales/Vendor',requireAuth,authController.Vendors_get);
router.get('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_get);

//for payment
router.get('/Sales/Payment/:id',requireAuth,authController.Payment_get);
router.get('/Register/bill/:id/:billId',requireAuth,authController.RegisterPayment_get)
router.patch('/bill/register/:id',authController.RegisterPayment_patch)//register bill 

router.get(`/product/:id/bill`,requireAuth,authController.productFind_get);
router.get('/customer/:id/search',requireAuth,authController.CustomerFind_get);

//warehouseops
router.get('/warehouse/:id/employeeLocation',requireAuth,ValidStockTransfer,authController.warehouse_get);
router.post('/warehouse/create-new',requireAuth,authController.wareHouse_post);
router.get('/Location/:id',requireAuth,authController.warehouseById_get);
router.get('/warehouse/:id/Invoices/new',requireAuth,authController.Invoice_get);
router.get('/stock-move',requireAuth,authController.stock_get);//for inventory move
router.patch('/warehouse/:id/edit',requireAuth,authController.Edit_patch);
router.post(`/wareHouseToTransfer`,requireAuth,authController.WareHouseStoreage_post);//here to post toWareHouse
router.post(`/wareHouseToTransfer/toRecive`,requireAuth,authController.WareHouseStock_post);//use this for deliveries
router.post('/wareHouse/Bill',requireAuth,authController.WareHouseBill_post);
router.get(`/warehouse/:id/Bills`,requireAuth,authController.WareHouseBill_get);
router.get(`/:WHName/bill/:id`,requireAuth,authController.WareHouseSingleBill_get);
router.patch(`/bill/:id/approved`,requireAuth,authController.approveBill_patch);
router.get('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_get)//get products for specific ware house
router.patch('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_patch)

// //generate pdf on the fly
// router.get('/invoice/:billId', requireAuth,async (req, res, next) => {
  
//     // IMAGE PATH
//     let imgPath = path.resolve('public', 'icon.png');
//     // Function to encode file data to base64 encoded string
//     function base64_encode(img) {
//         // read binary data
//         let png = fs.readFileSync(img);
//         // convert binary data to base64 encoded string
//         return new Buffer.from(png).toString('base64');
//     };
//     // DATA OBJECT
//     let data = {
//         "documentTitle": "RECEIPT", //Defaults to INVOICE
//         "currency": "NGR",
//         "taxNotation": "vat", //or gst
//         "marginTop": 25,
//         "marginRight": 25,
//         "marginLeft": 25,
//         "marginBottom": 25,
//         // "logo": `${base64_encode(imgPath)}`, //or base64
//         // "logoExtension": "png", //only when logo is base64
//         "sender": {
//             "company": "BigBern Developers",
//             "address": "Somewhere in Canada",
//             "zip": " ABuja streets",
//             "city": "FCT",
//             "country": "IT"
//             //"custom1": "custom value 1",
//             //"custom2": "custom value 2",
//             //"custom3": "custom value 3"
//         },
//         "client": {
//                "company": "Client Corp",
//                "address": "Clientstreet 456",
//                "zip": "4567 CD",
//                "city": "Clientcity",
//                "country": "Clientcountry"
//             //"custom1": "custom value 1",
//             //"custom2": "custom value 2",
//             //"custom3": "custom value 3"
//         },
//         "invoiceNumber": "2020.0001",
//         "invoiceDate": "05-01-2020",
//         "products": [
//             {
//                 "quantity": "2",
//                 "description": "odoo",
//                 "tax": 6,
//                 "price": 7000
//             },
//             {
//                 "quantity": "4",
//                 "description": "tesla",
//                 "tax": 21,
//                 "price": 3000
//             }
//         ],
//         "bottomNotice": "Thanks for doing business with us."
//     };
//     // INVOICE PDF FUNCTION
//     const invoicePdf = async ()=>{
//     //Create your invoice! Easy!
//     let result = await easyinvoice.createInvoice(data);
//     new fs.writeFile(`./invoice/invoice.pdf`, result.pdf, 'base64');
// }
// invoicePdf();
// res.status(200).download("./invoice/invoice.pdf");

// })
 
 


//get user signature
router.get(`/users/:userId/:opInput`,requireAuth,authController.Signature_get);


// send mail to  customer   account
router.get(`/sendmail/:id`,requireAuth,authController.sendMail)


//customer routesfor get, patch and delete
router.get("/Dashboard/:userid",requireAuth, authController.Dashboard_get);
router.get(`/customer/:id/edit`,requireAuth,authController.customer_get);
router.patch(`/customer/update/:id`,requireAuth,authController.customerEdit_patch)

router.get(`/vendor/:id/edit`,requireAuth,authController.vendor_get);
router.patch(`/vendor/update/:id`,requireAuth,authController.vendorEdit_patch);

//dashboard 
router.get('/Report', authController.Report_get)

//getting work book to exce; for All bills
router.get('/bills/excel',requireAuth,authController.BillsWorkBook_get)
module.exports = router;

// [
//     {
//         "quantity": "2",
//         "description": "Test1",
//         "tax": 6,
//         "price": 33.87
//     },
//     {
//         "quantity": "4",
//         "description": "Test2",
//         "tax": 21,
//         "price": 10.45
//     }
// ]