const mongoose = require('mongoose')

const VendorPaymentSchema = new mongoose.Schema( {  

    billReferenceNo:{
        type:String,
        required: true
    },
    AccountatntId:{//person who actions the payment
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    ActivityLog:Array,
    Amount:Number,
    PaymentDate:String,
    status:{
        type:String,
        default:"pending"
    },
    bankAccount:{
        type: String,
    },
    remarks:String,
    Vendor: {
        type: mongoose.Types.ObjectId,
        ref: 'Vendor'
    }
   
},{timestamps:true})

const VendorPayment = mongoose.model('VendorBill', VendorPaymentSchema);

module.exports = VendorPayment