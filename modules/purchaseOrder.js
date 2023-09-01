const mongoose = require('mongoose')

const PurchaseOrderSchema = new mongoose.Schema({
    Vendor: {
        type: mongoose.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    orders: [],
    shippingFee: { type: Number,default:0 },
    subTotal: { type: Number ,default:0},
    grandTotal: { type: Number,default:0 },
    discount: { type: Number, default:0},
    taxRate: {type: Number,default:0},
    billReferenceNo: {
        type: String,
    },
    paymentStatus: {
        type: String,
        default:'pending'
    },
    ActivityLog: [],
   
},{timestamps:true})

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema)

module.exports = PurchaseOrder