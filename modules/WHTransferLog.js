const mongoose = require('mongoose')

const ProductTransferSchema = new mongoose.Schema({
    WHID: {
        type: mongoose.Types.ObjectId,
        ref: 'Whouse',
        required: true,
    },
    orders: [],
    billReferenceNo: {
        type: String,
    },
    managerStatus: {
        type: String,
        default:'pending'
    },
    ActivityLog: [],
    recievedDate:String,
    transferedDate:String,
    
},{timestamps:true})

const ProductTransfer = mongoose.model('ProductTransfer', ProductTransferSchema)

module.exports = ProductTransfer