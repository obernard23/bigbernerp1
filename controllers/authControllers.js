const customer = require("../modules/customers");
const client = require('twilio')('AC68902380266ee09dbbbf6238728f930d', 'dbc59d53cbcf4f3cc1b98ff648d82293');
const Lead = require("../modules/Leads");
const Product = require("../modules/Product");
const Vendor = require("../modules/Vendors");
const { WHouse, storeProduct } = require("../modules/warehouse");
const Scrap = require('../modules/Scrap')
const Employe = require("../modules/Employees");
const VendorPayment = require('../modules/VendorBill')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const sendMail = require("../Functions/SendBill");//for managers
const NotifyAccountant = require("../Functions/NotifyAccountant");//for Accountant
const VirtualstorageProduct = require('../modules/purchaseOrder')
const Appraisals = require('../modules/Appraisal')
const NotifyStoreKeeper = require('../Functions/NotifyStoreKeeper');
const NotifyCFOPO = require('../Functions/NotifyCFOPO')
const PurchaseOrder = require('../modules/purchaseOrder')
const Expense = require('../modules/Expense')
const NotifyCFO = require('../Functions/NotifyCFO')
var id = new mongoose.Types.ObjectId();
const bills = require("../modules/Bills");
const NaijaStates = require('naija-state-local-government');
const fs = require("fs");
const XLSX = require("xlsx");
var moment = require('moment'); 
const { accountSid,authToken} = require('../.env')
let date = new Date()
var responseDate = moment(date).format("dddd, MMMM Do YYYY,");
const Account = require('../modules/BankAccount')
const CreditCustomerPayment = require('../modules/Creditpayment');
const Customer = require("../modules/customers");
const ProductTransfer = require("../modules/WHTransferLog");
const NotifyCustomerCreate = require('../Functions/NotifyCustomerCreate')
const companyRegister = require('../modules/company')
const EmployeeOnboarded = require('../Functions/EmployeeOnbord')

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", phone: "" };

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    errors.phone = "This Phone number is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "BigBern", {
    expiresIn: maxAge,
  });
};

//get user signature token
module.exports.Signature_get = async(req,res,next) =>{
 
  if (ObjectId.isValid(req.params.userId)) {
    try {
      await Employe.findById(req.params.userId)
      .then(async (user) =>{
        if(user){
          const auth = await bcrypt.compare(req.params.opInput, user.opsCode);
          if(auth){
            return res.status(200).json({signature:user.Signature})
          }else{
            throw new Error(`Wrong Passcode Entered`)
          }
        }else{
          throw new Error("No user found matching passcode")
        }
      })
    } catch (error) {
      res.status(404).json({error:error.message})
    }
  }
  next()
}



module.exports.companyRegister_get = async(req,res)=>{
  const states = await NaijaStates.all();
  const Business = await companyRegister.findOne()
  res.status(200).render('companyRegister',{states,Business})
}

module.exports.companyRegister_post = async(req,res,next)=>{
 try {
  const Business = await companyRegister.find()
  if(Business.length > 0){
    throw new Error ('company Already registered')
  }else{
    await companyRegister.create(req.body)
    .then((registerd)=>{
      if(registerd){
        next()
      }else{
        throw new Error('Registration failed')
      }
    })
  }
 
 } catch (error) {
  res.status(500).json({ error: error.message })
 }
  
}

module.exports.Dashboard_get = async (req, res) => {

  res.render("dashboard", { title: "Dashboard", name: "BADE" ,responseDate});
};

module.exports.signup_get = (req, res) => {
  res.render("signup", { title: "Ecommerce", name: "BADE" });
};

module.exports.signin_get = (req, res) => {
  res.render("SignIn", { title: "Ecommerce", name: "BADE",responseDate });
};

module.exports.cart_get = (req, res) => {
  res.render("Cart", { title: "Ecommerce", name: "BADE" });
};

module.exports.FAQ_get = (req, res) => {
  res.render("FAQ", { title: "Ecommerce", name: "BADE" });
};

module.exports.index_get = (req, res) => {
  res.render("index", { title: "Ecommerce", name: "BADE" });
};

module.exports.About_get = (req, res) => {
  res.render("About", { title: "Ecommerce", name: "BADE" });
};

module.exports.Notification_get = async(req, res) => {
  const wHouse = await WHouse.findOne({_id:new ObjectId(req.params.WHID)})
  res.render("Notification", { title: "Ecommerce", name: "BADE" ,result:wHouse});
};
module.exports.Register_get = async(req, res) => {
  const employees = await Employe.find()
  res.render("register-customer", { title: "Ecommerce", name: "BADE" ,employees});
};

module.exports.Reset_get = (req, res) => {
  res.render("Reset", { title: "Ecommerce", name: "BADE" });
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/SignIn");
};

module.exports.edith_get = async (req, res) => {
  res.render("Edit", { title: "Ecommerce", name: "BADE" });
};

// register new employee
module.exports.Register_post = async (req, res) => {
  

 try {
  await Employe.create(req.body).then((NewEmployee)=>{
    if(NewEmployee){
      res.status(200).json({message: 'New Employee Registered. You should send them an invite when you are ready to onboard them'})
    }else{
      throw new Error('Something went wrong')
    }
  })
 } catch (error) {
  res.status(500).json({ error: error.message })
 }

 
}
;

//OnboardEmployee_get
module.exports.OnboardEmployee_get = async (req, res) => {
 const states = await NaijaStates.all();
 const Warehouse = await WHouse.find()
//  console.log(NaijaStates.lgas("Oyo"))
  const Employee = await Employe.find();
  res.status(200).render("employeeRegister", { name: "BADE",states ,Employee,Warehouse});
};


// for onboarding
module.exports.OnboardEmployee_patch = async(req, res)=>{

  
  try {
    await Employe.findById(req.params.EmployeeId).then(async(employed)=>{
      if(!employed.firstTimeOnboard){
        // send onboarding mail notification
        let handelPassword = `${ Math.floor(Math.random()*12275)}${req.body.firstName.substring(0,4)}`
        // const saltOps 
        let handelOps = `${Math.floor(Math.random()*12369)}`

        const salt = bcrypt.genSaltSync(10);
        const hashpassword = bcrypt.hashSync(handelPassword, salt);
        const hashops = bcrypt.hashSync(handelOps, salt);
        // Store hash in your password DB.
        employed.password = hashpassword,
        employed.opsCode = hashops
        EmployeeOnboarded(employed,handelPassword,handelOps)//send mail to employee onboarded
        employed.save()
        res.status(200).json({message:'Onboardin mail sent sucessfully'});
      }else if(employed.firstTimeOnboard){
        await Employe.updateOne({_id:req.params.EmployeeId},{$set:req.body})
        .then((update)=>{
          if(update.acknowledged){
            res.status(200).json({message:'updated successfully'})
          }else{
            throw new Error('update failed')
          }
        })
      }else{
        throw new Error('Something seems wrong. Please try again')
      }
    });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
};

// single employee get
module.exports.getSingleEmployee_get = async (req,res) => {
  const states = await NaijaStates.all();
  const Employee = await Employe.findById(req.params.EmployeeId)
  const Warehouse = await WHouse.find()
  const WH = await WHouse.findById(Employee.workLocation)
  const Employees = await Employe.find();
  res.status(200).render('SingleEmployee',{Employee,WH,states,Warehouse,Employees})
}

//login
module.exports.signin_post = async (req, res) => {
  const { Email, password } = req.body;
  try {
    await Employe.findOne( {Email:Email} )
      .limit(1)
      .then(async (data) => {
        if (data) {
          const auth = await bcrypt.compare(password, data.password);
          if (auth) {
            const token = createToken(data._id);
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(200).json({ Newcustomer: data._id });
          } else {
            res.status(400).json({ errorPassword: "Wrong Password" });
          }
        } else {
          res.status(400).json({ errorMessage: "Not a registered Email" });
        }
      });
  } catch (e) {
    res.status(500).json({ serverError: "Something went wrong" });
  }
};

//for password reset
module.exports.ResetEmail_get = async (req, res,next) => {
  
  try {
    await Employe
      .findOne({ Email: req.params.EmailTOreset })
      .limit(1)
      .then(async (data) => {
        if (!data) {
          const errorMessage = "No user account Found";
          res.status(404)
          throw new Error(errorMessage)
        } else {
          next()
        }
      });
  } catch (err) {
    res.status(400).json({ err:err.message });
  }
};


//make patch request to update  an item
module.exports.ResetId_patch = async (req, res) => {
  let update = req.body;
 
  const salt =  await bcrypt.genSalt();
  const handelPassword  = await bcrypt.hash(update.password,salt)

  update.password = handelPassword

  if (ObjectId.isValid(req.params.id)) {
   
    await Employe
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: update})
      .then(async (result) => {
        if (result.acknowledged === true) {
          await Employe.findById(req.params.id).then((user)=>{
            user.status = 'active'
            user.firstTimeOnboard = true
            user.save()
          })
          const token = createToken(req.params.id );
          res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
          res.status(200).json({ Newcustomer: req.params.id });
        }else{
          throw new Error("Bad request");
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

// for Lead creation from footer
module.exports.Lead_post = async (req, res) => {
  const { Email } = req.body;
  try {
    await Lead.create({ Email });
    res.status(201).json({ Message: "registered" });
  } catch (err) {
    res.status(500).json({ ERROR: "Bad request" });
  }
};

// for sales module. please copy  when done

module.exports.ProductCreate_get = async (req, res) => {
  const vendor = await Vendor.find();
  res.render("Create", { title: "Ecommerce", name: "BADE", vendor });
};

//get and dispaly all vendor
module.exports.Vendors_get = async (req, res) => {
  const vendor = await Vendor.find();
  res.render("Vendors", { vendor, title: "Vendors", name: "BADE" });
};

module.exports.VendorCreate_get = async (req, res) => {
  res.render("Vendor-create", { title: "Vendors", name: "BADE" });
};

module.exports.VendorCreate_post = async (req, res) => {
  try {
    await Vendor.create(req.body);
    res.status(200).json({ Message: "New Vendor Registered" });
  } catch (e) {
    res.status(500).json({ error: "Something went Wrong" });
  }
};

// get all products
module.exports.Product_get = async (req, res) => {
  const Products = await Product.find();
  res.render("Products", { Products, title: "Sales", name: "BADE" });
};

//get single product
module.exports.SingleProduct_get = async (req,res) => {
  if (ObjectId.isValid(req.params.id)) {
    await Product.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (product) => {
        const vendor = await Vendor.find()
        res.status(200).render('ProductEdit',{ product ,vendor});
      });
  }
};

//get all ecomerce customers
module.exports.Customer_get = async (req, res) => {
  const Cusomers = await customer.find();
  res.render("Customers", { Cusomers, title: "Sales", name: "BADE" });
};

module.exports.ProductCreate_post = async (req, res) => {
  try {
    await Product.create(req.body).then(async function (product) {
      await VirtualstorageProduct.create({productsId: product._id})// register product with purchase request
    })
    res.status(200).json({ Message: "New Product Created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//product edit 
module.exports.Product_patch = async(req,res)=>{
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    Product.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then((Product) => {
        res.status(200).json({ result: "Product Updated" });
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update Product" });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
}

// get product from invoice
module.exports.productFind_get = async (req, res) => {
  
    await Product.findOne({ ACDcode: req.params.ACDcode})
      .limit(1)
      .then((item) => {
        res.status(200).json({ item });
      });
  
};

//get customer
module.exports.CustomerFind_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await customer
      .findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then((item) => {
        res.status(200).json({ item });
      });
  }
};

//for warehouse ops
module.exports.warehouse_get = async (req, res, next) => {
  const WHouses = await WHouse.find();
  const employees = await Employe.find();
  res.render("warehouse", { title: "Warehouse", WHouses,employees });
};

//post request for warehouse
module.exports.wareHouse_post = async (req, res) => {
  try {
    WHouse.create(req.body).then((result) => {
      res.status(200).json({
        success:
          "New ware House created. you should activate the ware house so operations can be performed",
      });
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

//to get warehouse Delivery for each ware house
module.exports.warehouseDelivery_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    await WHouse.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (item) => {
        await bills.find({ whId: new ObjectId(item._id)})
        .then(async (bill)=>{
          const AllBills = await bills.find({ whId: new ObjectId(item._id)})
         
            DeliveredBill = AllBills.filter((billed)=>{
              return billed.isDelivered === true
            })
          
          let Bills = await bill.filter(bill => {return bill.isDelivered === false  && bill.status === "Approved"})
          res.status(200).render("warehouseops", { result:item ,Bills,DeliveredBill});
        })
      });
  }
};

module.exports.delivery_get = async (req,res)=>{//sends json for delivery form
  const deliveryBill = await bills.findOne({billReferenceNo:req.params.deliveryId})
  const Customers = await customer.findById(new ObjectId(deliveryBill.customer));
  res.status(200).json({deliveryBill, Customers})
}

// update delivery action form ware house store keeper
module.exports.delivery_patch = async(req,res)=>{
  const update = req.body
  await bills.findOne({billReferenceNo:req.params.deliveryId})
  .then(async(done)=>{
      if(done.isDelivered) {
        res.status(500).json({error:'Fraud alert, This batch has already been delivered'})
      }else if(done.status !== 'Approved'){
        res.status(500).json({error:'This bill has not been approved. Please try again later'})
      }else{
        await bills.updateOne({billReferenceNo:req.params.deliveryId},{ $set: update })
    .then((response)=>{
      if(response.acknowledged){
        res.status(200).json({message:"Delivery acknowledged"})
      }else{
        res.status(500).json({error:'Something went wrong'})
      }
    })
      }
  })
  
}

// create invoice page
module.exports.Invoice_get = async (req, res) => {
  const Business = await companyRegister.findOne()
  const prud = await Product.find()
  const Cusomers = await customer.find();
  const products = await storeProduct.find({ WHIDS: new ObjectId(req.params.id)})

  if (ObjectId.isValid(req.params.id)) {
    await WHouse.findOne({ _id: ObjectId(req.params.id) })
    .limit(1)
    .then(async(item) => {
        res.render("createInvoice", {
          wareHouse: item,
          prud,
          Cusomers,
          title: "Vendors",
          name: "BADE",
          products,Business
        });
      });
  }
};

//Edit_patch request to update  a WHouse
module.exports.Edit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.WHID)) {
    WHouse.updateOne({ _id: ObjectId(req.params.WHID) }, { $set: req.body })
      .then((result) => {
        res.status(200).json({ result: "Ware House Updated" });
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update Ware House" });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

//edit customer information
module.exports.customerEdit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    await customer
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then((result) => {
        if (result.acknowledged === true) {
          res.status(200).json({ result: " Record Updated" });
        } else {
          throw new Error('something went wrong');
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

module.exports.stock_get = async (req, res) => {
  const Products = await Product.find();
  const wareHouse = await WHouse.find();
  const storeProducts = await storeProduct.find();
  const employees = await Employe.find();
  res.render("AllVirtualLocation", { Products, wareHouse,storeProducts,employees, name: "BADE" });
};

//create product in storeProduct collection

module.exports.WareHouseStoreage_post = async (req, res) => {

  const { WHIDS,productId } = req.body;

  const wH = await WHouse.findById(ObjectId(req.body.WHIDS))

  if (ObjectId.isValid(WHIDS) && ObjectId.isValid(productId)) {

    try {

     

       wareHouseProduct = await storeProduct.find({WHIDS:req.params.WHID})

      let productID =  wareHouseProduct.filter(product =>{

        return product.productId.toString() === req.body.productId.toString()

       

       })

     

       if (productID.length  > 0){

        throw new Error('this product has already been added to the store')

       }else{

        async function Register(){

          await storeProduct.create({WHIDS,productId })

          .then(registerdProduct => {

            registerdProduct.ActivitiyLog.push({message: `Product registered successfully by Administrator on ${responseDate}`})

            wH.Notification.push({message: `New product has been created in your inventory catalog by Administrator. on ${responseDate}`})

            registerdProduct.save()

            wH.save()

            // send mail to ware house manager

            res.status(200).json({message: `Product registered successfully by Administrator.${wH.WHName} manager will be Notified`})

          })

        }

        Register()

       }

 

    }catch (e) {

      res.status(500).json({Errormessage:e.message})

    };

 

  }else{

    res.redirect('/logout')

  };

}

//add product to ware house to recive array
module.exports.WareHouseStock_post = async (req, res) => {
  //find warehouse from request body
  const { WHName, Batch } = req.body;
  try {
    const w = await WHouse.findOne({ WHName })
      .limit(1)
      .then((item) => {
        const Notification = {
          body: `New batch of ${req.body.Batch.products.length} product was sent to your ware house on ${req.body.Batch.Date}`,
          _id: id,
        };
        item.toRecive.unshift(Batch);
        item.Notification.unshift(Notification);
        item.save();
      })
      .then((result) => {
        res.status(200).json({
          result: `Product has been sent to ${WHName.Manager} for the manager to validate`,
        });
      });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

//VirtualstorageProduct get
module.exports.VirtualstorageProduct_get = async (req,res) => {
  const PurchasedProduct = await Product.find()
  const wareHouse = await WHouse.find();
  res.status(200).render('virtualProduct',{wareHouse,PurchasedProduct})
}

// ..create bills
module.exports.WareHouseBill_post = async (req, res,next) => {

  try {
    await customer.findById(new ObjectId(req.body.customer))
    .then(async(customer) => {
     if(customer.category === 'Pay as Go'){
      //workflow for  pay as go customer  
      await bills.create(req.body).then(async (data) => {
        NotifyAccountant(data); //send notification to Accountant here
        res.status(200).json({
          message: `New Bill successfully Registered and Accountant has been notified for Payment confirmation.`,
        });
          });
     }else if(customer.category === 'Credit-Customer'){
      //send notification to manager if customer is a credit customer
      await bills.create(req.body).then(async (data) => {
         const wh = await WHouse.findById(new ObjectId(data.whId))
        sendMail(data,wh); //send notification to manager here
        res.status(200).json({
          message: `New Bill successfully Registered and Manager has been notified for confirmation.`,
        });
          });
     }else{
      throw new Error(`Could not register New Bill. Customer Category is not defined `)
     }
    })
  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all bills for each ware view
module.exports.WareHouseBill_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const wareHouse = await WHouse.findOne({
      _id: new ObjectId(req.params.id),
    });
    bills
      .find({ whId: new ObjectId(req.params.id) })
      .sort({startDate:-1})
      .then(async (Bills) => {
        const customers = await customer.find()
        const whBill = [];
        Bills.forEach((bill) => {
          whBill.push(bill);
        });
        res.status(200).render("Bills", { whBill, result: wareHouse ,customers});
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).send({ error: "Not a valid doc ID" });
  }
};

//get single bill
module.exports.WareHouseSingleBill_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    const Business = await companyRegister.findOne()
    Singlebill = await bills.findOne({ _id: new ObjectId(req.params.id) });
    await WHouse.findOne({ _id: new ObjectId(Singlebill.whId) }).then(
      async (warehouse) => {
        cust = await customer.findOne({
          _id: new ObjectId(Singlebill.customer),
        });
        res.status(201).render("Singlebills", {
          name: "Bigbern",
          Singlebill,
          warehouse,
          cust,
          Business
        });
      }
    );
  }
  next();
};

//approve bills for managers
module.exports.approveBill_patch = async (req, res,next) => {
  if (ObjectId.isValid(req.params.id)) {
     await bills.findOne({ _id: new ObjectId(req.params.id) }).then(async(bill) => {
      const warehouse = await WHouse.findById(new ObjectId(bill.whId))
      
     await customer.findById({ _id: new ObjectId(bill.customer)})
     .then((customer) => {
      if(customer.category === "Credit-Customer"){
        previousDebt =  customer.Debt  
        newDebt = previousDebt  + bill.subTotal
        if(newDebt > customer.creditLimit){
          res.status(404).json({message:"Customer Bill has exceeded credit Status "})
          
        }else{
        previousDebt =  customer.Debt  
        newDebt = previousDebt  + bill.subTotal
        customer.Debt = newDebt
        customer.save()
        
        const d = new Date();
      bill.status = "Approved";
      bill.ActivityLog.unshift({
        logMsg: `${warehouse.Manager.firstName} Approved  Bill on ${d.getFullYear()}-${
          d.getMonth() + 1
        }-${d.getDate()}`,
        status: "Approved, Store keeper to Release Products",
      });
      bill.save();

       //remove product from warehouse
       bill.orders.forEach(async (order) =>{
        await storeProduct.find({WHIDS: new ObjectId(bill.whId)})
        .then(async(products)=>{
          // filterproducts that are in warehouse to get product to deduct from
          todeduct = products.filter(prud =>{
            return prud.productId.toString() === order.item._id.toString()
          }).map(currentQty=>{return currentQty.currentQty})
        await storeProduct.updateOne({productId:order.item._id},{$set:{currentQty:todeduct - order.Qty}}) 
        })
       }); 

      res
        .status(200)
        .json({ message: "Store keeper will be Notified to Release Goods to Customer" });
        //create delivery here
        NotifyStoreKeeper(bill)//send emai to storekeeper
        }
      }else if(customer.category === "Pay as Go"  && bill.registeredBalance === bill.grandTotal){
     
        
        //create delivery here
        const d = new Date();
        bill.status = "Approved";
        bill.ActivityLog.unshift({
          logMsg: `${warehouse.Manager.firstName} Approved  Bill on ${d.getFullYear()}-${
            d.getMonth() + 1
          }-${d.getDate()}`,
          status: "Approved, Store keeper to Release Products",
        });
        bill.save();

         //remove product from warehouse
         bill.orders.forEach(async (order) =>{
          console.log(order)
           await storeProduct.find({WHIDS: new ObjectId(bill.whId)})
           .then(async(products)=>{
             // filterproducts that are in warehouse to get product to deduct from
             todeduct = products.filter(prud =>{
               return prud.productId.toString() === order.item._id.toString()
              }).map(currentQty=>{return currentQty.currentQty})

              await storeProduct.updateOne({productId:order.item._id},{$set:{currentQty:todeduct - order.Qty}}) 
              
          })
         }); 
    // store keeper to release goods
        NotifyStoreKeeper(bill)
        res
          .status(200)
          .json({ message: "Store keeper will be Notified to Release Goods to Customer" });
       
      }else if(customer.category === "Pay as Go"  && bill.registeredBalance !== bill.grandTotal){
        res
        .status(500)
        .json({ message: "Please await Accountant to Register payment on this bill" });
      }
          })
    });
  }
};

//send mail route to customer
module.exports.sendMail = async (req, res, next) => {
  next()
};

//get single customer information
module.exports.customer_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      await customer
        .findOne({ _id: new ObjectId(req.params.id) })
        .then(async(result) => {
          const employees = await Employe.find()
          res.status(200).render("SingleCustomer", { result, name: "BigBern" ,employees});
        });
    } catch (error) {
      res.status(404).render("404", { error: error });
    }
  }else{
    res.end()
  }
};

// create customer account
module.exports.CustomerRegister_post = async (req, res) => {
  try {
    await customer.create(req.body).
  then((newCustomer) => {
    if(newCustomer){
      NotifyCustomerCreate(newCustomer)//notify customer creation for activation
      res.status(200).json({message:'New customer has been registered successfully. the administrator will be notified to assign necessary permissions'})
    }else{
      throw new Error('Could not register customer ')
    }
  })
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

//get information
module.exports.vendor_get = async (req, res) => {
  Vendor.findOne({ _id: req.params.id }).then((vendor) => {
    res.status(200).render("singlevendor", { vendor, name: "Bigbern" });
  });
};

//patch request handler for vendors
module.exports.vendorEdit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    await Vendor.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then(async (result) => {
        if (result.acknowledged === true) {
          await Vendor.findOne({ id: req.params.id }).then((vend) => {
            vend.ActivityLog.push({ message: `Record ` });
            vend.save();
          });
          res.status(200).json({ result: " Record Updated" });
        } else {
          throw new Error();
        }
      })
      .catch((Error) => {
        res.status(500).json({ error: Error.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};


//payment routes
module.exports.Payment_get = async (req, res) =>{
  const Bill = await bills.find().sort({registeredBalance: 1})
  const customers = await customer.find()
  res.status(200).render('payment',{Bill,customers})
}

module.exports.RegisterPayment_get = async (req, res,next) =>{
  if (ObjectId.isValid(req.params.billId)) {
    Singlebill = await bills.findOne({ _id: ObjectId(req.params.billId) });
    const account = await Account.find({inactive:false})
    await WHouse.findOne({ _id: new ObjectId(Singlebill.whId) }).then(
      async (warehouse) => {
        cust = await customer.findOne({
          _id: new ObjectId(Singlebill.customer),
        });
        res.status(201).render("RegisterSinglebill", {
          name: "Bigbern",
          Singlebill,
          warehouse,
          cust,
          account
        });
      }
    );
  }
  next();
}


//export collection to work book spreadsheet  download spread sheet for ALL BILLS list
module.exports.BillsWorkBook_get = async (req, res, next) => {
  const workBook = XLSX.readFile("workbook.xlsx");

  const data = await bills.find({});

  //conver the xlsx to json format
  let workSheet = {};
  for (const sheetName of workBook.SheetNames) {
    workSheet[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
  }

  workSheet.Sheet1 = [];//clear sheet then populate sheet with new values
  data.forEach((data) => {
    //data from  req.body to register payments for accounting purposes
    workSheet.Sheet1.push({
      _id: `${data._id}`,
      customerId: data.customer.toString(),
      "Grand Total (₦)" : `₦${parseInt(data.grandTotal)}`,
      "ShippingFee (₦)": `₦${data.shippingFee}`,
      "Start Date": data.startDate,
      "Payment Method": data.paymentMethod,
      Orders: data.orders.length,
      Promotion: data.promotionItems.length,
      Status: data.billStatus,
      "Bank Account": data.bankAccount,
      "Discount %": data.discount,
      "raised By": data.RaiseBy,
      "Registered Balance":`₦${data.registeredBalance}`,
      "Reference No":data.billReferenceNo,
      "Bill Status":data.status,
      AccountantName:data.AccountantName
    });
  });

  XLSX.utils.sheet_add_json(workBook.Sheets["Sheet1"], workSheet.Sheet1);
  XLSX.writeFile(workBook, "workbook.xlsx");
  res.status(200).download("workbook.xlsx");

  // console.log("json:\n",JSON.stringify(workSheet.Sheet1),"\n\n")
  
};

//get only product for specific ware house
module.exports.WareHouseStoreage_get = async(req,res,next) =>{
  if (ObjectId.isValid(new ObjectId(req.params.whId))) {
    await WHouse.findOne({ _id:new ObjectId(req.params.whId) })
      .limit(1)
      .then(async(item) => {
        const prud = await Product.find()
        products = await storeProduct.find({ WHIDS: new ObjectId(item._id)})
        res.status(200).render("wareHouseProduct", { result: item ,products,prud});
      });
      next()
  }else{
    res.redirect('/logout')
  }
}

//update product in ware house product
module.exports.WareHouseStoreage_patch = async(req,res,next) => {
  const {update} = req.body
  if (ObjectId.isValid(new ObjectId(req.params.whId))) {
   try {
    await storeProduct.updateOne({ _id: ObjectId(req.params.whId) }, { $set: update})
    .then(async (bill) =>{
      if(bill.acknowledged) {
       
        await storeProduct.findOne(new ObjectId(req.params.whId)).then((product)=>{
          product.ActivitiyLog.unshift({message:`Manager accepted ${update.qtyApproved} on ${responseDate}`})
          product.save()
        })
        res.status(200).json({ message:'Product updated successfully'})
      }else{
        throw new Error('Something seems to be wrong')
      }
    })
   } catch (error) {
    res.status(500).json({ error:error.message })
   }
  }else{
    res.redirect('/logout')
  }
}


//register payment
module.exports.RegisterPayment_patch = async(req, res,next) => {
  const {update} = req.body
  if (ObjectId.isValid(new ObjectId(req.params.id))) {
    try {
      //first find the bill 
      await bills.findById(new ObjectId(req.params.id))
      .then(async function(updatedBill) {
       if(updatedBill.grandTotal === parseInt(update.registeredBalance)){
        await bills.updateOne({ _id: ObjectId(req.params.id) }, { $set: update})
         .then(async (bill) =>{
           if(bill.acknowledged){
             await updatedBill.ActivityLog.unshift({logMsg:`${update.AccountantName} Remarks: (${update.paymentMethod}:₦${update.registeredBalance}) ,${update.remark}.`,status:updatedBill.billStatus})
             updatedBill.save()
            //  remove product from ware house productt list
            // find warehouse product by bill ware house id
             next()//send mail to manager
           }else{
             throw new Error('Something seems to be wrong')
           }
         })
       }else{
        throw new Error('Payment must be in full')
       }
    
    })
   } catch (error) {
    res.status(500).json({ error:error.message })
   }
  }
};

//FOR DASHBOARD
module.exports.Report_get = async(req, res, next)=>{
  res.render('reports',{});
}

// get product from invoice
module.exports.vendorFind_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await Vendor.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then((item) => {
        res.status(200).json({ item });
      });
  }
};


// aprraisal get
module.exports.Appraisal_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await Employe.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then((item) => {
        res.status(200).render('Appraisal',{item})
      });
  }else{
    res.redirect('/logout')
  }
  
};


// sends json response for single employee 
module.exports.WareHouseManager_get = async (req, res) => {
  const employee = await Employe.findById(new ObjectId(req.params.employeeId))
  res.status(200).json(employee)
};

module.exports.Appraisal_post = async (req,res) => {
await Appraisals.create(req.body).then(() => {
  res.status(200).json({message:'Appraisal Submited Successfully'})
});
res.end()
};

module.exports.AppraisalsManagement_get = async (req,res)=>{//from dashboard
 const Appraisal = await Appraisals.find()
 const Employee = await  Employe.find();
  res.status(200).render('AppraisalsManagement',{Appraisal,Employee})
}

module.exports.query_get = async (req, res, next) => {
  const query = req.params.query
  
  const Appraisal = await Employe.findOne({ $text: { $search: query } })
  res.json(Appraisal)
}

//for expense controller  
module.exports.expense_get =  async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    await WHouse.findOne({ _id: new ObjectId(req.params.WHID) })
      .limit(1)
      .then(async (item) => {
        const Expenses = await Expense.find({WHID:new ObjectId(item._id)})
        const employee = await Employe.findOne(Expenses.initiatorId)
        res.status(200).render('Expense',{result:item,Expenses,employee} )
      })
    } else{
      res.redirect('/logout')
    }
}

//post request for expense 
module.exports.expense_post = async(req, res, next) => {
  if (ObjectId.isValid(req.params.WHMANAGER)) {
    try {
      await Expense.create(req.body)
    .then(expense => {
      NotifyCFO(expense)
        res.status(200).json({message:`accountant will be notified of expense No: ${expense.refNo} creation`})
    })
    } catch (error) {
      res.status(500).json({error: error.message})
    }
  }else{
    res.redirect('/logout')
  }
}

module.exports.scrap_get = async(req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    try {
      await WHouse.findOne({ _id: new ObjectId(req.params.WHID) })
      .limit(1)
      .then(async (item) => {
        const Scraps = await Scrap.find({WHID:item._id})
        const prud = await Product.find()
        const products = await storeProduct.find({WHIDS:req.params.WHID})
        res.status(200).render('Scrap',{result:item,Scraps,prud,products} )
      })
    } catch (error) {
      res.status(500).json({error:error.message});
    }
  }else{
    res.redirect('/logout')
  }
}


module.exports.Scrap_patch = async(req, res, next) => {
  if (ObjectId.isValid(req.params.WHMANAGER)) {
    try {
      await Scrap.create(req.body)
      .then((scraped) => {
        next()
      })
    } catch (error) {
      res.status(500).json({error: error.message})
    }
  }else{
    res.redirect('/logout')
  }
}



//GET ROUTE FOR WHOUSE STAF
module.exports.staff_get = async(req, res, next)=>{
  if (ObjectId.isValid(req.params.WHID)) {
  const Employee = await Employe.find({workLocation:req.params.WHID})
  res.status(200).render('wareHouseStaff',{Employee})
  }else{
    res.redirect('/logout')
  }
}

//GET ROUTE FOR REPLENISH 
module.exports.replenish_storeproduct = async(req,res,next)=>{
  if(ObjectId.isValid(req.params.WHID)){
    const prud = await Product.find()
    const products = await storeProduct.find({WHIDS:req.params.WHID})
    res.status(200).render('wareHouseReplenish',{products,prud})
  }else{
    res.redirect('/logout')
  }
}

module.exports.wareHouse_Purchase = async(req,res,next)=>{
  if(ObjectId.isValid(req.params.WHID)){
    const vendor = await Vendor.find();
    const products = await storeProduct.find({WHIDS:req.params.WHID})
    res.status(200).render('warehousePurchase',{vendor,products})
    // res.send('hello world')
  }
}

module.exports.WareHouseSetup_get = async(req,res)=>{
 
  if(ObjectId.isValid(req.params.WHID)){
  const warehouse =  await WHouse.findById(new ObjectId(req.params.WHID));
  const storeProducts = await storeProduct.find({WHIDS:new ObjectId(req.params.WHID)})
  const Products = await Product.find()
  const purchaseOrder = await PurchaseOrder.find()
  res.status(200).render('SetupWarehouse',{warehouse,storeProducts,Products,purchaseOrder});
  }
};

// send product to different warehouse inventory
module.exports.Inventory_patch  = async (req, res, next) => {
  if(ObjectId.isValid(req.params.WHID)){
    const pendings = req.body
    const product = await Product.findById(req.params.STOREID)
    const wh = await WHouse.findById(req.params.WHID)
      
    await storeProduct.updateOne({ _id: ObjectId(req.params.PRODID) }, { $set: pendings})
    .then(async(response)=>{
      if(response.acknowledged){
        log = await storeProduct.findById(req.params.PRODID)
        log.ActivitiyLog.unshift({message:`${ req.body.pendings} ${product.UMO} was transfered From virtual ware house on ${new Date(Date.now()).toLocaleString()} with batch ref ${req.body.Batch_Ref}`})
        log.save()
        product.virtualQty = product.virtualQty - log.pendings
        product.ActivityLog.unshift({message:`${ req.body.pendings} ${product.UMO} was transfered to ${wh.WHName} on ${new Date(Date.now()).toLocaleString()} with batch ref ${req.body.Batch_Ref}`})
        product.save()
        res.status(200).json({message:`New batch transfered to ${wh.WHName} sucessfully `})
      }
      else{
        res.status(500).json({error:`Something went wrong`})
      }
    })
  
  }else{
    res.redirect('/logout')
  }
}

// virtual ware house routes
module.exports.virtual_get = async(req, res, next)=>{
  res.status(200).render('virtual')
}

//VIRTUAL 
module.exports.virtual_Scrap = async(req, res, next)=>{
  const Scraps = await Scrap.find()
  const Products = await Product.find()
  const wH = await WHouse.find()
  res.status(200).render('Virtualscrap',{Scraps,wH,Products})
}

module.exports.SingleScrap_get = async (req, res)=>{
 try {
  const scraps = await Scrap.findById(new ObjectId(req.params.ID))
  .then(async(scrap)=>{
    await storeProduct.findById(new ObjectId(scrap.storeProductId))
   .then(async(store)=>{
    const products  = await Product.findById(new ObjectId(store.productId))
    console.log(products)
    res.status(200).render('SingleScrap',{products,scrap })
  })
  })
 } catch (error) {
  console.log(error)
 }finally {
  res.end()
 }
}

//expense get for cfo
module.exports.CFexpense_get = async(req,res)=>{
  const Expenses = await Expense.find()
  const WHID = await WHouse.find()
  res.status(200).render('CFexpense',{Expenses,WHID})
}



// lading page for accountants
module.exports.paymentLanging_get = async(req, res)=>{
  res.status(200).render('AccountantLanding')
}

//purchase lading page
module.exports.PurchaseLanding_get = async(req, res)=>{
  res.status(200).render('PurchaseLanding')
}

// purchase controllers
module.exports.PurchaseRequestForm_get = async(req, res, next)=>{
  const Business = await companyRegister.findOne()
  const vendor = await Vendor.find();
  const products = await Product.find()
  res.render('PurchaseRequestForm',{vendor,products,Business});
}

//PurchaseOrder_get
module.exports.PurchaseOrder_get = async (req, res,next) => {
  const purchaseOrder = await PurchaseOrder.find()
  const vendor = await Vendor.find()
  res.status(200).render('PurchaseOrder',{purchaseOrder,vendor})
};

// purchaserequest post
module.exports.PurchaseOrder_post = async(req, res, next) => {
  await PurchaseOrder.create(req.body)
  .then(async(purchased) => {

   const NewPayment = {
    billReferenceNo:req.body.billReferenceNo,
    Amount:req.body.grandTotal,
    Vendor:req.body.Vendor
  }
    await VendorPayment.create(NewPayment).then((payment)=>{
      purchased.orders.forEach(async(order)=>{
        const product = await Product.findById( order.item._id)
        const update = product.virtualQty + order.Qty
        await Product.updateOne({ _id: ObjectId(order.item._id) }, { $set: {virtualQty: update}})
      })
        //   let date = new Date()
        // var responseDate = moment(date).format("dddd, MMMM Do YYYY,");
        // product.ActivityLog.unshift({ message: `New batch Was registered in to Virtual ware House on${responseDate}. P.O ref${NewPayment.billReferenceNo}`})
        // product.save()
        // notify cfo email
        NotifyCFOPO(purchased)
        res.status(200).json({message:'Product quantity updated successfully.We will notify the Cfo to register payment'})
    })
  })
}

module.exports.PurchaseRequest_get = async (req, res, next) => {
  
  res.status(200).render('PurchaseRequest',{})
}

//CFOVendorBill_get
module.exports.CFOVendorBill_get = async(req,res, next) => {
  const VendorBills = await VendorPayment.find()
  const vendor = await Vendor.find()
  res.status(200).render('CFOVendorBill',{VendorBills,vendor})
}

// register payment for vendor bills
module.exports.CFOVendorBill_patch = async (req, res, next) => {
 try {
  await VendorPayment.updateOne({ billReferenceNo: req.params.BillId}, { $set: req.body})
  .then((response)=>{
    if(response.acknowledged){
      res.status(200).json({ message:'Payment updated successfully'})
    }else{
      throw new Error('Something went wrong')
    }
  })
 } catch (error) {
  res.status(500).json({error: error.message})
 } finally {
  next()
 }
}

// get single PO 
module.exports.SinglePurchasebillReferenceNo_get = async (req, res,next) => {
 try {
  await PurchaseOrder.findOne({billReferenceNo: req.params.billReferenceNo})
  .then(async(result) => {
    const vendor = await Vendor.findById(new ObjectId(result.Vendor))
    const Acconuts = await Account.find() 
    const VendorPayments = await VendorPayment.findOne({billReferenceNo: req.params.billReferenceNo})
    res.status(200).render('SinglePurchaseBillReference',{Singlebill:result,vendor,Acconuts,VendorPayments})
  })
 } catch (error) {
  res.status(500).json({error: error.message})
  }finally{
  next()
 }
}




// patch to return backto virtual warehouse
module.exports.ProductReturn_patch = async(req,res,next) => {
 try{
  virtualStorageQty = await Product.findById(req.params.id)
 const wH = await WHouse.findById(req.body.WHIDS)
 const storeProd = await storeProduct.findById(req.body.storeProductId)

 const update = parseInt(virtualStorageQty.virtualQty) + parseInt(req.body.virtualQty)
  await storeProduct.updateOne({ _id: ObjectId(req.body.storeProductId) }, { $set: {pendings: 0}})
  await  Product.updateOne({ _id: ObjectId(req.params.id) }, { $set: {virtualQty: update}})
  virtualStorageQty.ActivityLog.unshift({message:`${wH.WHName} Returned ${req.body.virtualQty}${virtualStorageQty.UMO} on ${responseDate} new Virtual QTY is now ${update}`})
  storeProd.ActivitiyLog.unshift({message:`Returned ${req.body.virtualQty}${virtualStorageQty.UMO} back to Virtual warehouse on ${responseDate}`})
  storeProd.save()
  virtualStorageQty.save()

  next()
 }catch(err){
  res.status(500).json({error:err.message})
 }
}


//cfo expense get
module.exports.SingleExpense_get = async(req,res)=>{
    if(ObjectId.isValid(req.params.id)){
    try {
      const Accounts = await Account.find()
      const expense = await Expense.findById(new ObjectId(req.params.id)).
      then(async(expense)=>{
        const wH = await WHouse.findById(expense.WHID)
        res.status(200).render('SingleExpense',{expense,wH,Accounts})
      })

    } catch (error) {
      console.log(error)
    }
  }else{
    res.end()
  }
}

//SingleExpense_patch REGISTER PAYMENT ON EXPENSE
module.exports.SingleExpense_patch = async (req,res)=>{
 
 try {
  await Expense.updateMany({ _id: ObjectId(req.params.EXPID) }, { $set: req.body})
  .then((updae)=>{
   if(updae){
    res.status(200).json({message:'Payment recorded sucessfully.'})
   }else{
    throw new Error('Something went wrong')
   }
  })
 } catch (error) {
  res.status(500).json({error: error.message})
 }
}

//send json for product list 
module.exports.productsJson_get = async (req,res) => {
  const productsJson = await Product.find({Vendor: ObjectId(req.params.vendorID)})
  res.status(200).send(productsJson)
}

///Credit/customers get 
module.exports.CreditCustomers_get = async (req,res) =>{
 const creditCustomes = await customer.find({category:'Credit-Customer'})
 const Acconuts = await Account.find()
 const creditPayment = await  CreditCustomerPayment.find()
 res.status(200).render('CreditPayment', {creditCustomes,Acconuts,creditPayment})
}


// for AccountSettingLanding
module.exports.AccountSettingLanding_get =async(req,res)=>{
  const account = await Account.find()
  res.render('AccountSettingLanding',{account});
}

// to create bank ,account
module.exports.BankAccount_post = async(req,res)=>{
 try {
  await Account.create(req.body)
  .then((account)=>{
    if(account){
      res.status(200).json({message:`${account.NAME} added to list of account`})
    }else{
      throw new Error('something went wrong')
    }
  })
 } catch (error) {
  res.status(500).json({message:error.message})
 }
}

//register customer payment
module.exports.registerCustomerPayment_post = async (req,res)=>{

    await CreditCustomerPayment.create(req.body)
  .then(async(payment)=>{
    let customer =  await Customer.findById( ObjectId(payment.customer))
    const debt  = customer.Debt
    customer.Debt =  parseInt(debt) - parseInt(payment.Amount)
    customer.save()
    payment.ActivityLog.unshift({message:"New payment recorded successfully"})
    payment.save()
    res.status(200).json({message:"New payment recorded successfully"})
  })
}

// for transfers logs to ware house
module.exports.productTransferLogs_get = async (req,res) =>{

 const transferLogs =  await ProductTransfer.find()
 const WHous = await WHouse.find()
  res.status(200).render('ProductTransferLanding',{transferLogs,WHous})

}

// SingleProductTransfer_get 
module.exports.SingleProductTransfer_get = async (req,res)=>{
      if (ObjectId.isValid(req.params.TRANSFERREF)) {
        try {
          const transferLog =  await ProductTransfer.findOne({_id:new ObjectId(req.params.TRANSFERREF)})
          const Whouse = await WHouse.findById(new ObjectId(transferLog.WHID))
          res.status(200).render('SingleProductTransfer',{transferLog,Whouse})
        } catch (error) {
          console.log(error)
        }
    }else{
      res.end()
    }
}

//product trasferform
module.exports.ProductTransferForm_get = async (req, res,next) => {
  
    try {
      const WHous = await WHouse.find()
      const PurchaseOrders = await PurchaseOrder.find()
      res.status(200).render('ProductTransferForm',{WHous,PurchaseOrders})
    } catch (error) {
      console.log(error)
    }finally {
      res.end()
    }
}


// get warehouse json data for product transfer form
module.exports.wareHouseJson_get = async (req, res) => {
  try{
    
  const WHous = await WHouse.findOne({_id:req.params.WHID})
  const storeproduct = await storeProduct.find({WHIDS:req.params.WHID})
  const products = await Product.find()
  res.json({WHID:WHous._id,products,storeproduct}) 

  }catch(err){
    res.end() 
  }
}

// post for product transfer
module.exports.ProductTransferForm_post = async(req, res, next)=>{
 try {
  await ProductTransfer.create(req.body).then((product)=>{
    if(product){
      res.status(200).json({message:'Batch loged successfully'})
    }else{
      throw new Error('Product transfer failed')
    }
  })
 } catch (error) {
  res.status(500).json({error: error.message})
 }
}