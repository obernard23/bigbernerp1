const { Router } = require('express');
const authController = require('../controllers/authControllers')
const {requireAuth,checkUser} = require('../middleware/authmidddleware')
const {checkResetUser,checkLoginUser} = require('../middleware/checkUser')
const {checkUserRole,ManagerAccess} = require("../middleware/userRole");
const ValidStockTransfer = require('../warehouseValidation/warehouseValidate')
const bills = require('../modules/Bills');
const NotifyManagerPayment = require('../Functions/NotifyManager');
const restPassword = require("../Functions/resetPasword");
const fs = require('fs');
const sendQuot = require("../Functions/sendQuot");
const pdf = require("pdf-creator-node");
const { ObjectId } = require('mongodb');
const sendBirtdaysEmail = require('../Functions/sendBirthdayMail');

const router = Router()

router.get('*',checkUser)
router.get('/signup',requireAuth,authController.signup_get);
router.get('/SignIn',authController.signin_get);
router.get('/Cart',authController.cart_get);
router.get('/FAQ',authController.FAQ_get);
router.get('/index',authController.index_get);//check this out
router.get('/About',authController.About_get);
router.get('/Notification',requireAuth,authController.Notification_get);
router.get('/register-NEW',requireAuth,authController.Register_get);
router.get('/Reset',authController.Reset_get);
router.get('/logout',requireAuth,authController.logout_get);
router.get('/Edit/Account',requireAuth,authController.edith_get);
router.get('/employee',requireAuth,authController.OnboardEmployee_get)
router.get('/Appraisal/:id',requireAuth,authController.Appraisal_get)//for employee to form view
router.post('/Appraiasl/Employee/Apraisal',authController.Appraisal_post)
router.get('/Appraisals/:id',authController.AppraisalsManagement_get)//for top management view    

router.post('/register',requireAuth,authController.Register_post);
router.post('/SignIn',checkLoginUser,authController.signin_post);
router.get('/Reset/account/:EmailTOreset',authController.ResetEmail_get,restPassword);
router.post('/Register-lead',requireAuth,authController.Lead_post);
router.patch('/Reset-password/:id/Security',authController.ResetId_patch);
router.post('/employee/Onboard/:id',requireAuth,checkUserRole,authController.OnboardEmployee_get)///check this

//for erp pls cut out when done 
router.get('/Product/Create-new',requireAuth,authController.ProductCreate_get);
router.post('/Product/Create-new',requireAuth,authController.ProductCreate_post);
router.post('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_post);
router.get(`/product/:id/bill`,requireAuth,authController.productFind_get);//get product with json format for quotation purposes
router.get('/Products',requireAuth,authController.Product_get);
router.patch('/Products/:id/edit',requireAuth,authController.Product_patch);
router.get('/Product/:id/:name',requireAuth,authController.SingleProduct_get)
router.get('/Ecommerce/Customers',requireAuth,authController.Customer_get);
router.get('/Sales/Vendor',requireAuth,authController.Vendors_get);
router.get('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_get);

//for payment
router.get('/Sales/Payment/:id',requireAuth,authController.Payment_get);
router.get('/Register/bill/:id/:billId',requireAuth,authController.RegisterPayment_get)
router.patch('/bill/register/:id',requireAuth,authController.RegisterPayment_patch,NotifyManagerPayment)//register bill 


router.get('/customer/:id/search',requireAuth,authController.CustomerFind_get);

//warehouseops
router.get('/warehouse/:id/employeeLocation',requireAuth,ValidStockTransfer,authController.warehouse_get);
router.post('/warehouse/create-new',requireAuth,authController.wareHouse_post);
router.get('/Location/:id',requireAuth,authController.warehouseById_get);
router.get('/warehouse/:id/Invoices/new',requireAuth,authController.Invoice_get);
router.get('/stock-move',requireAuth,authController.stock_get);//for inventory move
router.get('/VirtualstorageProduct',requireAuth,authController.VirtualstorageProduct_get)//add url to frontend today
router.patch('/warehouse/:id/edit',requireAuth,authController.Edit_patch);
router.post(`/wareHouseToTransfer`,requireAuth,authController.WareHouseStoreage_post);//here to post toWareHouse
router.post(`/wareHouseToTransfer/toRecive`,requireAuth,authController.WareHouseStock_post);//use this for deliveries
router.post('/wareHouse/Bill',requireAuth,authController.WareHouseBill_post);//to post bill
router.get(`/warehouse/:id/Bills`,requireAuth,authController.WareHouseBill_get);
router.get(`/:WHName/bill/:id`,requireAuth,authController.WareHouseSingleBill_get);//approve page for manager for new bill
router.patch(`/bill/:id/approved`,requireAuth,authController.approveBill_patch);//to approve bills for manager
router.get('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_get);//get products for specific ware house
router.patch('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_patch);
router.get('/Employee/:employeeId',requireAuth,authController.WareHouseManager_get)
// GENERATE PDF FOR BILL
router.get('/invoice/:billId', requireAuth,async (req, res, next)=>{
    const bill = await bills.findById(new ObjectId(req.params.billId)).limit(1).lean()
    const template = fs.readFileSync("./quotationTemplate.html", "utf-8");
   const option ={
    format:'a4',
    orientation:'portrait',
    border:'10mm'
   }

   const document = {
    html:template,
    data: bill//uses template for handle bars
    ,
    path:`./invoice/new_invoice${bill.billReferenceNo}.pdf`,
   }
   await new pdf.create(document,option).then((pdf) => {
    res.status(200).download(`./invoice/new_invoice${bill.billReferenceNo}.pdf`)
   })
   .catch((err) => {
    res.status(500).send("OOPS SOMETHIG IS WRONG ")
   })
} )



// send  birthday mail automatically
setInterval( () => {
    sendBirtdaysEmail()
},86400000)//this should log 24hrs
 

//get user signature
router.get(`/users/:userId/:opInput`,requireAuth,authController.Signature_get);


// send mail to  customer   account
router.get(`/sendmail/:id`,requireAuth,authController.sendMail,sendQuot);


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

//purchse routers
router.get('/purchase',requireAuth,authController.purchase_get)
router.get('/vendor/:id',requireAuth,authController.vendorFind_get)
module.exports = router;
