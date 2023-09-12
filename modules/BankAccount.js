const mongoose = require('mongoose')

const bankAccountSchema = new mongoose.Schema( {  

    NAME:{
        type:String,
        required:true
    },
    AccountNum:{
        required:true,
        type:String,
    },
    inactive:{
        default:true,
        type:Boolean,
    },
    Balance:{
        type:Number,
        default:0,
    },
    AccountType:{
        required:true,
        type:String,
    },
    logo:String,
    bankName:String,
   
},{timestamps:true})

const bankAccount = mongoose.model('Account', bankAccountSchema);

module.exports = bankAccount