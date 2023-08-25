const mongoose = require('mongoose')

const Expense = new mongoose.Schema ( {  

    refNo:{
        type:Number,
        required: true
    },
    RaiseBy:String,
    initiatorId:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    payee:String,
    BankAccount:String,
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
    }
})

const WHExpense = mongoose.model('Expense', Expense);

 module.exports = WHExpense