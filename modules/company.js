const mongoose = require('mongoose')

const ProductTransferSchema = new mongoose.Schema({
   
    AnniversiryDate:String,
    
    
},{timestamps:true})

const ProductTransfer = mongoose.model('ProductTransfer', ProductTransferSchema)

module.exports = ProductTransfer