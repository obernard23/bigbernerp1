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
    orders:[
        // {
        //     type: new mongoose.Types.ObjectId,
        // }
    ],
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
    rejectionReasons:[],
    registeredBilling:{type:Number},//amount collected from account alerts or cash payment
    registeredBalance:{
        type:Number,
        default: 0
    },//amount collected from account alerts or cash payment minus to bill amount
    PaymentStatus:{type:String},//type of payment status either fully paid or half paid
    PaymentReference:{type:String},//type of payment reference from bank alert description
    billReferenceNo:{type:String},//reference to eacch bill
    supportDoc:{type:String},//uploaded bank payment reference
    supportDoc2:{type:String},//uploaded bank payment reference
})

const bills = mongoose.model('bill',BillsSchema)

module.exports = bills