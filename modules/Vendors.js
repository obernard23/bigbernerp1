const mongoose = require('mongoose');
const { isEmail} = require('validator');

const VendorSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:[true,'Provide a Product Name'],
        unique: true
    },
    w_Location:{
        type:String,
        required:[true,'Provide vendor']
    },
    Address:{
        type:String,
    },
    image:{
        type:String,
    },
    vendor_tel:{
        type:String,
    },
    email:{
        type:String,
        unique: true
    },
    Manufacturer:{
        type:String
    },
    Categories:{
        type:String
    },
    ActivityLog:{
        type:Array
    },
    Products:{
        type:Array
    },
    block_vendor:{
        type:Boolean,
        default:true,
    },
    Account_num:{
        type:String,
    },
    Account_name:{
        type:String
    },
    Bank_name:{
        type:String
    },
    PurchaseLimit:{
        type:Number,
    },
    purchsaeOrder:[]

},{timestamps:true})

const  Vendor = mongoose.model(' Vendor',VendorSchema);

module.exports = Vendor