const customer = require("../modules/customers");
const client = require('twilio')('AC68902380266ee09dbbbf6238728f930d', 'dbc59d53cbcf4f3cc1b98ff648d82293');
const Lead = require("../modules/Leads");
const Product = require("../modules/Product");
const Vendor = require("../modules/Vendors");
const { WHouse, storeProduct } = require("../modules/warehouse");
const Scrap = require('../modules/Scrap')
const Employe = require("../modules/Employees");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const sendMail = require("../Functions/SendBill");//for managers
const NotifyAccountant = require("../Functions/NotifyAccountant");//for Accountant
const VirtualstorageProduct = require('../modules/purchase')
const Appraisals = require('../modules/Appraisal')
const NotifyStoreKeeper = require('../Functions/NotifyStoreKeeper');
const Expense = require('../modules/Expense')
const NotifyCFO = require('../Functions/NotifyCFO')
var id = new mongoose.Types.ObjectId();
const bills = require("../modules/Bills");
const NaijaStates = require('naija-state-local-government');
const fs = require("fs");
const XLSX = require("xlsx");
var moment = require('moment'); 
const { accountSid,authToken} = require('../.env')

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

module.exports.Dashboard_get = async (req, res) => {
    let date = new Date()
    var responseDate = moment(date).format("dddd, MMMM Do YYYY,");
  res.render("dashboard", { title: "Dashboard", name: "Bigbern" ,responseDate});
};

module.exports.signup_get = (req, res) => {
  res.render("signup", { title: "Ecommerce", name: "BigBern" });
};

module.exports.signin_get = (req, res) => {
  res.render("SignIn", { title: "Ecommerce", name: "BigBern" });
};

module.exports.cart_get = (req, res) => {
  res.render("Cart", { title: "Ecommerce", name: "BigBern" });
};

module.exports.FAQ_get = (req, res) => {
  res.render("FAQ", { title: "Ecommerce", name: "BigBern" });
};

module.exports.index_get = (req, res) => {
  res.render("index", { title: "Ecommerce", name: "BigBern" });
};

module.exports.About_get = (req, res) => {
  res.render("About", { title: "Ecommerce", name: "BigBern" });
};

module.exports.Notification_get = async(req, res) => {
  const wHouse = await WHouse.findOne({_id:new ObjectId(req.params.WHID)})
  res.render("Notification", { title: "Ecommerce", name: "BigBern" ,result:wHouse});
};
module.exports.Register_get = async(req, res) => {
  const employees = await Employe.find()
  res.render("register-customer", { title: "Ecommerce", name: "BigBern" ,employees});
};

module.exports.Reset_get = (req, res) => {
  res.render("Reset", { title: "Ecommerce", name: "BigBern" });
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/SignIn");
};

module.exports.edith_get = async (req, res) => {
  res.render("Edit", { title: "Ecommerce", name: "BigBern" });
};

// register new employee
module.exports.Register_post = async (req, res) => {
  const { firstName, lastName, Email, telephone,workLocation,opsCode,password,Equiptment,
    HomeAddress,
    workTelephone,
    contract,
    skills,
    DOB,
    Appraisal,
    StateOfOringin,
    EmaergencyContact,
    NIN,
    BVN,
    AccountNumber,
    EmploymentStaus,
    StartDate,
    EndDate,
    EducationalQulification,
    staffId,
    role,
    manager,
    nextOfKin,
    Signature,
    image,
    Leave,
    workEmail,
    Department,
    coach,
    unit,
    Salary,
    document,
    status,
    jobTittle } = req.body;

  const salt = await bcrypt.genSalt();
  const handelPassword = await bcrypt.hash(password, salt);

  const saltOps = await bcrypt.genSalt();
  const handelOps = await bcrypt.hash(opsCode, saltOps);

  try {
    const NewEmploye = await Employe.create({
      firstName,
      lastName,
      Email,
      telephone,
      workLocation,
      opsCode:handelOps,
      password:handelPassword,
      workLocation,
      Equiptment,
      HomeAddress,
      workTelephone,
      contract,
      skills,
      DOB,
      Appraisal,
      StateOfOringin,
      EmaergencyContact,
      NIN,
      BVN,
      AccountNumber,
      EmploymentStaus,
      StartDate,
      EndDate,
      EducationalQulification,
      staffId,
      role,
      manager,
      nextOfKin,
      Signature,
      image,
      Leave,
      workEmail,
      Department,
      coach,
      unit,
      Salary,
      document,
      status,
      jobTittle
    })
    .then(result => res.status(200).json({result:'success'}));
  }catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}
;

//OnboardEmployee_get
module.exports.OnboardEmployee_get = async (req, res) => {
 const states = await NaijaStates.all();
 const Warehouse = await WHouse.find()
//  console.log(NaijaStates.lgas("Oyo"))
  const Employee = await Employe.find();
  res.status(200).render("employeeRegister", { name: "bigBern",states ,Employee,Warehouse});
};

module.exports.OnboardEmployee_post = async(req, res)=>{
  try {
    await Employe.create(req.body).then((employed)=>{
      if(employed){
        res.status(200).json({message:'successfully created. please activate new user account'})
      }else{
        throw new Error('Could not create. Something seems wrong. Please try again')
      }
    });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
};

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
      .then((result) => {
        if (result.acknowledged === true) {
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
  res.render("Create", { title: "Ecommerce", name: "BigBern", vendor });
};

//get and dispaly all vendor
module.exports.Vendors_get = async (req, res) => {
  const vendor = await Vendor.find();
  res.render("Vendors", { vendor, title: "Vendors", name: "BigBern" });
};

module.exports.VendorCreate_get = async (req, res) => {
  res.render("Vendor-create", { title: "Vendors", name: "BigBern" });
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
  res.render("Products", { Products, title: "Sales", name: "BigBern" });
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
  res.render("Customers", { Cusomers, title: "Sales", name: "BigBern" });
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
        res.status(500).json({error:'Fraud alert'})
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
          name: "BigBern",
          products
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
  res.render("stockMove", { Products, wareHouse,storeProducts, name: "BigBern" });
};

//create product in storeProduct collection 
module.exports.WareHouseStoreage_post = async (req, res) => {
  const { WHIDS,productId } = req.body;
  if (ObjectId.isValid(WHIDS) && ObjectId.isValid(productId)) {
    try {
      const wH = await WHouse.findById(ObjectId(WHIDS))
     await storeProduct.create({WHIDS,productId })
     .then(product => {
      product.ActivitiyLog.push({message: 'Product registered successfully by Administrator'})
      wH.Notification.push({message: 'New product has been created in your inventory catalog by Administrator. Please check your your inventory catalog'})
      product.save()
      wH.save()
      // send mail to ware house manager
      res.status(200).json({message: `Product registered successfully by Administrator.${wH.WHName} manager will be Notified`})
     })
    }catch (e) {
      res.status(500).json({Errormessage:e.message})
    };
  
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
  res.status(200).render('purchaseReplenish',{PurchasedProduct})
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
      res.status(404).render("", { error: error });
    }
  }
};

module.exports.vendor_get = async (req, res) => {
  //edit customer information
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
      "Grand Total (NGR)" : parseInt(data.grandTotal),
      "ShippingFee (NGR)": data.shippingFee,
      "Start Date": data.startDate,
      "Payment Method": data.paymentMethod,
      Orders: data.orders.length,
      Promotion: data.promotionItems.length,
      Status: data.billStatus,
      "Bank Account": data.bankAccount,
      "Discount %": data.discount,
      "Ware House":data.whId.toString(),
      "Sales Person": data.salesPerson,
      "Registered Balance":data.registeredBalance,
      "Reference No":data.billReferenceNo,
      "Bill Status":data.status
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
    await WHouse.findOne({ _id: ObjectId(req.params.whId) })
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
             await updatedBill.ActivityLog.unshift({logMsg:`Accountant Remarks: (${update.paymentMethod}:N${update.registeredBalance}) ,${update.remark}.`,status:updatedBill.billStatus})
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


// purchase controllers
module.exports.purchase_get = async(req, res, next)=>{
  const vendor = await Vendor.find();
  const products = await Product.find()
  res.render('vendorBill',{vendor,products,name:'Bigbern'});
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
  const Appraisal = await Appraisals.findOne({ $or: [{ title: query}]})
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
  res.status(200).render('SetupWarehouse',{warehouse,storeProducts,Products});
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
        log.ActivitiyLog.unshift({message:`${ req.body} quantity was sent From virtual ware house on `})
        log.save()
        product.virtualQty = product.virtualQty - log.pendings
        product.ActivityLog.unshift({message:`${ req.body.pendings} ${product.UMO} was transfered to ${wh.WHName} on ${new Date(Date.now()).toLocaleString()}`})
        product.save()
        res.status(200).json({message:`New batch transfered to ${wh.WHName} sucessfully `})
      }
    })
  
  }
}

// virtual ware house routes
module.exports.virtual_get = async(req, res, next)=>{
  res.status(200).render('virtual')
}

module.exports.virtual_Scrap = async(req, res, next)=>{
  const Scraps = await Scrap.find()
  const Products = await Product.find()
  const wH = await WHouse.find()
  res.status(200).render('Virtualscrap',{Scraps,wH,Products})
}