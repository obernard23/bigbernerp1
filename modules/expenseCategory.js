const mongoose = require('mongoose')

const ExpenseCategorySchema = new mongoose.Schema( {  

    NAME:{//person who actions the payment
        type:String,
        required:true
    },
    AccountNum:{
        required:true,
        type:String,
    },
    
},{timestamps:true})

const ExpenseCat = mongoose.model('ExpenseCategory', ExpenseCategorySchema);

module.exports = ExpenseCat