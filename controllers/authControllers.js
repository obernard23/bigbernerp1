const customer = require("../modules/customers");
const Lead = require("../modules/Leads");
const Product = require("../modules/Product");
const Vendor = require("../modules/Vendors");
const { WHouse, storeProduct } = require("../modules/warehouse");
const Employe = require("../modules/Employees");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const sendMail = require("../Functions/SendBill");

const restPassword = require("../Functions/resetPasword");
var id = new mongoose.Types.ObjectId();
const bills = require("../modules/Bills");
// const NaijaStates = require('naija-state-local-government');
const fs = require("fs");
const XLSX = require("xlsx");
var moment = require('moment'); 
const { response } = require("express");

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

module.exports.Dashboard_get = (req, res) => {
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

module.exports.Notification_get = (req, res) => {
  res.render("Notification", { title: "Ecommerce", name: "BigBern" });
};
module.exports.Register_get = (req, res) => {
  res.render("register", { title: "Ecommerce", name: "BigBern" });
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

// register
module.exports.Register_post = async (req, res) => {
  const { firstName, lastName, Email, telephone,workLocation,opsCode,password } = req.body;

  const salt = await bcrypt.genSalt();
  const handelPassword = await bcrypt.hash(password, salt);

  const saltOps = await bcrypt.genSalt();
  const handelOps = await bcrypt.hash(opsCode, saltOps);

  try {
    const Newcustomer = await Employe.create({
      firstName,
      lastName,
      Email,
      telephone,
      workLocation,
      opsCode:handelOps,
      password:handelPassword
    }).then(result => res.status(200).json({result:'success'}));
    // const token = createToken(Newcustomer._id);
    // res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    // res.status(201).json({ Newcustomer: Newcustomer._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

//OnboardEmployee_get
module.exports.OnboardEmployee_get = async (req, res) => {
//  const states = await NaijaStates.all();
//  console.log(NaijaStates.lgas("Oyo"))
  const Employee = await Employe.find();
  res.status(200).render("employeeRegister", { name: "bigBern" ,Employee});
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
  const {
    Name,
    Categories,
    image,
    contact,
    vendor_tel,
    mobile_tel,
    email,
    Address,
    Manufacturer,
    w_Location,
    status,
    block_vendor,
    Account_num,
    Account_name,
    Bank_name,
  } = req.body;
  try {
    await Vendor.create({
      Name,
      Categories,
      image,
      contact,
      vendor_tel,
      mobile_tel,
      email,
      Address,
      Manufacturer,
      w_Location,
      status,
      block_vendor,
      Account_num,
      Account_name,
      Bank_name,
    });
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

//get all ecomerce customers
module.exports.Customer_get = async (req, res) => {
  const Cusomers = await customer.find();
  res.render("Customers", { Cusomers, title: "Sales", name: "BigBern" });
};

module.exports.ProductCreate_post = async (req, res) => {
  const {
    Name,
    category,
    image,
    WareHouse_Price,
    Market_Price,
    Van_Price,
    vendor_Price,
    Vendor,
    UMO,
    color,
    Description,
    Sellable,
    Ecom_sale,
    Manufacturer,
    Manufacture_code,
    product_code,
    ACDcode,
    VAT,
  } = req.body;

  try {
    await Product.create(req.body);
    res.status(200).json({ Message: "New Product Created" });
  } catch (err) {
    res.status(500).json({ Message: err.message });
  }
};

// get product from invoice
module.exports.productFind_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await Product.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then((item) => {
        res.status(200).json({ item });
      });
  }
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
  res.render("warehouse", { title: "Warehouse", WHouses });
};

//post request for warehouse
module.exports.wareHouse_post = async (req, res) => {
  const {
    WHName,
    Manager,
    WHIDS,
    Location,
    Tel,
    Email,
    state,
    InvoiceNo,
    others,
    Status,
  } = req.body;
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

//to recieve for each ware house
module.exports.warehouseById_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    await WHouse.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then((item) => {
        res.status(200).render("warehouseops", { result: item });
      });
  }
};

// create invoice page
module.exports.Invoice_get = async (req, res) => {
  const prud = await Product.find()
  const Cusomers = await customer.find();
  const products = await storeProduct.find({ WHIDS: new ObjectId(req.params.id)})
  console.log(products)
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
  console.log(update);
  // const salt = await bcrypt.genSalt();
  // const handelPassword  = await bcrypt.hash(update,salt).toString()
  if (ObjectId.isValid(req.params.id)) {
    WHouse.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then((result) => {
        res.status(200).json({ result: "Updated" });
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update document" });
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
          throw new Error();
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
    console.log(e);
    res.status(400).json({ error: e.message });
  }
};

// ..create bills
module.exports.WareHouseBill_post = async (req, res) => {
  const {
    grandTotal,
    shippingFee,
    subTotal,
    startDate,
    dueDate,
    customer,
    paymentMethod,
    orders,
    promotionItems,
    billStatus,
    status,
    bankAccount,
    discount,
    taxRate,
    whId,
    salesPerson,
    signatureUrl,
    ActivityLog,
    rejectionReasons,
  } = req.body;

  try {
    await bills.create(req.body).then(async (data) => {
      await WHouse.findOne({ _id: whId })
        .limit(1)
        .then((wh) => {
          if (wh) {
            sendMail(data, wh.Email); //send notification to managre here
            res.status(200).json({
              message: `New Bill successfully Registered and ${wh.Manager} has been notified for review.`,
            });
          } else {
            throw new Error("Not Authorized");
          }
        });
    });
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

//approve bills
module.exports.approveBill_patch = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await bills.findOne({ _id: new ObjectId(req.params.id) }).then((bill) => {
      const d = new Date();
      bill.status = "Approved";
      bill.ActivityLog.unshift({
        logMsg: `Mary ann fidelis Approved  Quoataion on ${d.getFullYear()}-${
          d.getMonth() + 1
        }-${d.getDate()}`,
        status: "Approved and Pending payments conirmation",
      });
      bill.save();
      res
        .status(200)
        .json({ message: "Approved and Pending payments conirmation" });
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
        .then((result) => {
          res.status(200).render("SingleCustomer", { result, name: "BigBern" });
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
  console.log(update);
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
        res.status(200).json({ message:'Product Qty updated successfully'})
      }else{
        throw new Error('Something seems to be wrong')
      }
    })
   } catch (error) {
    res.status(500).json({ error:error.message })
   }
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
      // find customer and scheck for debit and credit lines
      const customers = await customer.findById(new ObjectId(updatedBill.customer))
      if(customers.Debt ===  0 && update.registeredBalance === updatedBill.grandTotal ){
        await bills.updateOne({ _id: ObjectId(req.params.id) }, { $set: update})
        .then(async (bill) =>{
          if(bill.acknowledged){
            await updatedBill.ActivityLog.unshift({logMsg:`Accountant Remarks: (${update.paymentMethod}:N${update.registeredBalance}) ,${update.remark}.`,status:updatedBill.billStatus})
            updatedBill.save()
            next()
          }else{
            throw new Error('Something seems to be wrong')
          }
        })
      }else if(customers.Debt > 0 && update.registeredBalance  < updatedBill.grandTotal + customers.Debt){
        res.status(301).json({message:`This customer is owing the business N${customers.Debt}`})
      }else if(customers.Debt > 0 && update.registeredBalance >= updatedBill.grandTotal + customers.Debt){
        await bills.updateOne({ _id: ObjectId(req.params.id) }, { $set: update})
        .then(async (bill) =>{
          if(bill.acknowledged){
            await updatedBill.ActivityLog.unshift({logMsg:`Accountant Remarks: (${update.paymentMethod}:N${update.registeredBalance}) ,${update.remark}.`,status:`Previous Debit cleared: N${customers.Debt }`})
            updatedBill.save()
            customers.Debt = 0
            customers.save()
            next()
          }else{
            throw new Error('Something seems to be wrong')
          }
        })
      }else{
        if(updatedBill.grandTotal - update.registeredBalance > customers.creditLimit){
          throw new Error('Credit limit exceeded')
        }else{
          await bills.updateOne({ _id: ObjectId(req.params.id) }, { $set: update})
        .then(async (bill) =>{
          if(bill.acknowledged){
            await updatedBill.ActivityLog.unshift({logMsg:`Accountant Remarks: (${update.paymentMethod}:N${update.registeredBalance}) ,${update.remark}.`,status:`Debit recorded: N${ updatedBill.grandTotal - update.registeredBalance }`})
            updatedBill.save()
            customers.Debt = updatedBill.grandTotal - update.registeredBalance 
            customers.save()
            next()
          }else{
            throw new Error('Something seems to be wrong')
          }
        })
        }
        
      }
    })
   } catch (error) {
    res.status(500).json({ error:error.message })
   }
  }
};


module.exports.Report_get = async(req, res, next)=>{
  res.render('reports',{});
}