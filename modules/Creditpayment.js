const mongoose = require('mongoose')

const CreditPaymentSchema = new mongoose.Schema( {  

    paymentReferenceNo:{
        type:String,
        unique:true,
    },
    Accountant:{//person who actions the payment
        type:mongoose.Types.ObjectId,
        ref:'Employees',
        required: true
    },
    ActivityLog:Array,
    Attachment:String,
    Amount:Number,
    PaymentDate:String,
    bankAccount:{
        type: String,

    },
    remarks:String,
    customer: {
        type: mongoose.Types.ObjectId,
        ref: 'customer',
        required: true
    },
    previousBalance:Number
   
},{timestamps:true})

const CreditCustomerPayment = mongoose.model('creditPayment', CreditPaymentSchema);

module.exports = CreditCustomerPayment