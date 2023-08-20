const mongoose = require('mongoose')
var id = new mongoose.Types.ObjectId;

const BillsSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Types.ObjectId,ref:'customers',
        required:true,
    },
    grandTotal:{type:Number},
    shippingFee:{type:Number},
    subTotal:{type:Number},
    startDate:{
        type:Date,
        required:true,
    },
    dueDate:{
        type:Date,
    },
    paymentMethod:{type:String},
    orders:[],
    promotionItems:[],
    billStatus:{
        type:String,
        default:'Quotation'
    },
    status:{
        type:String,
    },
    bankAccount:{type:String},
    discount:{type:Number},
    taxRate:{},
    whId:{
        type:mongoose.Types.ObjectId,
        ref:'whouses',
        required:true,
    },
    salesPerson:{type:String},
    signatureUrl:{type:String},
    ActivityLog:[],
    rejectionReasons:String,
    registeredBalance:{type:Number},//amount collected from account alerts or cash payment
    isDelivered:{type:Boolean,default:false},//for delivery
    PaymentStatus:{type:String},//type of payment status either fully paid or half paid
    DELIVERYDATE:{type:Date},//delivery date of delivery order
    billReferenceNo:{type:String},//reference to eacch bill
    supportDoc:{type:String},//uploaded bank payment reference
    DriverNumber:String,
    DriverName:String,
    vehicleNumber:String,
    DeliveryComment:String,
    customerName:String,
})

const bills = mongoose.model('bill',BillsSchema)

module.exports = bills