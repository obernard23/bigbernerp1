const mongoose = require('mongoose')

const Scrap = new mongoose.Schema ( {  

    initiatorId:{
        type:mongoose.Types.ObjectId,
        ref:'storeProduct'
    },
    ActivityLog:Array,
    Attachment:String,
    Date:String,
    status:{
        type:String,
        default:"pending"
    },
    category:String,
    remarks:String,
    WHID:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse'
    },
    mailSent:{
        default:false,
        type:Boolean,
    },
},{timestamps:true})

const WHScrap = mongoose.model('Scrap', Scrap);

 module.exports = WHScrap