const mongoose = require('mongoose')

const VendorPaymentSchema = new mongoose.Schema( {  

    billReferenceNo:{
        type:String,
        required: true
    },
    initiatorId:{//person who actions the payment
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    BankAccount:String,
    ActivityLog:Array,
    Attachment:String,
    Amount:Number,
    PaymentDate:String,
    status:{
        type:String,
        default:"pending"
    },
    BankJornal:{
        type:mongoose.Types.ObjectId,
        ref:'Account'
    },
    remarks:String,
    Vendor: {
        type: mongoose.Types.ObjectId,
        ref: 'Vendor'
    }
   
},{timestamps:true})

const VendorPayment = mongoose.model('VendorBill', VendorPaymentSchema);

module.exports = VendorPayment