const mongoose = require('mongoose')

const Expense = new mongoose.Schema ( {  

    refNo:{
        type:Number,
        required: true
    },
    initiatorId:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    payee:String,
    payeebankAccount:{
        type: String,
    },
    ActivityLog:Array,
    Attachment:String,
    Amount:Number,
    Date:String,
    status:{
        type:String,
        default:"pending"
    },
    category:String,
    Signature:String,
    remarks:String,
    WHID:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse'
    },
    BankAccount:String,//for journal
    payeeBankName:String,
    mailSent:{
        default:false,
        type:Boolean,
    },
    Accountant:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    paymentDate:String
},{timestamps:true})

const WHExpense = mongoose.model('Expense', Expense);

 module.exports = WHExpense