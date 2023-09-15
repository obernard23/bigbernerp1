const { Router } = require('express');
const authController = require('../controllers/authControllers')
const {requireAuth,checkUser} = require('../middleware/authmidddleware')
const {checkResetUser,checkLoginUser} = require('../middleware/checkUser')
const {checkUserRole,ManagerAccess} = require("../middleware/userRole");
const {ValidStockTransfer,adminWareHouseSetUp} = require('../warehouseValidation/warehouseValidate')
const bills = require('../modules/Bills');
const NotifyManagerPayment = require('../Functions/NotifyManager');
const restPassword = require("../Functions/resetPasword");
const fs = require('fs');
const sendQuot = require("../Functions/sendQuot");
const pdf = require("pdf-creator-node");
const { ObjectId } = require('mongodb');
const NotifyAccountant = require('../Functions/NotifyAccountant');
const employe = require('../modules/Employees')
const NotifyScrap = require('../Functions/NotifyScrap')
const NotifyWhTovir = require('../Functions/NotifyWhTovir')
const WelcomeMessageHandler = require('../Functions/WelcomeMessageHandler')

const router = Router()

router.get('*',checkUser)
router.get('/signup',requireAuth,authController.signup_get);
router.get('/SignIn',authController.signin_get);
router.get('/Cart',authController.cart_get);
router.get('/FAQ',authController.FAQ_get);
router.get('/index',authController.index_get);//check this out
router.get('/About',authController.About_get);
router.get('/Notification/:WHID',requireAuth,authController.Notification_get);
router.get('/register-NEW',requireAuth,authController.Register_get);
router.get('/Reset',authController.Reset_get);
router.get('/logout',requireAuth,authController.logout_get);
router.get('/Edit/Account',requireAuth,authController.edith_get);
router.get('/employee',requireAuth,authController.OnboardEmployee_get)
router.get('/Appraisal/:id',requireAuth,authController.Appraisal_get)//for employee to form view
router.post('/Appraiasl/Employee/Apraisal',authController.Appraisal_post)
router.get('/Appraisals/:id',authController.AppraisalsManagement_get)//for top management view    

router.post('/register/employee',authController.Register_post);//to create new employee but not activated
router.get('/employe/:EmployeeId',requireAuth, authController.getSingleEmployee_get)
router.post('/SignIn',checkLoginUser,authController.signin_post);
router.get('/Reset/account/:EmailTOreset',authController.ResetEmail_get,restPassword);
router.post('/Register-lead',requireAuth,authController.Lead_post);
router.patch('/Reset-password/:id/Security',authController.ResetId_patch);
router.patch('/employee/Onboard/:EmployeeId',requireAuth,authController.OnboardEmployee_patch)//patch request for employee login

router.get('/employee/:employeeId',requireAuth,async(req,res)=>{//get json for all employees
    const employee = await employe.findById(new ObjectId(req.params.employeeId))
    res.status(200).json(employee)
})
//for erp pls cut out when done 

router.post('/Product/Create-new',requireAuth,authController.ProductCreate_post);
router.post('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_post);
router.get(`/product/:ACDcode/bill`,requireAuth,authController.productFind_get);//get product with json format for quotation purposes
router.get('/Products',requireAuth,authController.Product_get);
router.patch('/Products/:id/edit',requireAuth,authController.Product_patch);
router.patch('/Products/:id/return',requireAuth,authController.ProductReturn_patch,NotifyWhTovir)//return product to virtual and logs message 
router.get('/Product/:id/:name',requireAuth,authController.SingleProduct_get)

router.get('/Ecommerce/Customers',requireAuth,authController.Customer_get);
router.post('/Sales/Register-customer',requireAuth,authController.CustomerRegister_post)
router.get('/customer/:id/search',requireAuth,authController.CustomerFind_get);
router.get(`/customer/:id/edit`,requireAuth,authController.customer_get);
router.patch(`/customer/update/:id`,requireAuth,authController.customerEdit_patch)

router.get('/Sales/Vendor',requireAuth,authController.Vendors_get);
router.get('/Sales/Register-Vendor',requireAuth,authController.VendorCreate_get);

//for payment 
router.get('/Sales/Payment/Home/:id',requireAuth,authController.paymentLanging_get)
router.get('/Sales/Payment/:id',requireAuth,authController.Payment_get);
router.get('/Register/bill/:id/:billId',requireAuth,authController.RegisterPayment_get)//acountatnt is and bill id
router.patch('/bill/register/:id',requireAuth,authController.RegisterPayment_patch,NotifyManagerPayment)//register bill 


//warehouseops
router.get('/warehouse/:id/employeeLocation',requireAuth,ValidStockTransfer,authController.warehouse_get);
router.post('/warehouse/create-new',requireAuth,authController.wareHouse_post);
router.get('/Location/:id',requireAuth,authController.warehouseDelivery_get);//id refrences user id
router.get('/warehouse/:id/Invoices/new',requireAuth,authController.Invoice_get);
router.get('/stock-move',requireAuth,authController.stock_get);//for inventory move
router.get('/VirtualstorageProduct',requireAuth,authController.VirtualstorageProduct_get)//add url to frontend today
router.patch('/warehouse/:ADMINID/:WHID/edit',requireAuth,adminWareHouseSetUp,authController.Edit_patch);//edith ware house 
router.patch('/outbound/:ADMINID/:WHID/:PRODID/:STOREID/edit',requireAuth,adminWareHouseSetUp,authController.Inventory_patch);
router.post(`/wareHouseToTransfer/:WHID`,requireAuth,authController.WareHouseStoreage_post);//here to post toWareHouse
router.post(`/wareHouseToTransfer/toRecive`,requireAuth,authController.WareHouseStock_post);//use this for deliveries
router.post('/wareHouse/Bill',requireAuth,authController.WareHouseBill_post,NotifyAccountant);//to post bill
router.get(`/warehouse/:id/Bills`,requireAuth,authController.WareHouseBill_get);//GET BILL BY WAREHOUSE ID
router.get(`/:WHName/bill/:id`,requireAuth,authController.WareHouseSingleBill_get);//approve page for manager for new bill
router.patch(`/bill/:id/approved`,requireAuth,authController.approveBill_patch);//to approve bills for manager to store keeper
router.get('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_get);//get products for specific ware house
router.patch('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_patch);
router.get('/Employee/:employeeId',requireAuth,authController.WareHouseManager_get)
router.get('/SetUp/:WHID/:ADMINID',requireAuth,adminWareHouseSetUp,authController.WareHouseSetup_get)

// delivery routes
router.get('/delivery/:deliveryId',requireAuth,authController.delivery_get);//sends json response for single bills
router.patch('/delivery/:deliveryId',requireAuth,authController.delivery_patch);//update delivery status of bill
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


//get user signature
router.get(`/users/:userId/:opInput`,requireAuth,authController.Signature_get);


// send mail to  customer   account
router.get(`/sendmail/:id`,requireAuth,authController.sendMail,sendQuot);


//customer routesfor get, patch and delete
router.get("/Dashboard/:userid",requireAuth, authController.Dashboard_get);

router.get(`/vendor/:id/edit`,requireAuth,authController.vendor_get);
router.patch(`/vendor/update/:id`,requireAuth,authController.vendorEdit_patch);

//dashboard 
router.get('/Report', authController.Report_get)

//getting work book to exce; for All bills
router.get('/bills/excel',requireAuth,authController.BillsWorkBook_get)

//query global search parameters
router.get('/search/:query',authController.query_get)

//warehouse expense
router.get('/Expense/:WHID',requireAuth,authController.expense_get)
router.post('/Expense/:WHMANAGER',requireAuth,ManagerAccess,authController.expense_post)

//SCRAP API
router.get('/Scrap/:WHID',requireAuth,authController.scrap_get)
router.post('/Scrap/:WHMANAGER',requireAuth,ManagerAccess,authController.Scrap_patch,NotifyScrap)

router.get('/Staff/:WHID',requireAuth,authController.staff_get)//get staff by the location 
router.get('/Replenish/:WHID/storeproduct',requireAuth,authController.replenish_storeproduct)
router.get('/warehouse/purchase/:WHID',requireAuth,authController.wareHouse_Purchase)


// virtual warehouse routes
router.get('/VIRTUAL/:ADMINID',requireAuth,adminWareHouseSetUp,authController.virtual_get)
router.get('/VIRTUAL/SCRAP/:ADMINID',requireAuth,adminWareHouseSetUp,authController.virtual_Scrap)
router.get('/scrap/single/:ID',requireAuth,authController.SingleScrap_get)
router.get('/Product/Create-new',requireAuth,authController.ProductCreate_get);//add virtual to url
router.get('/VIRTUAL/Purchase/:ADMINID',requireAuth,adminWareHouseSetUp,authController.PurchaseLanding_get)
//purchse routers
router.get('/purchase/:ADMINID',requireAuth,authController.PurchaseRequestForm_get)
router.get('/vendor/:id',requireAuth,authController.vendorFind_get)// kept at mind cant find url
router.get('/Virtual/Purchase/Order/:ADMINID',requireAuth,adminWareHouseSetUp,authController.PurchaseOrder_get)
router.get(`/Vendorproduct/:vendorID`,requireAuth,authController.productsJson_get)//json to get product by vendorID
router.get("/Virtual/Purchase/Request/:ADMINID",requireAuth,adminWareHouseSetUp,authController.PurchaseRequest_get)
router.post('/Virtual/Purchase/Order/:ADMINID',requireAuth,adminWareHouseSetUp,authController.PurchaseOrder_post)
router.get('/Purchase/bill/:billReferenceNo',requireAuth,authController.SinglePurchasebillReferenceNo_get)
router.get('/Virtual/Product/TransferLogs/:ADMINID',requireAuth,adminWareHouseSetUp,authController.productTransferLogs_get)// for transfers to warehouse log
router.get('/Virtual/Product/TransferForm/:ADMINID',requireAuth,adminWareHouseSetUp,authController.ProductTransferForm_get)
router.post('/TransferForm/:ADMINID',requireAuth,adminWareHouseSetUp,authController.ProductTransferForm_post)//transfer log to warehouse
router.get('/warehouse/json/:WHID',requireAuth,authController.wareHouseJson_get)//SENDS WHID,STOREPRODUCT PER WHID,PRODUCT LIST
router.get('/Transfer/:TRANSFERREF',requireAuth,authController.SingleProductTransfer_get)

// SET UP COMPANY details

router.get('/Company/Register/:ADMINID',requireAuth,adminWareHouseSetUp,authController.companyRegister_get)
router.post('/company/register/:ADMINID',requireAuth,adminWareHouseSetUp,authController.companyRegister_post,WelcomeMessageHandler);
// expense routes
router.get('/CFO/EXPENSE/:CFOID',requireAuth,authController.CFexpense_get)
router.patch('/Expense/edit/:EXPID/:CFOID',requireAuth,authController.SingleExpense_patch)
router.get('/Vendor/Bills/:CFOID',requireAuth,authController.CFOVendorBill_get)
router.patch('/Vendor/Bill/:BillId',requireAuth,authController.CFOVendorBill_patch)
router.get('/EXP/:id',requireAuth,authController.SingleExpense_get)
router.get('/AccountSettingLanding/:id',requireAuth,authController.AccountSettingLanding_get)
router.post('/Bank/Account/create',requireAuth,authController.BankAccount_post)

// accountant routes
router.get('/Credit/customers',requireAuth,authController.CreditCustomers_get)
router.post('/CREDIT/log',requireAuth,authController.registerCustomerPayment_post)

module.exports = router;
